import { RequestStatus } from '../../helpers/requests/status';

export interface IWidget {
  title?: string;
  tableIsLoading?: RequestStatus;
  tableColumns?: any[];
  tableData?: any[];
  customLabelCss?: string;
  children?: React.ReactNode;
  allowRowsSelect?: boolean;
  hideTable?: boolean;
  hideTitle?: boolean;
  editMode?: boolean;
  isRequired?: boolean;
  srMode?: boolean;
  currentPage?: number;
  primaryKeycolumnName?: string;
  changeHandler?: (event: any) => void;
  handleCheckBoxChange?: (event: any) => void;
  sortHandler?: (row: any, ascSort: boolean) => void;
  showPageOptions?: boolean;
  widgetIschecked?: boolean;
  hideWidgetCheckbox?: boolean;
  selectPage?: (event: any) => void;
  changeResultsPerPage?: (event: any) => void;
  resultsPerPage?: number;
  totalResults?: number;
  deleteHandler?: (event: any) => void;
  filter?: React.ReactNode;
}
