import { FormFieldType } from '../../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';

export enum ParcelDescriptionType {
  ParcelID = 'Parcel ID',
  CrownLandPIN = 'Crown Land PIN',
  CrownLandFileNumber = 'Crown Land File Number',
}

export const columns: TableColumn[] = [
  {
    id: 1,
    displayName: 'Description Type',
    active: true,
    graphQLPropertyName: 'descriptionType',
    columnSize: ColumnSize.Default,
    displayType: {
      type: FormFieldType.DropDown,
      label: 'DescriptionType',
      graphQLPropertyName: 'descriptionType',
      options: [
        {
          key: ParcelDescriptionType.ParcelID,
          value: ParcelDescriptionType.ParcelID,
        },
        {
          key: ParcelDescriptionType.CrownLandPIN,
          value: ParcelDescriptionType.CrownLandPIN,
        },
        {
          key: ParcelDescriptionType.CrownLandFileNumber,
          value: ParcelDescriptionType.CrownLandFileNumber,
        },
      ],
      tableMode: true,
    },
  },
  {
    id: 2,
    displayName: 'ID/PIN/Number',
    active: true,
    graphQLPropertyName: 'idPinNumber',
    columnSize: ColumnSize.Default,
    displayType: {
      type: FormFieldType.Text,
      label: 'ID/PIN/Number',
      graphQLPropertyName: 'idPinNumber',
      value: '',
      tableMode: true,
    },
  },
  {
    id: 3,
    displayName: 'Date Noted',
    active: true,
    graphQLPropertyName: 'dateNoted',
    columnSize: ColumnSize.Default,
    displayType: {
      type: FormFieldType.Date,
      label: 'Date Noted',
      graphQLPropertyName: 'dateNoted',
      value: '',
      tableMode: true,
    },
  },
  {
    id: 4,
    displayName: 'Land Description',
    active: true,
    graphQLPropertyName: 'landDescription',
    columnSize: ColumnSize.Triple,
    displayType: {
      type: FormFieldType.Text,
      label: 'Land Description',
      graphQLPropertyName: 'landDescription',
      value: '',
      tableMode: true,
      isDisabled: true,
    },
  },
];

const SRColumn: TableColumn = {
  id: 4,
  displayName: 'SR',
  active: true,
  graphQLPropertyName: 'srAction',
  columnSize: ColumnSize.Default,
  displayType: {
    type: FormFieldType.Checkbox,
    label: 'SR',
    placeholder: '',
    graphQLPropertyName: 'srAction',
    value: false,
    tableMode: true,
  },
};

export const getParcelDescriptionsTableColumns = (
  viewMode: SiteDetailsMode,
): TableColumn[] => {
  if (viewMode === SiteDetailsMode.SRMode) {
    return [...columns, SRColumn];
  } else {
    return columns;
  }
};
