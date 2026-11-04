import { IFormField } from '../../../components/input-controls/IFormField';
import { ColumnSize } from '../../../components/grid/columnSize';

export type SearchResultColumn = {
  id: number;
  displayName: string;
  active: boolean;
  graphQLPropertyName: string;
  groupId?: number;
  disabled?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  isChecked?: boolean;
  displayType?: IFormField;
  linkRedirectionURL?: string;
  dynamicColumn?: boolean;
  customHeaderCss?: string;
  columnSize?: ColumnSize;
  stickyCol?: boolean;
};

export function searchResultColumn(
  id: number,
  displayName: string,
  active: boolean,
  graphQLPropertyName: string,
  groupId?: number,
  disabled?: boolean,
  isDefault?: boolean,
  sortOrder?: number,
  isChecked?: boolean,
  displayType?: IFormField,
  linkRedirectionURL?: string,
  dynamicColumn?: boolean,
  customHeaderCss?: string,
  columnSize?: ColumnSize,
  stickyCol?: boolean,
): SearchResultColumn {
  return {
    id,
    displayName,
    active,
    graphQLPropertyName,
    groupId,
    disabled,
    isDefault,
    sortOrder,
    isChecked,
    displayType,
    linkRedirectionURL,
    dynamicColumn: dynamicColumn ?? false,
    customHeaderCss,
    columnSize,
    stickyCol,
  };
}
