import { IFormField } from '../input-controls/IFormField';
import { ColumnSize } from './columnSize';

export interface SectionColumn {
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
}

export function sectionColumn(
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
): SectionColumn {
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
