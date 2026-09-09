import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';

export const DEFAULT_SITE_TAB = 'summary' as const;

export const SITE_TAB_PATHS = [
  'summary',
  'notations',
  'participants',
  'documents',
  'associated',
  'landuses',
  'parceldesc',
  'disclosure',
  'updates',
] as const;

export type SiteTabPath = (typeof SITE_TAB_PATHS)[number];

export type SiteTabItem = {
  label: string;
  value: SiteTabPath;
};

const SITE_TAB_ITEMS: Record<SiteTabPath, SiteTabItem> = {
  summary: { label: 'Summary', value: 'summary' },
  notations: { label: 'Notations', value: 'notations' },
  participants: { label: 'Site Participants', value: 'participants' },
  documents: { label: 'Documents', value: 'documents' },
  associated: { label: 'Associated Sites', value: 'associated' },
  landuses: { label: 'Suspect Land Uses', value: 'landuses' },
  parceldesc: { label: 'Parcel Description', value: 'parceldesc' },
  disclosure: { label: 'Site Disclosure', value: 'disclosure' },
  updates: { label: 'Updates', value: 'updates' },
};

const MAIN_SITE_TABS: SiteTabItem[] = SITE_TAB_PATHS.filter(
  (path): path is Exclude<SiteTabPath, 'updates'> => path !== 'updates',
).map((path) => SITE_TAB_ITEMS[path]);

export function isSiteTabPath(
  value: string | undefined | null,
): value is SiteTabPath {
  return SITE_TAB_PATHS.includes(value as SiteTabPath);
}

export function getSiteTabFromPathname(
  pathname: string,
): SiteTabPath | undefined {
  const segment = pathname.split('/').filter(Boolean).pop();
  return isSiteTabPath(segment) ? segment : undefined;
}

export function getLegacyTabFlag(
  searchParams: URLSearchParams,
): SiteTabPath | undefined {
  return SITE_TAB_PATHS.find(
    (tab) => searchParams.has(tab) && searchParams.get(tab) === '',
  );
}

export function shouldShowUpdatesTab({
  hasPendingUpdates,
  mode,
}: {
  hasPendingUpdates: boolean;
  mode: SiteDetailsMode;
}): boolean {
  if (!isUserOfType(UserRoleType.SR) || !hasPendingUpdates) {
    return false;
  }
  if (mode === SiteDetailsMode.EditMode) {
    return false;
  }
  if (isUserOfType(UserRoleType.INTERNAL) && mode !== SiteDetailsMode.SRMode) {
    return false;
  }
  return true;
}

export function getSiteTabCatalog(includeUpdatesTab: boolean): SiteTabItem[] {
  if (isUserOfType(UserRoleType.SR) && includeUpdatesTab) {
    return [SITE_TAB_ITEMS.updates, ...MAIN_SITE_TABS];
  }
  return MAIN_SITE_TABS;
}
