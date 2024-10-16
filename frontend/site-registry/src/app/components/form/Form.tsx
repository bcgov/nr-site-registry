import React from 'react';
import './Form.css';
import 'rsuite/DateRangePicker/styles/index.css';
import { FormFieldType, IFormField } from '../input-controls/IFormField';
import {
  CheckBoxInput,
  DateInput,
  DateRangeInput,
  DropdownInput,
  DropdownSearchInput,
  GroupInput,
  SearchCustomInput,
  TextAreaInput,
  TextInput,
} from '../input-controls/InputControls';
import { RequestStatus } from '../../helpers/requests/status';
import { v4 } from 'uuid';

interface IFormRendererProps {
  formRows: IFormField[][]; // Define the type of formRows according to your application
  formData: { [key: string]: any | [Date, Date] };
  editMode?: boolean;
  isLoading?: RequestStatus;
  srMode?: boolean;
  handleInputChange: (
    graphQLPropertyName: any,
    value: string | [Date, Date],
  ) => void;
}

const Form: React.FC<IFormRendererProps> = ({
  formRows = [],
  formData,
  editMode,
  srMode,
  isLoading,
  handleInputChange,
}) => {
  return (
    <>
      {formRows.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((field, colIndex) => (
            <div key={colIndex} className={field.colSize}>
              {field.type === FormFieldType.Text && (
                <TextInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  value={formData[field.graphQLPropertyName ?? ''] || ''}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  validation={field.validation}
                  allowNumbersOnly={field.allowNumbersOnly}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                  customInfoMessage={field.customInfoMessage}
                  customMenuMessage={field.customMenuMessage}
                  isDisabled={field.isDisabled}
                />
              )}
              {field.type === FormFieldType.Search && (
                <SearchCustomInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  value={formData[field.graphQLPropertyName ?? ''] || ''}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  options={field.options || []}
                  type={FormFieldType.Text}
                  validation={field.validation}
                  allowNumbersOnly={field.allowNumbersOnly}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                  isLoading={isLoading}
                  customInfoMessage={field.customInfoMessage}
                  customMenuMessage={field.customMenuMessage}
                />
              )}
              {field.type === FormFieldType.TextArea && (
                <TextAreaInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  value={formData[field.graphQLPropertyName ?? ''] || ''}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  validation={field.validation}
                  allowNumbersOnly={field.allowNumbersOnly}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                  textAreaRow={field.textAreaRow}
                  textAreaColoum={field.textAreaColoum}
                />
              )}
              {field.type === FormFieldType.DropDown && (
                <DropdownInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  options={field.options || []}
                  value={formData[field.graphQLPropertyName ?? ''] || ''}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  isEditing={editMode ?? true}
                  isImage={field.isImage}
                  srMode={srMode ?? false}
                />
              )}
              {field.type === FormFieldType.DropDownWithSearch && (
                <DropdownSearchInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  placeholder={field.placeholder}
                  options={field.options || []}
                  value={formData[field.graphQLPropertyName ?? ''] || ''}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                  customPlaceholderCss={field.customPlaceholderCss}
                  handleSearch={field.handleSearch}
                  filteredOptions={field.filteredOptions || []}
                  isLoading={field.isLoading}
                  customInfoMessage={field.customInfoMessage}
                />
              )}
              {field.type === FormFieldType.DateRange && (
                <DateRangeInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  value={formData[field.graphQLPropertyName ?? ''] || []}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                />
              )}
              {field.type === FormFieldType.Date && (
                <DateInput
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  placeholder={field.placeholder}
                  value={formData[field.graphQLPropertyName ?? '']}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  isEditing={editMode ?? true}
                  srMode={srMode ?? false}
                  isDisabled={field.isDisabled ?? false}
                />
              )}
              {field.type === FormFieldType.Group && (
                <GroupInput
                  label={field.label}
                  children={field.children?.map((child) => ({
                    validation: child.validation,
                    allowNumbersOnly: child.allowNumbersOnly,
                    type: child.type,
                    label: child.label,
                    placeholder: child.placeholder,
                    value: formData[child.graphQLPropertyName ?? ''] || '',
                    suffix: child.suffix,
                    onChange: (value: any) =>
                      handleInputChange(child.graphQLPropertyName, value),
                  }))}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  type={field.type}
                  value={formData[field.label] || ''}
                  isEditing={editMode ?? true}
                  isChildLabel={field.isChildLabel ?? false}
                  srMode={srMode ?? false}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  customInfoMessage={field.customInfoMessage}
                />
              )}
              {field.type === FormFieldType.Checkbox && (
                <CheckBoxInput
                  type={field.type}
                  label={field.label}
                  isLabel={field.isLabel ?? true}
                  customLabelCss={field.customLabelCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  customPlaceholderCss={field.customPlaceholderCss}
                  isEditing={editMode ?? true}
                  isChecked={formData[field.graphQLPropertyName ?? ''] || false}
                  onChange={(value) =>
                    handleInputChange(field.graphQLPropertyName, value)
                  }
                  srMode={srMode}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default Form;
