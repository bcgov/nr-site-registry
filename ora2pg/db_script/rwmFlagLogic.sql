DO $$
DECLARE
    tbl RECORD;
    check_column  TEXT := 'rwm_flag';    -- column to check
    match_value   TEXT := '50';          -- value to match
    schema_name   TEXT := 'sites';       -- schema name
    update_column TEXT := 'sr_action';   -- column to update
    sql_cmd TEXT;
    updated_count BIGINT;
BEGIN
    FOR tbl IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = check_column
          AND table_schema = schema_name
    LOOP
        -- Only proceed if the update column exists in this table
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = tbl.table_schema
              AND table_name   = tbl.table_name
              AND column_name  = update_column
        ) THEN
            -- Build UPDATE: compare match_value against split tokens, cast to int[]
            sql_cmd := format(
                $SQL$
                UPDATE %I.%I
                   SET %I = 'public'
                 WHERE %L::int = ANY(regexp_split_to_array(%I::text, '\s*,\s*')::int[])
                $SQL$,
                tbl.table_schema,
                tbl.table_name,
                update_column,
                match_value,
                check_column
            );

            RAISE NOTICE 'Executing: %', sql_cmd;

            EXECUTE sql_cmd;
            GET DIAGNOSTICS updated_count = ROW_COUNT;

            RAISE NOTICE 'Updated table: %.% | Rows affected: %',
                tbl.table_schema, tbl.table_name, updated_count;
        ELSE
            RAISE NOTICE 'Skipped table (no column %): %.%',
                update_column, tbl.table_schema, tbl.table_name;
        END IF;
    END LOOP;
END$$;
END;