import { FormFieldType } from '../../../components/input-controls/IFormField';
import { ColumnSize } from '../../../components/table/TableColumn';

export const getLandUseColumns = (
  landUseCodes: any[] = [],
  editMode = false,
  isInternalUser = false,
) => {
  const landUseCodeColumns = editMode
    ? {
        id: 1,
        displayName: 'Land Use',
        active: true,
        graphQLPropertyName: 'landUse.code',
        displayType: {
          type: FormFieldType.DropDown,
          label: 'Land Use',
          options: landUseCodes.map(({ description, code }) => {
            return { value: description, key: code };
          }),
          graphQLPropertyName: 'landUse.code',
          tableMode: true,
          placeholder: 'Please enter land use',
          customLabelCss: 'custom-landuses-lbl-text',
          customInputTextCss: 'custom-landuses-input-text',
          customEditLabelCss: 'custom-landuses-edit-label',
          customEditInputTextCss: 'custom-landuses-edit-input',
        },
      }
    : {
        id: 1,
        displayName: 'Land Use',
        active: true,
        graphQLPropertyName: 'landUse.description',
        displayType: {
          type: FormFieldType.Text,
          label: 'Land Use',
          graphQLPropertyName: 'landUse.code',
          tableMode: true,
          placeholder: 'Please enter land use note.',
          customLabelCss: 'custom-landuses-lbl-text',
          customInputTextCss: 'custom-landuses-input-text',
          customEditLabelCss: 'custom-landuses-edit-label',
          customEditInputTextCss: 'custom-landuses-edit-input',
        },
      };

  const noteColumn = {
    id: 2,
    displayName: 'Notes',
    active: true,
    graphQLPropertyName: 'note',
    displayType: {
      type: FormFieldType.Text,
      label: 'Notes',
      graphQLPropertyName: 'note',
      tableMode: true,
      customLabelCss: 'custom-landuses-lbl-text',
      customInputTextCss: 'custom-landuses-input-text',
      customEditLabelCss: 'custom-landuses-edit-label',
      customEditInputTextCss: 'custom-landuses-edit-input',
    },
  };

  const srColumn = {
    id: 3,
    displayName: 'SR',
    active: true,
    graphQLPropertyName: 'srValue',
    displayType: {
      type: FormFieldType.Checkbox,
      label: 'SR',
      graphQLPropertyName: 'srValue',
      tableMode: true,
    },
    dynamicColumn: true,
    columnSize: ColumnSize.XtraSmall,
    stickyCol: true,
  };

  return isInternalUser
    ? [landUseCodeColumns, noteColumn, srColumn]
    : [landUseCodeColumns, noteColumn];
};
