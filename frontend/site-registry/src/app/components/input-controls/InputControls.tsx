import React, { useEffect, useState } from "react";
import { FormFieldType, IFormField } from "./IFormField";
import infoIcon from '../../images/info-icon.png';
import { formatDate, formatDateRange } from '../../helpers/utility';
import { DatePicker, DateRangePicker } from 'rsuite';
import { CalendarIcon, TrashCanIcon } from '../common/icon';
import { Link as RouterLink } from 'react-router-dom';
import { v4 } from 'uuid';
import Dropdown from 'react-bootstrap/Dropdown';

import SearchInput from "../search/SearchInput";
import Avatar from "../avatar/Avatar";


interface InputProps extends IFormField {
  children?: InputProps[];
  isEditing?: boolean;
  srMode?: boolean;
  onChange: (value: any) => void;
}

const renderTableCell = (
  content: JSX.Element | string,
  stickyCol?: boolean,
) => {
  return (
    <td className={`"table-border-light" ${stickyCol ? 'positionSticky' : ''}`}>
      {content}
    </td>
  );
};

export const Link: React.FC<InputProps> = ({
  label,
  placeholder,
  type,
  value,
  validation,
  allowNumbersOnly,
  isEditing,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  customLinkValue,
  customIcon,
  onChange,
  tableMode,
  stickyCol,
  href,
}) => {
  return renderTableCell(
    <RouterLink
      to={href + value}
      className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
      aria-label={`${label + ' ' + value}`}
    >
      {customIcon && customIcon}{' '}
      <span className="ps-1">{customLinkValue ?? value}</span>
    </RouterLink>,
    stickyCol,
  );
};





export const IconButton: React.FC<InputProps> = ({
  label,
  placeholder,
  type,
  value,
  validation,
  allowNumbersOnly,
  isEditing,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  customLinkValue,
  customIcon,
  onChange,
  tableMode,
  stickyCol,
  href,
}) => {
  return (
    renderTableCell(
      <div onClick={onChange}  className={`${customInputTextCss ?? ""}`}>
      
           {customIcon && customIcon} <span className="ps-1">{customLinkValue ?? value}</span>
      </div>   
    )
  );
};

export const DeleteIcon: React.FC<InputProps> = ({
  label,
  placeholder,
  type,
  value,
  validation,
  allowNumbersOnly,
  isEditing,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  onChange,
  tableMode,
  href,
}) => {
  return renderTableCell(
    <div onClick={onChange}>
      <TrashCanIcon title="Remove" />
      <span aria-label={label}>&nbsp;Remove</span>
    </div>,
  );
};

export const Label: React.FC<InputProps> = ({
  label,
  placeholder,
  type,
  value,
  validation,
  allowNumbersOnly,
  isEditing,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  stickyCol,
  onChange,
  tableMode,
}) => {
  return renderTableCell(
    <span
      aria-label={label}
      className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
    >
      {value}
    </span>,
    stickyCol,
  );
};

export const TextInput: React.FC<InputProps> = ({
  label,
  placeholder,
  type,
  value,
  validation,
  allowNumbersOnly,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  stickyCol,
  onChange,
  tableMode,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  const [error, setError] = useState<string | null>(null);

  const [localValue,SetLocalValue] = useState(value);
  const inputTxtId = label.replace(/\s+/g, "_");
  let timeOutId:any = null;




  const validateInput = (inputValue: string) => {
    if (validation) {
      if (validation.pattern && !validation.pattern.test(inputValue)) {
        setError(validation.customMessage || 'Invalid input');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    validateInput(inputValue);
    SetLocalValue(inputValue);


   
    if (allowNumbersOnly) {
      if (validateInput(inputValue)) {
        onChange(inputValue); // Update parent component state only if validation passes
      }
    } else {
      onChange(inputValue);
    }
  };


  const handleCheckBoxChange = (isChecked: boolean) => {
    onChange(isChecked);
  };

  // Replace any spaces in the label with underscores to create a valid id
  const inputTxtId = label.replace(/\s+/g, '_');
  return (
    <ContainerElement
      className={`${tableMode ? 'table-border-light' : 'mb-3'} ${tableMode && stickyCol ? 'positionSticky' : ''} `}
    >
      {!tableMode && (
        <>
          {srMode && (
            <CheckBoxInput
              type={FormFieldType.Checkbox}
              label={inputTxtId}
              isLabel={false}
              onChange={handleCheckBoxChange}
              srMode={srMode}
            />
          )}
          {!tableMode && (
            <label
              htmlFor={inputTxtId}
              className={`${
                !isEditing
                  ? customLabelCss ?? ''
                  : `form-label ${customEditLabelCss ?? 'custom-label'}`
              }`}
            >
              {label}
            </label>}
          </>
        )}
        {isEditing ? (
          <input
            type={type}
            id={inputTxtId}
            className={`form-control custom-input ${
              customEditInputTextCss ?? "custom-input-text"
            }  ${error && "error"}`}
            placeholder={placeholder}
            value={localValue ?? ""}
            onChange={handleTextInputChange}
            aria-label={label} // Accessibility
            required={error ? true : false}
           
          />
        ) : (
          <span className={`d-flex pt-1 ${customInputTextCss ?? ""}`}>{value}</span>
        )}
        {error && <div className="text-danger p-1 small">{error}</div>}
      </ContainerElement>
    );
  // }
};

export const DropdownInput: React.FC<InputProps> = ({
  label,
  placeholder,
  options,
  value,
  isEditing,
  srMode,
  isImage,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  onChange,
  tableMode,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  // Replace any spaces in the label with underscores to create a valid id
  const drdownId = label.replace(/\s+/g, '_');
  const [selected, setSelected] = useState<boolean>(false);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value.trim();
    setSelected(selectedOption !== '');
    onChange(selectedOption);
  };

  const handleCheckBoxChange = (isChecked: boolean) => {
    onChange(isChecked);
  };
  const isFirstOptionGrey = value === "";
    return (
      <ContainerElement className={tableMode ? "table-border-light" : "mb-3"}>
        {srMode && (
          <CheckBoxInput
            type={FormFieldType.Checkbox}
            label={drdownId}
            isLabel={false}
            onChange={handleCheckBoxChange}
            srMode={srMode}
          />
        )}
        {/* Create a label for the dropdown using the form-label class */}

      {!tableMode && (
        <label
          htmlFor={drdownId}
          className={`${
            !isEditing
              ? customLabelCss ?? ''
              : `form-label ${customEditLabelCss ?? 'custom-label'}`
          }`}
          aria-labelledby={label}
        >
          {label}
        </label>
      )}

        {/* Create a select element with the form-select class */}
        {isEditing ? (
          <select
            id={drdownId}
            className={`form-select custom-input custom-select ${
              customEditInputTextCss ?? "custom-input-text"
            } ${selected ? "custom-option" : ""} ${
              isFirstOptionGrey
                ? "custom-disabled-option"
                : "custom-primary-option"
            }`}
            value={value.trim() ?? ""}
            onChange={handleSelectChange}
            aria-label={label}
          >
            <option value="" className="custom-disabled-option">
              {placeholder}
            </option>
            {options?.map((option, index) => (
              <option
                key={index}
                value={option.key}
                className="custom-option custom-primary-option"
              >
                {option.value}
              </option>
            ))}
          </select>
        ) : isImage ? (
          <div className="d-flex align-items-center gap-2">
            <Avatar
             firstName={options?.find((opt) => opt.key === value)?.value.split(',')[0].trim()} 
             lastName={options?.find((opt) => opt.key === value)?.value.split(',')[1].trim()} 
             customImageCss="custom-form-image" customTextCss="custom-form-image-txt"
             aria-hidden="true"
             aria-label="User image"/>
            <p aria-label={label} className={`m-0 p-0 ${customInputTextCss ?? ""}`}>
              {options?.find((opt) => opt.key === value)?.value}
            </p>
          </div>
        ) : (
        <span aria-label={label} className={`d-flex pt-1 ${customInputTextCss ?? ""}`}>
            {options?.find((opt) => opt.key === value)?.value}
          </span>
        )}
      </ContainerElement>
    );
  // }
};

export const GroupInput: React.FC<InputProps> = ({
  label,
  children,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  isChildLabel,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  let currentConcatenatedValue;

  if (!isEditing) {
    currentConcatenatedValue = children?.reduce(
      (accumulator, currentValue, index) => {
        if (currentValue.value) {
          accumulator = accumulator + currentValue.value + currentValue.suffix;
        }
        return accumulator;
      },
      '',
    );
  }
  const validateInput = (
    inputValue: string,
    validation?: RegExp,
    customMessage?: string,
  ) => {
    if (validation) {
      if (validation && !validation.test(inputValue)) {
        setError(customMessage || 'Invalid input');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleTextInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    child: InputProps,
  ) => {
    const inputValue = e.target.value.trim();
    if (child.allowNumbersOnly) {
      if (
        validateInput(
          inputValue,
          child.validation?.pattern,
          child.validation?.customMessage,
        )
      ) {
        child.onChange(inputValue); // Update parent component state only if validation passes
      }
    } else {
      child.onChange(inputValue);
    }
  };

  const handleCheckBoxChange = (isChecked: boolean) => {
    onChange(isChecked);
  };

  return (
    <div className="mb-3">
      {' '}
      {/* Container for the group input */}
      {srMode && (
        <CheckBoxInput
          type={FormFieldType.Checkbox}
          label={''}
          isLabel={false}
          onChange={handleCheckBoxChange}
          srMode={srMode}
        />
      )}
      {/* Label for the group input */}
      <label
        className={`${
          !isEditing
            ? customLabelCss ?? ''
            : `form-label ${customEditLabelCss ?? 'custom-label'}`
        }`}
      >
        {label}
      </label>
      {/* Bootstrap row for the group of child fields */}
      <div className="row">
        {isEditing ? (
          children?.map((child, index) => (
            <div key={index} className="col">
              {isChildLabel && (
                <label
                  className={`${!isEditing ? customLabelCss ?? '' : `form-label ${customEditLabelCss ?? 'custom-label'}`}`}
                >
                  {child.label}
                </label>
              )}
              {/* Render each child field as an input element */}
              <input
                type={child.type}
                className={`form-control custom-input ${
                  customEditInputTextCss ?? 'custom-input-text'
                } ${error && 'error'}`}
                placeholder={child.placeholder}
                value={child.value ?? ''}
                onChange={(e) => handleTextInputChange(e, child)}
                aria-label={child.label} // Accessibility
              />
            </div>
          ))
        ) : (
          <span
            aria-label={label}
            className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
          >
            {currentConcatenatedValue != undefined
              ? currentConcatenatedValue
              : ''}
          </span>
        )}
        {error && (
          <div aria-label={label} className="text-danger p-1 mx-2 small">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export const DateRangeInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  tableMode,
  onChange,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  let dateRangeValue;
  if (value.length > 0) {
    dateRangeValue = formatDateRange(value);
  }

  const handleCheckBoxChange = (isChecked: boolean) => {
    onChange(isChecked);
  };
  // Replace any spaces in the label with underscores to create a valid id
  const dateRangeId = label.replace(/\s+/g, '_');
  return (
    <ContainerElement className={tableMode ? 'table-border-light' : 'mb-3'}>
      {srMode && (
        <CheckBoxInput
          type={FormFieldType.Checkbox}
          label={dateRangeId}
          isLabel={false}
          onChange={handleCheckBoxChange}
          srMode={srMode}
        />
      )}
      {!tableMode && (
        <label
          htmlFor={dateRangeId}
          className={`${
            !isEditing
              ? customLabelCss ?? ''
              : `form-label ${customEditLabelCss ?? 'custom-label'}`
          }`}
        >
          {label}
        </label>
      )}
      {isEditing ? (
        <DateRangePicker
          id={dateRangeId}
          showOneCalendar
          ranges={[]}
          aria-label={label}
          className={` w-100 ${customEditInputTextCss ?? 'custom-date-range'}`}
          placeholder={placeholder}
          format="MM/dd/yy"
          character=" - "
          caretAs={CalendarIcon}
          value={value ?? []}
          onChange={(value) => onChange(value)}
        />
      ) : (
        <span
          aria-label={label}
          className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
        >
          {dateRangeValue ?? ''}
        </span>
      )}
    </ContainerElement>
  );
};

export const DateInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  tableMode,
  onChange,
  isDisabled,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  let dateValue;

  value = tableMode ? (value != '' ? new Date(value) : null) : value;
  value = !tableMode && isEditing && value != null ? new Date(value) : value;

  if (value) {
    dateValue = formatDate(new Date(value));
  }
  const handleCheckBoxChange = (isChecked: boolean) => {
    onChange(isChecked);
  };

  // Replace any spaces in the label with underscores to create a valid id
  const dateRangeId = label.replace(/\s+/g, '_');
  return (
    <ContainerElement className={tableMode ? 'table-border-light' : 'mb-3'}>
      {srMode && (
        <CheckBoxInput
          type={FormFieldType.Checkbox}
          label={dateRangeId}
          isLabel={false}
          onChange={handleCheckBoxChange}
          srMode={srMode}
        />
      )}
      {!tableMode && (
        <label
          htmlFor={dateRangeId}
          className={`${
            !isEditing
              ? customLabelCss ?? ''
              : `form-label ${customEditLabelCss ?? 'custom-label'}`
          }`}
        >
          {label}
        </label>
      )}

      {isEditing ? (
        <DatePicker
          id={dateRangeId}
          aria-label={label}
          className={` w-100 ${customEditInputTextCss ?? 'custom-date-range'}`}
          placeholder={placeholder}
          format="MMMM d, yyyy"
          caretAs={CalendarIcon}
          value={value ?? null}
          onChange={(value) => onChange(value)}
          oneTap
          readOnly = {isDisabled}
        />
      ) : (
        <span
          aria-label={label}
          className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
        >
          {dateValue ?? ''}
        </span>
      )}
    </ContainerElement>
  );
};

export const CheckBoxInput: React.FC<InputProps> = ({
  label,
  isLabel,
  isChecked,
  customLabelCss,
  customEditLabelCss,
  customEditInputTextCss,
  isEditing,
  type,
  value,
  onChange,
  tableMode,
  srMode,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  const inputTxtId = label.replace(/\s+/g, '_') + v4();
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked); // Toggle the checked state and pass it to the parent component
  };

  const disableCheckBox = isEditing || srMode ? false : true;

  return (
          <ContainerElement className={tableMode ? "table-border-light" : "d-inline mb-3"}>
            <div className={tableMode ?"" : "d-inline form-check p-0"}>
                <input
                id={inputTxtId}
                type={type}
                className={`form-check-input custom-checkbox ${
                    customEditInputTextCss ?? "custom-input-text"
                }`}
                disabled = {disableCheckBox}
                checked={isChecked}
                aria-label={label} // Accessibility
                onChange={handleCheckboxChange}
                />
                {isLabel && !tableMode &&(
                <label
                    htmlFor={inputTxtId}
                    className={`${
                    !isEditing
                        ? customLabelCss ?? ""
                        : `px-1 form-label ${customEditLabelCss ?? "custom-label"}`
                    }`}
                >
                    {label}
                </label>
                )}
            </div>
            </ContainerElement>
        );
};

export const TextAreaInput: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  onChange,
  tableMode,
  textAreaRow,
  textAreaColoum,
}) => {
  
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const textAreaId = label.replace(/\s+/g, '_');
  const ContainerElement = tableMode ? 'td' : 'div';
  const cols = textAreaColoum ?? undefined;
  const rows = textAreaRow ?? undefined;
  
  return (
    <ContainerElement className={tableMode ? 'table-border-light' : 'mb-3'}>
      {!tableMode && (
        <>
          {srMode && (
            <CheckBoxInput
              type={FormFieldType.Checkbox}
              label={textAreaId}
              isLabel={false}
              onChange={(isChecked) => onChange(isChecked)}
              srMode={srMode}
            />
          )}
          {!tableMode && (
            <label
              htmlFor={textAreaId}
              className={`${
                !isEditing
                  ? customLabelCss ?? ''
                  : `form-label ${customEditLabelCss ?? 'custom-label'}`
              }`}
            >
              {label}
            </label>
          )}
        </>
      )}
      {isEditing ? (
        <textarea
          id={textAreaId}
          className={`form-control custom-textarea ${
            customEditInputTextCss ?? 'custom-input-text'
          }`}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={handleTextAreaChange}
          aria-label={label}
          rows={rows}
          cols={cols}
        />
      ) : (
        <span
          aria-label={label}
          className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
        >
          {value}
        </span>
      )}
    </ContainerElement>
  );
};

export const DropdownSearchInput: React.FC<InputProps> = ({
  label,
  placeholder,
  options,
  value,
  isEditing,
  srMode,
  customLabelCss,
  customInputTextCss,
  customEditLabelCss,
  customEditInputTextCss,
  stickyCol,
  onChange,
  tableMode,
}) => {
  const ContainerElement = tableMode ? 'td' : 'div';
  const drdownId = label.replace(/\s+/g, '_');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue.trim());
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.trim();
    setSearchTerm(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredOptions = options?.filter((option) =>
    option.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <ContainerElement
      className={`${tableMode ? 'table-border-light' : 'mb-3'} ${tableMode && stickyCol ? 'position-sticky' : ''} `}
    >
      {srMode && (
        <CheckBoxInput
          type={FormFieldType.Checkbox}
          label={label}
          isLabel={false}
          onChange={(isChecked) => onChange(isChecked)}
        />
      )}
      {!tableMode && (
        <label
          htmlFor={drdownId}
          className={`${
            !isEditing
              ? customLabelCss ?? ''
              : `form-label ${customEditLabelCss ?? 'custom-label'}`
          }`}
        >
          {label}
        </label>
      )}

        {isEditing ? (
        <Dropdown className="custom-dropdown-search">
          <Dropdown.Toggle id={drdownId} 
                  className={`form-control d-flex align-items-center justify-content-between 
                            custom-select custom-input custom-dropdown
                            ${customEditInputTextCss ?? 'custom-input-text'}`}
          >
            {value
              ? options?.find((opt) => opt.key === value)?.value
              : placeholder}
          </Dropdown.Toggle>
          <Dropdown.Menu className="custom-dropdown-menu">
            <div className="mx-2">
              <SearchInput
                label={'Search Staff'}
                searchTerm={searchTerm}
                clearSearch={clearSearch}
                handleSearchChange={handleSearchChange}
              />
              {filteredOptions?.length === 0 && (
                <div className="py-2">
                  <img
                    src={infoIcon}
                    alt="info"
                    aria-hidden="true"
                    role="img"
                    aria-label="User image"
                  />
                  <span aria-label={label} className="px-2 custom-not-found">
                    No results found.
                  </span>
                </div>
              )}
            </div>
            <Dropdown.Divider />
            {filteredOptions?.map((option, index) => {
              if (index <= 5) {
                return (
                  <Dropdown.Item
                    key={index}
                    onClick={() => handleSelectChange(option.key)}
                  >
                    {option.value}
                  </Dropdown.Item>
                );
              }
            })}
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <span
          aria-label={label}
          className={`d-flex pt-1 ${customInputTextCss ?? ''}`}
        >
          {options?.find((opt) => opt.key === value)?.value}
        </span>
      )}
    </ContainerElement>
  );
};
