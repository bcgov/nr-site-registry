import { ReactNode } from 'react';
import { FormFieldType, IFormField } from '../input-controls/IFormField';
import {
  CheckBoxInput,
  DateInput,
  DeleteIcon,
  DropdownInput,
  DropdownSearchInput,
  IconButton,
  Label,
  Link,
  SearchCustomInput,
  TextAreaInput,
  TextInput,
} from '../input-controls/InputControls';

type RenderTableFieldProps = {
  field: IFormField;
  value: string;
  editMode: boolean;
  srMode?: boolean;
  columnIndex: number;
  onChange: (value: any, isDeleteRow?: boolean) => void;
};

export function renderTableField({
  field,
  value,
  editMode,
  srMode,
  columnIndex,
  onChange,
}: RenderTableFieldProps): ReactNode {
  const recordChange = (next: any) => onChange(next);

  if (field.type === FormFieldType.Text) {
    return (
      <TextInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        isDisabled={field.isDisabled}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.Search) {
    return (
      <SearchCustomInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        placeholder={field.placeholder}
        value={value}
        options={field.options || []}
        onChange={recordChange}
        type={FormFieldType.Text}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        customPlaceholderCss={field.customPlaceholderCss}
        isLoading={field.isLoading}
        customInfoMessage={field.customInfoMessage}
        customMenuMessage={field.customMenuMessage}
        isDisabled={field.isDisabled}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.Label) {
    return (
      <Label
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.Link) {
    return (
      <Link
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        href={field.href}
        customLinkValue={field.customLinkValue}
        customIcon={field.customIcon}
        customContainerCss={field.customContainerCss}
        componentName={field.componentName}
        componentPath={field.componentPath}
      />
    );
  }
  if (field.type === FormFieldType.DropDown) {
    return (
      <DropdownInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        href={field.href}
        options={field.options}
        isDisabled={field.isDisabled}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.Checkbox) {
    return (
      <CheckBoxInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        isChecked={value === 'true'}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        srMode={srMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        href={field.href}
        options={field.options}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.Date) {
    return (
      <DateInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        isDisabled={field.isDisabled ?? false}
        validation={field.validation}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.TextArea) {
    return (
      <TextAreaInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        value={value}
        onChange={recordChange}
        type={field.type}
        validation={field.validation}
        allowNumbersOnly={field.allowNumbersOnly}
        isEditing={editMode ?? true}
        textAreaRow={field.textAreaRow}
        textAreaColoum={field.textAreaColoum}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        isDisabled={field.isDisabled}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.DropDownWithSearch) {
    return (
      <DropdownSearchInput
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        customPlaceholderCss={field.customPlaceholderCss}
        placeholder={field.placeholder}
        options={field.options || []}
        value={value}
        onChange={recordChange}
        type={field.type}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        handleSearch={field.handleSearch}
        filteredOptions={field.filteredOptions || []}
        isLoading={field.isLoading}
        customInfoMessage={field.customInfoMessage}
        isDisabled={field.isDisabled}
        validation={field.validation}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.DeleteIcon) {
    return (
      <DeleteIcon
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        placeholder={field.placeholder}
        options={field.options || []}
        value={value}
        onChange={(next) => onChange(next, true)}
        type={field.type}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  if (field.type === FormFieldType.IconButton) {
    return (
      <IconButton
        key={columnIndex}
        label={field.label}
        customLabelCss={field.customLabelCss}
        customInputTextCss={field.customInputTextCss}
        customEditLabelCss={field.customEditLabelCss}
        customEditInputTextCss={field.customEditInputTextCss}
        placeholder={field.placeholder}
        options={field.options || []}
        value={value}
        onChange={recordChange}
        type={field.type}
        isEditing={editMode ?? true}
        tableMode={field.tableMode ?? false}
        stickyCol={field.stickyCol}
        customLinkValue={field.customLinkValue}
        customIcon={field.customIcon}
        customContainerCss={field.customContainerCss}
      />
    );
  }
  return null;
}
