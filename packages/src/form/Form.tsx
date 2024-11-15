import React from 'react';
import './Form.css';
import 'rsuite/DateRangePicker/styles/index.css';
import { FormFieldType, IFormField } from '../inputControl/IFormField';
import {
  CheckBoxInput,
  DateInput,
  DateRangeInput,
  DropdownInput,
  DropdownSearchInput,
  GroupInput,
  Link,
  SearchCustomInput,
  TextAreaInput,
  TextInput,
} from '../inputControl/InputControls';
import { RequestStatus } from '../inputControl/RequestStatus';

export interface IFormRendererProps {
  formRows: IFormField[][]; // 2D array representing the rows of form fields; each field is described by IFormField.
  formData: { [key: string]: any | [Date, Date] }; // The data for each form field, with string keys and values that could be any type or a Date range.
  editMode?: boolean; // Optional flag to indicate whether the form is in edit mode.
  isLoading?: RequestStatus; // Optional status that indicates whether data is being fetched or submitted.
  srMode?: boolean; // Optional flag to indicate whether the form is rendered for screen readers (accessibility).
  handleInputChange: (graphQLPropertyName: any, value: string | [Date, Date]) => void; // Callback function to handle changes in input values.
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
              {field.type === FormFieldType.Link && (
                <Link
                label={field.label}
                customLabelCss={field.customLabelCss}
                customInputTextCss={field.customInputTextCss}
                customEditLabelCss={field.customEditLabelCss}
                customEditInputTextCss={field.customEditInputTextCss}
                placeholder={field.placeholder}
                value={formData[field.label] || ''}
                onChange={(value) =>
                  handleInputChange(field.graphQLPropertyName, value)
                }
                type={field.type}
                validation={field.validation}
                allowNumbersOnly={field.allowNumbersOnly}
                isEditing={editMode ?? true}
                tableMode={field.tableMode ?? false}
                stickyCol={field.stickyCol}
                href={field.href}
                customLinkValue={field.customLinkValue}
                customIcon={field.customIcon}
                isPrefixcustomLinkValue = {field.isPrefixcustomLinkValue}
              />
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

//export default
export default Form;

// //export named
// export { Form };