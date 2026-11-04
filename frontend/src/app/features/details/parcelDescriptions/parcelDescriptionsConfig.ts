import { ColumnSize } from '../../../components/grid/columnSize';
import { SectionColumn } from '../../../components/grid/SectionColumn';
import { FormFieldType } from '../../../components/input-controls/IFormField';

import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';

export enum ParcelDescriptionType {
  ParcelID = 'Parcel ID',
  CrownLandPIN = 'Crown Land PIN',
  CrownLandFileNumber = 'Crown Land File Number',
}

export const columns: SectionColumn[] = [
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
      customLabelCss: 'custom-parcelDescriptions-lbl-text',
      customInputTextCss: 'custom-parcelDescriptions-input-text',
      customEditLabelCss: 'custom-parcelDescriptions-edit-label',
      customEditInputTextCss: 'custom-parcelDescriptions-edit-input',
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
      customLabelCss: 'custom-parcelDescriptions-lbl-text',
      customInputTextCss: 'custom-parcelDescriptions-input-text',
      customEditLabelCss: 'custom-parcelDescriptions-edit-label',
      customEditInputTextCss: 'custom-parcelDescriptions-edit-input',
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
      customLabelCss: 'custom-parcelDescriptions-lbl-text',
      customInputTextCss: 'custom-parcelDescriptions-input-text',
      customEditLabelCss: 'custom-parcelDescriptions-edit-label',
      customEditInputTextCss: 'custom-parcelDescriptions-edit-input',
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
      customLabelCss: 'custom-parcelDescriptions-lbl-text',
      customInputTextCss: 'custom-parcelDescriptions-input-text',
      customEditLabelCss: 'custom-parcelDescriptions-edit-label',
      customEditInputTextCss: 'custom-parcelDescriptions-edit-input',
    },
  },
];

const SRColumn: SectionColumn = {
  id: 4,
  displayName: 'SR',
  active: true,
  graphQLPropertyName: 'srValue',
  displayType: {
    type: FormFieldType.Checkbox,
    label: 'SR',
    placeholder: '',
    graphQLPropertyName: 'srValue',
    value: false,
    tableMode: true,
    stickyCol: true,
  },
  columnSize: ColumnSize.XtraSmall,
  stickyCol: true,
  dynamicColumn: true,
};

const DeleteColumn: SectionColumn = {
  id: 5,
  displayName: 'Remove',
  active: true,
  graphQLPropertyName: 'deleteIcon',
  displayType: {
    type: FormFieldType.DeleteIcon,
    label: 'Delete',
    graphQLPropertyName: 'deleteIcon',
    value: '',
    tableMode: true,
    customLabelCss: 'link-for-table',
    customInputTextCss:
      'link-for-table d-flex align-items-center justify-content-center pt-1 gap-1',
  },
  dynamicColumn: true,
  columnSize: ColumnSize.XtraSmall,
  stickyCol: true,
  customHeaderCss: 'text-center',
};

const parcelSortFieldByColumnId: Record<string, string> = {
  descriptionType: 'description_type',
  idPinNumber: 'id_pin_number',
  dateNoted: 'date_noted',
  landDescription: 'land_description',
};

export function parcelSortFieldForColumn(columnId: string): string | null {
  return parcelSortFieldByColumnId[columnId] ?? null;
}

export function parcelColumnIdForSort(sortBy: string): string | null {
  const match = Object.entries(parcelSortFieldByColumnId).find(
    ([, field]) => field === sortBy,
  );
  return match ? match[0] : null;
}

export const getAddDeleteParcelDescriptionTableColumns = () => {
  return [...columns, DeleteColumn];
};

export const getParcelDescriptionsTableColumns = (
  viewMode: SiteDetailsMode,
  userType: UserType,
): SectionColumn[] => {
  if (userType === UserType.Internal) {
    return [...columns, SRColumn];
  } else {
    return columns;
  }
};
