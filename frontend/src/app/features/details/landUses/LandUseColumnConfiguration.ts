import { FormFieldType } from '../../../components/input-controls/IFormField';

export const getLandUseColumns = (
  landUseCodes: any[] = [],
  editMode = false,
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
    },
  };
  return [landUseCodeColumns, noteColumn];
};
