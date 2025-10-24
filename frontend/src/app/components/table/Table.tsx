import React, { FC, useEffect, useState } from 'react';
import { RequestStatus } from '../../helpers/requests/status';
import { TableColumn } from './TableColumn';
import './Table.css';
import Pagination from './pagination/Pagination';
import TableHeader from './header/TableHeader';
import TableBody from './body/TableBody';

interface TableProps {
  label: string;
  isLoading?: RequestStatus;
  columns: TableColumn[];
  data: any;
  totalResults?: number;
  selectPage?: (pageNumber: number) => void;
  changeResultsPerPage?: (pageNumber: number) => void;
  currentPage?: number;
  resultsPerPage?: number;
  showPageOptions?: boolean;
  allowRowsSelect?: boolean;
  changeHandler: (eventRecord: any) => void;
  editMode: boolean;
  srMode?: boolean;
  idColumnName: string;
  sortHandler?: (row: any, ascSort: boolean) => void;
  deleteHandler?: (eventRecord: any) => void;
}

const Table: FC<TableProps> = ({
  label,
  isLoading,
  columns,
  data,
  totalResults,
  selectPage,
  changeResultsPerPage,
  currentPage,
  resultsPerPage,
  showPageOptions,
  allowRowsSelect,
  changeHandler,
  editMode,
  srMode,
  idColumnName,
  sortHandler,
  deleteHandler,
}) => {
  const [currentSortColumn, setCurrentSortColumn] = useState('');
  const [allRowsSelectedPages, setAllRowsSelectedPages] = useState<number[]>(
    [],
  );
  const [currentPageAllRowSelected, setCurrentPageAllRowSelected] =
    useState(false);
  const [allRowsSelectedEventFlag, setAllRowsSelectedEventFlag] =
    useState(false);

  useEffect(() => {
    setAllRowsSelectedPages([]);
    setCurrentPageAllRowSelected(false);
    setAllRowsSelectedEventFlag(false);
  }, [data]);

  useEffect(() => {
    const isSelected =
      allRowsSelectedPages.findIndex(
        (pageNumber) => pageNumber === currentPage,
      ) !== -1;

    setCurrentPageAllRowSelected(isSelected);
  }, [allRowsSelectedPages, currentPage]);

  const selectAllRows = (event: any, checked: boolean) => {
    if (event) {
      setAllRowsSelectedEventFlag(true);

      if (checked && currentPage !== undefined) {
        setAllRowsSelectedPages((prev) =>
          prev.includes(currentPage) ? prev : [...prev, currentPage],
        );
      } else {
        setAllRowsSelectedPages((prev) =>
          prev.filter((page) => page !== currentPage),
        );
      }

      setCurrentPageAllRowSelected(checked);
    }
  };

  const resetAllRowsSelectedEventFlag = () => {
    setAllRowsSelectedEventFlag(false);
  };

  const removePageFromAllRowsSelected = () => {
    setAllRowsSelectedPages((prev) =>
      prev.filter((page) => page !== currentPage),
    );
    setCurrentPageAllRowSelected(false);
  };

  const parentSortHandler = sortHandler ?? (() => {});

  let tableSortHandler = (row: any, ascSort: any) => {
    setCurrentSortColumn(row.graphQLPropertyName);
    parentSortHandler(row, ascSort);
  };
  let rowDeleteHandler = deleteHandler ?? (() => {});

  return (
    <React.Fragment>
      <div className="tableWidth table-border-radius">
        <table className="table" aria-label={label}>
          <thead aria-label={`${label} Header`}>
            <TableHeader
              columns={columns}
              allowRowsSelect={allowRowsSelect ?? false}
              sortHandler={tableSortHandler}
              currentSortColumn={currentSortColumn}
              selectAllRowsHandler={selectAllRows}
              currentPageAllRowsSelected={currentPageAllRowSelected}
            />
          </thead>
          <TableBody
            isLoading={isLoading}
            columns={columns}
            data={data}
            allowRowsSelect={allowRowsSelect ?? false}
            changeHandler={changeHandler}
            editMode={editMode}
            srMode={srMode}
            idColumnName={idColumnName}
            rowDeleteHandler={rowDeleteHandler}
            allRowsSelected={currentPageAllRowSelected}
            currentPage={currentPage ?? 1}
            allRowsSelectedPages={allRowsSelectedPages}
            allRowsSelectedEventFlag={allRowsSelectedEventFlag}
            resetAllRowsSelectedEventFlag={resetAllRowsSelectedEventFlag}
            removePageFromAllRowsSelected={removePageFromAllRowsSelected}
          />
        </table>
      </div>
      <div>
        {showPageOptions && data?.length !== 0 ? (
          <Pagination
            changeResultsPerPage={changeResultsPerPage}
            selectPage={selectPage}
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            totalResults={totalResults}
          />
        ) : null}
      </div>
    </React.Fragment>
  );
};

export default Table;
