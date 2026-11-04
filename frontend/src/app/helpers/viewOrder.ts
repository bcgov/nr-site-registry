export function orderedByDate<Row>(
  rows: Row[],
  dateOf: (row: Row) => unknown,
  newestFirst: boolean,
): Row[] {
  return [...rows].sort((left, right) => {
    const leftTime = new Date(dateOf(left) as string | number | Date).getTime();
    const rightTime = new Date(
      dateOf(right) as string | number | Date,
    ).getTime();
    const safeLeft = Number.isNaN(leftTime) ? 0 : leftTime;
    const safeRight = Number.isNaN(rightTime) ? 0 : rightTime;
    return newestFirst ? safeRight - safeLeft : safeLeft - safeRight;
  });
}
