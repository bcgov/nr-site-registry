#!/bin/ksh

# Compare normalized LTSA dump files and, optionally, completion-event logs.
# Usage: reconcile_ltsa.sh dump_a dump_b [outcomes_a outcomes_b]

SCRIPT_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || exit 1
. "$SCRIPT_DIR/ltsa_common.sh" || exit 1

left=${1:-}
right=${2:-}
left_outcomes=${3:-}
right_outcomes=${4:-}
if [ -z "$left" ] || [ -z "$right" ] || [ ! -f "$left" ] || [ ! -f "$right" ]; then
    ltsa_log "Usage: $0 <dump-a> <dump-b> [outcomes-a outcomes-b]"
    exit 2
fi
if { [ -n "$left_outcomes" ] && [ -z "$right_outcomes" ]; } ||
   { [ -z "$left_outcomes" ] && [ -n "$right_outcomes" ]; }; then
    ltsa_log "ERROR: provide both outcome logs or neither"
    exit 2
fi

work_dir="${TMPDIR:-/tmp}/ltsa_reconcile.$$"
if ! mkdir "$work_dir"; then
    ltsa_log "ERROR: cannot create reconciliation workspace"
    exit 1
fi
trap 'rm -rf "$work_dir"' 0 1 2 3 15

normalize_dump()
{
    awk '{
        sub(/\r$/, "")
        sub(/[[:space:]]+$/, "")
        if (length($0) > 0) print
    }' "$1" | LC_ALL=C sort > "$2"
}

normalize_outcomes()
{
    : > "$2" || return 1
    while IFS= read line; do
        case "$line" in
            '{"event":"ltsa_completion"'*)
                print -r -- "$line" |
                    jq -cS '{status,operation,file:(.file | split("/")[-1]),count}' \
                    >> "$2" 2>/dev/null || return 1
                ;;
        esac
    done < "$1"
    LC_ALL=C sort "$2" -o "$2"
}

normalize_dump "$left" "$work_dir/left.dump" || exit 1
normalize_dump "$right" "$work_dir/right.dump" || exit 1

dump_match=true
if ! diff "$work_dir/left.dump" "$work_dir/right.dump" > "$work_dir/dump.diff"; then
    dump_match=false
    ltsa_log "Dump differences:"
    while IFS= read line; do ltsa_log "$line"; done < "$work_dir/dump.diff"
fi

outcome_match=true
if [ -n "$left_outcomes" ]; then
    [ -f "$left_outcomes" ] && [ -f "$right_outcomes" ] || {
        ltsa_log "ERROR: outcome log not found"
        exit 2
    }
    ltsa_require_command jq || exit 1
    normalize_outcomes "$left_outcomes" "$work_dir/left.outcomes" || exit 1
    normalize_outcomes "$right_outcomes" "$work_dir/right.outcomes" || exit 1
    if ! diff "$work_dir/left.outcomes" "$work_dir/right.outcomes" > "$work_dir/outcomes.diff"; then
        outcome_match=false
        ltsa_log "Outcome differences:"
        while IFS= read line; do ltsa_log "$line"; done < "$work_dir/outcomes.diff"
    fi
fi

printf '{"event":"ltsa_reconciliation","dump_match":%s,"outcome_match":%s}\n' \
    "$dump_match" "$outcome_match"
[ "$dump_match" = true ] && [ "$outcome_match" = true ]
