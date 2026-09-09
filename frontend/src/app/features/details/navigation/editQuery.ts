import { UserType } from '../../../helpers/requests/userType';

export const EDIT_QUERY_KEY = 'edit';

export type EditQueryDecision =
  | { action: 'noop' }
  | { action: 'strip' }
  | { action: 'enterEdit' };

const searchParamsFrom = (search: string): URLSearchParams =>
  new URLSearchParams(search.startsWith('?') ? search : `?${search}`);

export function hasEditParam(search: string): boolean {
  return searchParamsFrom(search).has(EDIT_QUERY_KEY);
}

export function stripEditParam(search: string): string {
  const params = searchParamsFrom(search);
  params.delete(EDIT_QUERY_KEY);
  const remaining = params.toString();
  return remaining ? `?${remaining}` : '';
}

export function decideEditQueryAction({
  userType,
  hasSiteId,
}: {
  userType: UserType | null;
  hasSiteId: boolean;
}): EditQueryDecision {
  if (userType === null) {
    return { action: 'noop' };
  }
  if (userType === UserType.External || !hasSiteId) {
    return { action: 'strip' };
  }
  return { action: 'enterEdit' };
}

let pendingEnterEditPath: string | null = null;

export function markPendingEnterEdit(pathname: string) {
  pendingEnterEditPath = pathname;
}

export function hasPendingEnterEdit(pathname: string): boolean {
  return pendingEnterEditPath === pathname;
}

export function clearPendingEnterEdit() {
  pendingEnterEditPath = null;
}

export function resetEditQueryState() {
  pendingEnterEditPath = null;
}
