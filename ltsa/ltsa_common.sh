#!/bin/ksh

# Shared, portable ksh helpers for the LTSA batch scripts.

ltsa_log()
{
    print -- "$*" >&2
}

ltsa_die()
{
    ltsa_log "ERROR: $*"
    return 1
}

ltsa_require_command()
{
    command -v "$1" >/dev/null 2>&1 || {
        ltsa_log "ERROR: required command not found: $1"
        return 1
    }
}

ltsa_acquire_lock()
{
    LTSA_LOCKDIR=$1
    if mkdir "$LTSA_LOCKDIR" 2>/dev/null; then
        print -- "$$" > "$LTSA_LOCKDIR/pid" 2>/dev/null || {
            rmdir "$LTSA_LOCKDIR" 2>/dev/null
            ltsa_log "ERROR: cannot initialize lock: $LTSA_LOCKDIR"
            return 1
        }
        return 0
    fi

    lock_pid=""
    if [ -r "$LTSA_LOCKDIR/pid" ]; then
        IFS= read lock_pid < "$LTSA_LOCKDIR/pid"
    fi
    ltsa_log "ERROR: another LTSA job holds $LTSA_LOCKDIR${lock_pid:+ (pid $lock_pid)}"
    return 1
}

ltsa_release_lock()
{
    if [ -n "${LTSA_LOCKDIR:-}" ] && [ -d "$LTSA_LOCKDIR" ]; then
        rm -f "$LTSA_LOCKDIR/pid" 2>/dev/null
        rmdir "$LTSA_LOCKDIR" 2>/dev/null
    fi
    LTSA_LOCKDIR=""
}

ltsa_is_retryable_http()
{
    case "$1" in
        409|423|429|5??) return 0 ;;
        *) return 1 ;;
    esac
}

ltsa_is_retryable_curl()
{
    # Name resolution, connection, timeout, truncated/empty responses, and
    # transport failures. Local file/configuration errors are not retryable.
    case "$1" in
        5|6|7|18|28|35|47|52|55|56|92) return 0 ;;
        *) return 1 ;;
    esac
}

ltsa_retry_delay()
{
    case "$1" in
        1) print -- 0 ;;
        2) print -- 1 ;;
        3) print -- 2 ;;
        4) print -- 4 ;;
        *) print -- 8 ;;
    esac
}

ltsa_json_string()
{
    jq -Rn --arg value "$1" '$value'
}

ltsa_emit_result()
{
    result_status=$1
    result_operation=$2
    result_file=$3
    result_message=$4
    result_count=${5:-0}

    printf '{"event":"ltsa_completion","status":%s,"operation":%s,"file":%s,"message":%s,"count":%s}\n' \
        "$(ltsa_json_string "$result_status")" \
        "$(ltsa_json_string "$result_operation")" \
        "$(ltsa_json_string "$result_file")" \
        "$(ltsa_json_string "$result_message")" \
        "$result_count"
}

ltsa_resolve_file()
{
    candidate=$1
    script_dir=$2
    case "$candidate" in
        /*)
            [ -f "$candidate" ] && print -- "$candidate"
            ;;
        *)
            if [ -f "$candidate" ]; then
                candidate_dir=$(dirname "$candidate") || return 1
                candidate_base=$(basename "$candidate") || return 1
                (
                    cd "$candidate_dir" 2>/dev/null || exit 1
                    print -- "$PWD/$candidate_base"
                )
            elif [ -f "$script_dir/$candidate" ]; then
                (
                    cd "$script_dir" 2>/dev/null || exit 1
                    print -- "$PWD/$candidate"
                )
            fi
            ;;
    esac
}
