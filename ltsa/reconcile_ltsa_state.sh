#!/bin/ksh

# Compare complete legacy/new LTSA reconciliation exports without printing
# legal descriptions. Export each pair with identical columns and delimiters.
# Usage:
#   reconcile_ltsa_state.sh \
#     legacy_dump_1 new_dump_1 legacy_dump_2 new_dump_2 \
#     legacy_subdivisions new_subdivisions \
#     legacy_site_subdivisions new_site_subdivisions

SCRIPT_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || exit 1
. "$SCRIPT_DIR/ltsa_common.sh" || exit 1

if [ "$#" -ne 8 ]; then
    ltsa_log "Usage: $0 <legacy-dump-1> <new-dump-1> <legacy-dump-2> <new-dump-2> <legacy-subdivisions> <new-subdivisions> <legacy-site-subdivisions> <new-site-subdivisions>"
    exit 2
fi

work_dir="${TMPDIR:-/tmp}/ltsa_state_reconcile.$$"
mkdir "$work_dir" || exit 1
trap 'rm -rf "$work_dir"' 0 1 2 3 15

normalize_file()
{
    input_file=$1
    output_file=$2
    unique_rows=$3

    [ -r "$input_file" ] || {
        ltsa_log "ERROR: reconciliation input is not readable: $input_file"
        return 1
    }

    if [ "$unique_rows" = yes ]; then
        awk '{
            sub(/\r$/, "")
            sub(/[[:space:]]+$/, "")
            if (length($0) > 0) print
        }' "$input_file" | LC_ALL=C sort -u > "$output_file"
    else
        awk '{
            sub(/\r$/, "")
            sub(/[[:space:]]+$/, "")
            if (length($0) > 0) print
        }' "$input_file" | LC_ALL=C sort > "$output_file"
    fi
}

compare_pair()
{
    pair_name=$1
    legacy_file=$2
    new_file=$3
    unique_rows=$4

    legacy_normalized="$work_dir/${pair_name}.legacy"
    new_normalized="$work_dir/${pair_name}.new"
    normalize_file "$legacy_file" "$legacy_normalized" "$unique_rows" || return 1
    normalize_file "$new_file" "$new_normalized" "$unique_rows" || return 1

    legacy_count=$(wc -l < "$legacy_normalized" | tr -d ' ')
    new_count=$(wc -l < "$new_normalized" | tr -d ' ')
    if cmp -s "$legacy_normalized" "$new_normalized"; then
        pair_match=true
    else
        pair_match=false
    fi

    printf '{"name":%s,"match":%s,"legacy_count":%s,"new_count":%s}\n' \
        "$(ltsa_json_string "$pair_name")" \
        "$pair_match" \
        "$legacy_count" \
        "$new_count"
    [ "$pair_match" = true ]
}

results_file="$work_dir/results.jsonl"
: > "$results_file" || exit 1
all_match=true

compare_pair dump_1 "$1" "$2" yes >> "$results_file" || all_match=false
compare_pair dump_2 "$3" "$4" yes >> "$results_file" || all_match=false
compare_pair subdivisions "$5" "$6" no >> "$results_file" || all_match=false
compare_pair site_subdivisions "$7" "$8" no >> "$results_file" || all_match=false

ltsa_require_command jq || exit 1
jq -s --argjson all_match "$all_match" \
    '{event:"ltsa_full_reconciliation", all_match:$all_match, comparisons:.}' \
    "$results_file"

[ "$all_match" = true ]
