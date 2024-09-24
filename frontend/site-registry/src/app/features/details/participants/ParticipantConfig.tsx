import { useSelector } from 'react-redux';
import { DropdownItem } from '../../../components/action/IActions';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import { participantRoleDrpdown } from '../dropdowns/DropdownSlice';
import { RequestStatus } from '../../../helpers/requests/status';
import { siteParticipants } from './ParticipantSlice';
import { useEffect } from 'react';
import { TickIcon, XmarkIcon } from '../../../components/common/icon';

export const GetConfig = () => {
  const participantColumnInternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Participant Name',
      active: true,
      graphQLPropertyName: 'psnorgId',
      columnSize: ColumnSize.Double,
      displayType: {
        type: FormFieldType.DropDownWithSearch,
        label: '',
        isLabel: false,
        graphQLPropertyName: 'psnorgId',
        placeholder: 'Please enter participant name.',
        isLoading: RequestStatus.idle,
        value: '',
        options: [],
        filteredOptions: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        customPlaceholderCss: 'custom-participant-search-placeholder',
        customMenuMessage: <span>Please select site participant name:</span>,
        tableMode: true,
        handleSearch: () => {
          console.log('handleSearch click');
        },
      },
    },
    {
      id: 2,
      displayName: 'Role(s)',
      active: true,
      graphQLPropertyName: 'prCode',
      columnSize: ColumnSize.Double,
      displayType: {
        type: FormFieldType.DropDown,
        label: '',
        graphQLPropertyName: 'prCode',
        placeholder: 'Please select the role',
        value: '',
        options: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        tableMode: true,
        customInfoMessage: null,
      },
    },
    {
      id: 3,
      displayName: 'Start Date',
      active: true,
      graphQLPropertyName: 'effectiveDate',
      columnSize: ColumnSize.Small,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'effectiveDate',
        label: '',
        placeholder: 'MM/DD/YY',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss:
          'custom-participant-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 4,
      displayName: 'End Date',
      active: true,
      graphQLPropertyName: 'endDate',
      columnSize: ColumnSize.Small,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'endDate',
        label: '',
        placeholder: 'MM/DD/YY',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss:
          'custom-participant-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 5,
      displayName: 'Note',
      active: true,
      graphQLPropertyName: 'note',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.Text,
        label: '',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        tableMode: true,
      },
    },
    {
      id: 6,
      displayName: 'SR',
      active: true,
      graphQLPropertyName: 'sr',
      displayType: {
        type: FormFieldType.Checkbox,
        label: 'SR',
        placeholder: '',
        graphQLPropertyName: 'sr',
        value: false,
        tableMode: true,
        stickyCol: true,
      },
      columnSize: ColumnSize.XtraSmall,
      // dynamicColumn: true,
      stickyCol: true,
    },
    
  ];

  const participantColumnExternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Participant Name',
      active: true,
      graphQLPropertyName: 'psnorgId',
      columnSize: ColumnSize.Double,
      displayType: {
        type: FormFieldType.DropDownWithSearch,
        label: '',
        isLabel: false,
        graphQLPropertyName: 'psnorgId',
        placeholder: 'Please enter participant name.',
        isLoading: RequestStatus.idle,
        value: '',
        options: [],
        filteredOptions: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        customPlaceholderCss: 'custom-participant-search-placeholder',
        customMenuMessage: <span>Please select site participant name:</span>,
        tableMode: true,
        handleSearch: () => {
          console.log('handleSearch click');
        },
      },
    },
    {
      id: 2,
      displayName: 'Role(s)',
      active: true,
      graphQLPropertyName: 'prCode',
      columnSize: ColumnSize.Double,
      displayType: {
        type: FormFieldType.DropDown,
        label: '',
        graphQLPropertyName: 'prCode',
        placeholder: 'Please select the role',
        value: '',
        options: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        tableMode: true,
        customInfoMessage: null,
      },
    },
    {
      id: 3,
      displayName: 'Start Date',
      active: true,
      graphQLPropertyName: 'effectiveDate',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'effectiveDate',
        label: '',
        placeholder: 'MM/DD/YY',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss:
          'custom-participant-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 4,
      displayName: 'End Date',
      active: true,
      graphQLPropertyName: 'endDate',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'endDate',
        label: '',
        placeholder: 'MM/DD/YY',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss:
          'custom-participant-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 5,
      displayName: 'Note',
      active: true,
      graphQLPropertyName: 'note',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.TextArea,
        label: '',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-participant-lbl-text',
        customInputTextCss: 'custom-participant-input-text',
        customEditLabelCss: 'custom-participant-edit-label',
        customEditInputTextCss: 'custom-participant-edit-input',
        tableMode: true,
      },
    },  
  ];

  const srVisibilityParcticConfig: DropdownItem[] = [
    {
      label: 'Show on SR',
      value: SRVisibility.ShowSR,
    },
    {
      label: 'Hide on SR',
      value: SRVisibility.HideSR,
    },
  ];

  return {
    participantColumnInternal,
    participantColumnExternal,
    srVisibilityParcticConfig,
  };
};

export default GetConfig;
