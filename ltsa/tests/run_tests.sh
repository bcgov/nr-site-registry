#!/bin/ksh

TEST_DIR=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || exit 1
LTSA_DIR=$(cd "$TEST_DIR/.." 2>/dev/null && pwd) || exit 1
JQ=$(command -v jq) || {
    print -- "jq is required to run LTSA tests" >&2
    exit 1
}
WORK="${TMPDIR:-/tmp}/ltsa_tests.$$"
mkdir "$WORK" || exit 1
trap 'rm -rf "$WORK"' 0 1 2 3 15

passed=0
failed=0

assert_test()
{
    name=$1
    shift
    if "$@"; then
        print -- "ok - $name"
        passed=$((passed + 1))
    else
        print -- "not ok - $name"
        failed=$((failed + 1))
    fi
}

mkdir "$WORK/bin" || exit 1

cat > "$WORK/bin/token" <<'EOF'
#!/bin/ksh
print -- mock-token
EOF

cat > "$WORK/bin/curl" <<'EOF'
#!/bin/ksh
body_file=""
all_args="$*"
while [ $# -gt 0 ]; do
    case "$1" in
        -o) body_file=$2; shift 2 ;;
        *) shift ;;
    esac
done
count=0
[ ! -f "$MOCK_CURL_COUNT" ] || IFS= read count < "$MOCK_CURL_COUNT"
count=$((count + 1))
print -- "$count" > "$MOCK_CURL_COUNT"

case "${MOCK_SCENARIO:-success}" in
    dump_retry)
        if [ "$count" -eq 1 ]; then
            print -- '{"status":"unavailable"}' > "$body_file"
            print -n -- 503
        else
            print -- '{"status":"success","count":2,"data":["000000002","000000001"]}' > "$body_file"
            print -n -- 200
        fi
        ;;
    load_400)
        print -- '{"status":"error","message":"bad input"}' > "$body_file"
        print -n -- 400
        ;;
    load_warning)
        print -- '{"status":"warning","message":"accepted with warnings","count":3}' > "$body_file"
        print -n -- 200
        ;;
    dump_invalid_pid)
        print -- '{"status":"success","count":1,"data":["123"]}' > "$body_file"
        print -n -- 200
        ;;
    curl_local_error)
        exit 26
        ;;
    *)
        print -- '{"status":"success","count":1,"data":["000000001"]}' > "$body_file"
        print -n -- 200
        ;;
esac
exit 0
EOF
chmod +x "$WORK/bin/token" "$WORK/bin/curl"

test_dump_retry_atomic()
(
    test_work="$WORK/dump"
    mkdir "$test_work" || exit 1
    print -- stale > "$test_work/output.txt"
    PATH="$WORK/bin:$PATH" \
    MOCK_SCENARIO=dump_retry \
    MOCK_CURL_COUNT="$test_work/count" \
    LTSA_TOKEN_COMMAND="$WORK/bin/token" \
    LTSA_MAX_RETRIES=2 \
    API_URL=http://mock \
    OUTPUT_FILE="$test_work/output.txt" \
        "$LTSA_DIR/lto_dump.sh" 1 > "$test_work/result"
    [ $? -eq 0 ] || exit 1
    [ "$(IFS= read n < "$test_work/count"; print -- "$n")" = 2 ] || exit 1
    [ "$(wc -l < "$test_work/output.txt" | tr -d ' ')" = 2 ] || exit 1
    ! fgrep stale "$test_work/output.txt" >/dev/null 2>&1 || exit 1
    "$JQ" -e '.event == "ltsa_completion" and .status == "success"' "$test_work/result" >/dev/null
)

test_load_nonretryable()
(
    test_work="$WORK/load400"
    mkdir "$test_work" || exit 1
    print -- data > "$test_work/input.txt"
    PATH="$WORK/bin:$PATH" \
    MOCK_SCENARIO=load_400 \
    MOCK_CURL_COUNT="$test_work/count" \
    LTSA_TOKEN_COMMAND="$WORK/bin/token" \
    LTSA_MAX_RETRIES=5 \
    API_URL=http://mock \
        "$LTSA_DIR/lto_load_new.sh" "$test_work/input.txt" >/dev/null 2>&1
    [ $? -ne 0 ] || exit 1
    [ "$(IFS= read n < "$test_work/count"; print -- "$n")" = 1 ]
)

test_dump_rejects_invalid_pid()
(
    test_work="$WORK/dump-invalid"
    mkdir "$test_work" || exit 1
    PATH="$WORK/bin:$PATH" \
    MOCK_SCENARIO=dump_invalid_pid \
    MOCK_CURL_COUNT="$test_work/count" \
    LTSA_TOKEN_COMMAND="$WORK/bin/token" \
    API_URL=http://mock \
    OUTPUT_FILE="$test_work/output.txt" \
        "$LTSA_DIR/lto_dump.sh" 1 >/dev/null 2>&1
    [ $? -ne 0 ] || exit 1
    [ ! -e "$test_work/output.txt" ]
)

test_load_warning_path_resolution()
(
    test_work="$WORK/loadwarning"
    mkdir "$test_work" || exit 1
    print -- data > "$test_work/input.txt"
    cd "$test_work" || exit 1
    resolved_work=$PWD
    PATH="$WORK/bin:$PATH" \
    MOCK_SCENARIO=load_warning \
    MOCK_CURL_COUNT="$test_work/count" \
    LTSA_TOKEN_COMMAND="$WORK/bin/token" \
    API_URL=http://mock \
        "$LTSA_DIR/lto_load_new.sh" input.txt > result.json
    [ $? -eq 0 ] || exit 1
    "$JQ" -e '.status == "warning" and .file == "'"$resolved_work"'/input.txt"' result.json >/dev/null
)

test_nonretryable_curl_exit()
(
    test_work="$WORK/curl26"
    mkdir "$test_work" || exit 1
    print -- data > "$test_work/input.txt"
    PATH="$WORK/bin:$PATH" \
    MOCK_SCENARIO=curl_local_error \
    MOCK_CURL_COUNT="$test_work/count" \
    LTSA_TOKEN_COMMAND="$WORK/bin/token" \
    LTSA_MAX_RETRIES=5 \
    API_URL=http://mock \
        "$LTSA_DIR/lto_load_new.sh" "$test_work/input.txt" >/dev/null 2>&1
    [ $? -ne 0 ] || exit 1
    [ "$(IFS= read n < "$test_work/count"; print -- "$n")" = 1 ]
)

test_reconciliation()
(
    test_work="$WORK/reconcile"
    mkdir "$test_work" || exit 1
    printf '002\r\n001  \n' > "$test_work/a"
    printf '001\n002\n' > "$test_work/b"
    "$LTSA_DIR/reconcile_ltsa.sh" "$test_work/a" "$test_work/b" |
        jq -e '.dump_match == true and .outcome_match == true' >/dev/null
)

test_full_state_reconciliation()
(
    test_work="$WORK/full-reconcile"
    mkdir "$test_work" || exit 1
    for name in dump1-old dump1-new dump2-old dump2-new subdivisions-old subdivisions-new links-old links-new; do
        : > "$test_work/$name"
    done
    printf '000000002\n000000001\n' > "$test_work/dump1-old"
    printf '000000001\r\n000000002\n' > "$test_work/dump1-new"
    printf '025000000\n' > "$test_work/dump2-old"
    printf '025000000\n' > "$test_work/dump2-new"
    printf '000000001\tA\tLEGAL DESCRIPTION\n' > "$test_work/subdivisions-old"
    printf '000000001\tA\tLEGAL DESCRIPTION\n' > "$test_work/subdivisions-new"
    printf '1\t10\n' > "$test_work/links-old"
    printf '1\t10\n' > "$test_work/links-new"

    "$LTSA_DIR/reconcile_ltsa_state.sh" \
        "$test_work/dump1-old" "$test_work/dump1-new" \
        "$test_work/dump2-old" "$test_work/dump2-new" \
        "$test_work/subdivisions-old" "$test_work/subdivisions-new" \
        "$test_work/links-old" "$test_work/links-new" |
        jq -e '.all_match == true and (.comparisons | length) == 4' >/dev/null
)

assert_test "dump retries transient HTTP and replaces atomically" test_dump_retry_atomic
assert_test "dump rejects malformed PID values" test_dump_rejects_invalid_pid
assert_test "load does not retry HTTP 400" test_load_nonretryable
assert_test "load resolves caller-relative path and accepts warning" test_load_warning_path_resolution
assert_test "load does not retry local curl failures" test_nonretryable_curl_exit
assert_test "reconciliation normalizes line endings and order" test_reconciliation
assert_test "full reconciliation compares dumps and domain state" test_full_state_reconciliation

print -- "$passed passed, $failed failed"
[ "$failed" -eq 0 ]
