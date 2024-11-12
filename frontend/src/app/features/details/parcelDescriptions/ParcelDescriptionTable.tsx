import React from 'react';
import Table from '../../../components/table/Table';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../../../components/table/TableColumn';

interface IParcelDescriptionTable {
  requestStatus: RequestStatus;
  columns: TableColumn[];
  data: any;
  totalResults: number | undefined;
  handleSelectPage: (event: any) => void;
  handleChangeResultsPerPage: (event: any) => void;
  currentPage: number | undefined;
  resultsPerPage: number | undefined;
  handleTableSortChange: (column: TableColumn, descending: boolean) => void;
  showPageOptions: boolean;
  tableChangeHandler: (event: any) => void;
}

const ParcelDescriptionTable: React.FC<IParcelDescriptionTable> = ({
  requestStatus,
  columns,
  data,
  totalResults,
  handleSelectPage,
  handleChangeResultsPerPage,
  currentPage,
  resultsPerPage,
  handleTableSortChange,
  showPageOptions,
  tableChangeHandler,
}) => {
  return (
    <Table
      showPageOptions={showPageOptions}
      label="Search Results"
      isLoading={requestStatus}
      columns={columns}
      data={data}
      totalResults={totalResults}
      selectPage={handleSelectPage}
      changeResultsPerPage={handleChangeResultsPerPage}
      currentPage={currentPage}
      resultsPerPage={resultsPerPage}
      allowRowsSelect={false}
      changeHandler={tableChangeHandler}
      editMode={false}
      idColumnName="id"
      sortHandler={handleTableSortChange}
    ></Table>
  );
};

export default ParcelDescriptionTable;
