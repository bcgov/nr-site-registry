import React, { FC, useEffect, useState } from 'react';
import { SpinnerIcon } from '../../common/icon';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../TableColumn';
import { columnDisplayValue, get } from '../utils';
import { renderTableField } from './renderTableField';

interface TableBodyProps {
  isLoading?: RequestStatus;
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
  const [selectedRowIds, setSelectedRowsId] = useState<SelectedRowsType>({});

  useEffect(() => {
    setSelectedRowsId((prev) => ({
      ...prev,
      [currentPage]: [],
    }));
  }, [data]);

  useEffect(() => {
    if (!allRowsSelectedEventFlag) return;

    const rowsIds: string[] = data.map((item: any, index: number) => {
      const checkboxId = getValue(index, idColumnName);
      return checkboxId;
    });

    if (allRowsSelected) {
      setSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: rowsIds,
      }));
    } else {
      setSelectedRowsId((prevItems) => ({
        ...prevItems,
        [currentPage]: [],
      }));
    }

    changeHandler({
      id: 'select_all',
      property: 'select_all',
      value: data,
      selected: allRowsSelected,
    });

    resetAllRowsSelectedEventFlag();
  }, [allRowsSelectedEventFlag]);

  const handleSelectTableRow = (
    isChecked: boolean,
    id: string,
    rowIndex: number,
  ) => {
    setSelectedRowsId((prevItems) => {
      const currentSelected = prevItems[currentPage] || [];

      return {
        ...prevItems,
        [currentPage]: isChecked
          ? [...currentSelected, id]
          : currentSelected.filter((item) => item !== id),
      };
    });

    if (!isChecked) {
      removePageFromAllRowsSelected(); // uncheck the header checkbox if one is deselected
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

    if (data[rowIndex] === undefined || !column.displayType) {
      return '';
    }

    return renderTableField({
      field: column.displayType,
      value: columnDisplayValue(data[rowIndex], column.graphQLPropertyName),
      editMode,
      srMode,
      columnIndex,
      onChange: (next, isDeleteRow) =>
        tableRecordChangeHandler(
          rowIndex,
          column.displayType?.graphQLPropertyName,
          next,
          isDeleteRow,
        ),
    });
  };

  const renderTableRow = (rowIndex: number) => {
    const checkboxId = getValue(rowIndex, idColumnName);
    const rowChecked = isChecked(checkboxId);

    return (
      <React.Fragment key={rowIndex}>
        <tr data-testid="table-row" key={checkboxId}>
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
                checked={rowChecked || false}
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
