import { IFormField } from '../input-controls/IFormField';

export enum ColumnSize {
  Default,
  Small,
  XtraSmall,
  Double,
  Triple,
  w400,
  w300,
  w200,
  w100,
  w50,
}

export class TableColumn {
  constructor(
    public id: number,
    public displayName: string,
    public active: boolean,
    public graphQLPropertyName: string,
    public groupId?: number,
    public disabled?: boolean,
    public isDefault?: boolean,
    public sortOrder?: number,
    public isChecked?: boolean,
    public displayType?: IFormField,
    public linkRedirectionURL?: string,
    public dynamicColumn?: boolean,
    public customHeaderCss?: string,
    public columnSize?: ColumnSize,
    public stickyCol?: boolean,
  ) {
    this.dynamicColumn = dynamicColumn ?? false;
  }
}
