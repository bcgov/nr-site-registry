/**
 * Ensures the URL-selected site appears in the marker list when it is not
 * returned by mapSearch (e.g. "View on Map" from site details).
 */
export function buildSitesToShow<T extends { id: string | number }>(
  sites: T[],
  selectedSiteId: string | null | undefined,
  selectedSite:
    | (T & { latdeg?: number | null; longdeg?: number | null })
    | null
    | undefined,
): T[] {
  if (!selectedSiteId || !selectedSite?.latdeg || !selectedSite?.longdeg) {
    return sites;
  }
  const alreadyInList = sites.some(
    (s) => String(s.id) === String(selectedSiteId),
  );
  if (alreadyInList) {
    return sites;
  }
  return [...sites, { ...selectedSite, id: selectedSiteId } as T];
}
