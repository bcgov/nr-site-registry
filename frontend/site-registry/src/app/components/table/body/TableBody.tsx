import React, { FC, useEffect, useState } from 'react';
import { SpinnerIcon } from '../../common/icon';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../TableColumn';

import { FormFieldType, IFormField } from '../../input-controls/IFormField';
import {
  Label,
  TextInput,
  Link,
  CheckBoxInput,
  DropdownInput,
  DateInput,
  TextAreaInput,
  DropdownSearchInput,
  DeleteIcon,
  IconButton,
  SearchCustomInput,
} from '../../input-controls/InputControls';
import { ChangeTracker } from '../../common/IChangeType';
import { get } from '../utils';

interface TableBodyProps {
  isLoading: RequestStatus;
  columns: TableColumn[];
  data: any;
  allowRowsSelect: boolean;
  changeHandler: (data: any) => void;
  editMode: boolean;
  srMode?: boolean;
  idColumnName: string;
  rowDeleteHandler: (data: any) => void;
  allRowsSelected: boolean;
  currentPage: number;
  allRowsSelectedPages: number[];
  allRowsSelectedEventFlag: boolean;
  resetAllRowsSelectedEventFlag: () => void;
  removePageFromAllRowsSelected: () => void;
}

interface SelectedRowsType {
  [key: number]: string[]; // or whatever type `rowsIds` is
}

const TableBody: FC<TableBodyProps> = ({
  isLoading,
  columns,
  data,
  allowRowsSelect,
  changeHandler,
  editMode,
  srMode,
  idColumnName,
  rowDeleteHandler,
  allRowsSelected,
  currentPage,
  allRowsSelectedPages,
  allRowsSelectedEventFlag,
  resetAllRowsSelectedEventFlag,
  removePageFromAllRowsSelected,
}) => {



  const [selectedRowIds, SetSelectedRowsId] = useState<SelectedRowsType>({});

  useEffect(() => {
    if (!allRowsSelectedEventFlag) return;

    const rowsIds: string[] = data.map((item: any, index: number) => {
      const checkboxId = getValue(index, idColumnName);
      return checkboxId;
    });

    if (allRowsSelected) {
      SetSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: [...(prevItems[currentPage] || []), ...rowsIds],
      }));
    } else {
      SetSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: (prevItems[currentPage] || []).filter(
          (item) => !rowsIds.includes(item),
        ),
      }));
    }

    if (allRowsSelectedEventFlag) {
      changeHandler({
        id: 'select_all',
        property: 'select_all',
        value: data,
        selected: allRowsSelected,
      });
      resetAllRowsSelectedEventFlag();
    }
  }, [allRowsSelected]);

  const handleSelectTableRow = (isChecked: any, id: string, rowIndex: any) => {
    if (isChecked) {
      SetSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: [...(prevItems[currentPage] || []), id],
      }));
    } else {
      SetSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: (prevItems[currentPage] || []).filter(
          (item) => item !== id,
        ),
      }));

      removePageFromAllRowsSelected();
    }

    tableRecordChangeHandler(rowIndex, 'select_row', isChecked);
  };

  const isChecked = (id: string) => {
    return (
      selectedRowIds[currentPage] &&
      selectedRowIds[currentPage].indexOf(id) !== -1
    );
  };

  const renderNoResultsFound = () => {
    return (
      <tr>
        <td colSpan={20} className="noContent table-border-light">
          {isLoading === RequestStatus.loading ? (
            <div className="content-loading">
              <SpinnerIcon data-testid="loading-spinner" className="fa-spin " />
              <span className="noContentText"> Searching </span>
            </div>
          ) : (
            <span className="noContentText">No Results Found</span>
          )}
        </td>
      </tr>
    );
  };

  const tableRecordChangeHandler = (
    rowKey: number,
    propertyName: any,
    value: any,
    isDeleteRow?: boolean,
  ) => {
    const changeRecord = {
      row: getDataRow(rowKey),
      property: propertyName,
      value: value,
    };

    if (isDeleteRow) {
      rowDeleteHandler(changeRecord);
    } else {
      changeHandler(changeRecord);
    }
  };

  const getTableCellHtml = (
    field: any,
    displayName: string,
    value: string,
    rowKey: number,
    href: string,
    changeHandler: any,
    editMode: boolean,
  ) => {
    if (field.type === FormFieldType.Text) {
      return (
        <TextInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.Search) {
      return (
        <SearchCustomInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          value={value}
          options={field.options || []}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={FormFieldType.Text}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
          customPlaceholderCss={field.customPlaceholderCss}
          isLoading={field.isLoading}
          customInfoMessage={field.customInfoMessage}
        />
      );
    } else if (field.type === FormFieldType.Label) {
      return (
        <Label
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.Link) {
      return (
        <Link
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
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
        />
      );
    } else if (field.type === FormFieldType.DropDown) {
      return (
        <DropdownInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
          href={field.href}
          options={field.options}
        />
      );
    } else if (field.type === FormFieldType.Checkbox) {
      return (
        <CheckBoxInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          isChecked={value === 'true' ? true : false}
          // value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          srMode={srMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
          href={field.href}
          options={field.options}
        />
      );
    } else if (field.type === FormFieldType.Date) {
      return (
        <DateInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.TextArea) {
      return (
        <TextAreaInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          textAreaRow={field.textAreaRow}
          textAreaColoum={field.textAreaColoum}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.DropDownWithSearch) {
      return (
        <DropdownSearchInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          customPlaceholderCss={field.customPlaceholderCss}
          placeholder={field.placeholder}
          options={field.options || []}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.DeleteIcon) {
      return (
        <DeleteIcon
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          options={field.options || []}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(
              rowKey,
              field.graphQLPropertyName,
              value,
              true,
            )
          }
          type={field.type}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
        />
      );
    } else if (field.type === FormFieldType.IconButton) {
      return (
        <IconButton
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          options={field.options || []}
          value={value}
          onChange={(value) =>
            tableRecordChangeHandler(rowKey, field.graphQLPropertyName, value)
          }
          type={field.type}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
          stickyCol={field.stickyCol}
          customLinkValue={field.customLinkValue}
          customIcon={field.customIcon}
        />
      );
    }
  };

  const getValue = (rowIndex: number, propertyName: string) => {
    return get(data[rowIndex], propertyName);
  };

  const getDataRow = (rowIndex: number) => {
    return data[rowIndex];
  };

  const renderTableCell = (
    column: TableColumn,
    rowIndex: number,
    columnIndex: number,
  ) => {
    if (isNaN(rowIndex)) return '';

    if (data[rowIndex] === undefined) {
      return '';
    }

    const cellValue =
      column.graphQLPropertyName &&
      column.graphQLPropertyName
        .split(',')
        .map((graphQLPropertyName) => getValue(rowIndex, graphQLPropertyName))
        .join(' ');

    return getTableCellHtml(
      column.displayType,
      column.displayName,
      cellValue ?? '',
      rowIndex,
      column.linkRedirectionURL ?? '',
      changeHandler,
      editMode,
    );
  };

  const renderTableRow = (rowIndex: number) => {
    const checkboxId = getValue(rowIndex, idColumnName);
    const rowChecked = isChecked(checkboxId);

    return (
      <React.Fragment>
        <tr data-testid="table-row">
          {allowRowsSelect && (
            <td className="table-border-light content-text positionSticky align-content-center">
              <input
                id={getValue(rowIndex, idColumnName)}
                type="checkbox"
                className="checkbox-color"
                aria-label="Select Row"
                onChange={(event) => {
                  handleSelectTableRow(
                    event.target.checked,
                    checkboxId,
                    rowIndex,
                  );
                }}
                checked={rowChecked}
              />
            </td>
          )}
          {columns &&
            columns.map((column, columnIndex) => {
              return renderTableCell(column, rowIndex, columnIndex);
            })}
        </tr>
      </React.Fragment>
    );
  };

  return (
    <tbody>
      {data.length === 0
        ? renderNoResultsFound()
        : data.map((item: any, index: number) => renderTableRow(index))}
    </tbody>
  );
};

export default TableBody;
