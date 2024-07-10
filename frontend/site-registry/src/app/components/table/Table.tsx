import React, { FC } from "react";
import { SpinnerIcon, SortIcon } from "../common/icon";
import { RequestStatus } from "../../helpers/requests/status";
import { TableColumn } from "./TableColumn";
import "./Table.css";
import Pagination from "./pagination/Pagination";
import TableHeader from "./header/TableHeader";
import TableBody from "./body/TableBody";

interface TableProps {
  label: string;
  isLoading: RequestStatus;
  columns: TableColumn[];
  data: any;
  totalResults?: number;
  selectPage?: (pageNumber: number) => void;
  changeResultsPerPage?: (pageNumber: number) => void;
  currentPage?: number;
  resultsPerPage?: number;
  showPageOptions? : boolean;
  allowRowsSelect? : boolean;
  changeHandler:(eventRecord:any)=>void,
  editMode: boolean,
  idColumnName:string;
  sortHandler?:(row:any,ascSort:boolean)=>void,
  deleteHandler?:(eventRecord:any)=>void,
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
  idColumnName,
  sortHandler,
  deleteHandler: delteHandler
}) => {
  
  let  tableSortHandler = sortHandler ?? ((row,ascSort)=>{console.log("Handle Sort Event", row, ascSort)});
  let  rowDeleteHandler = delteHandler ?? ((row)=>{console.log("Handle Delete Event", row)});


  return (
    <React.Fragment>
      <div className="tableWidth table-border-radius">
        <table className="table" aria-label={label}>
          <thead aria-label={`${label} Header`}>
            <TableHeader columns={columns} allowRowsSelect={allowRowsSelect ?? false} sortHandler={tableSortHandler} />
          </thead>
            <TableBody isLoading={isLoading} columns={columns} data={data} allowRowsSelect={allowRowsSelect ?? false} changeHandler={changeHandler} editMode={editMode} idColumnName={idColumnName} rowDeleteHandler={rowDeleteHandler} />
        </table>
      </div>
      <div>
        {showPageOptions && data.length !== 0 ? (
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
