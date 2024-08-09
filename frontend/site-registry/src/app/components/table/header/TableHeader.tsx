import React, { FC,  useEffect,  useState } from 'react';
import { TableColumn } from '../TableColumn';
import './TableHeader.css';
import HeaderCell from './HeaderCell';

interface TableHeaderProps {
  columns: TableColumn[];
  allowRowsSelect: boolean;
  sortHandler: (row: any, ascSort: boolean) => void;
  currentSortColumn?: string;
  selectAllRowsHandler:(event:any,checked:boolean)=>void;
  currentPageAllRowsSelected: boolean;
}

const TableHeader: FC<TableHeaderProps> = ({
  columns,
  allowRowsSelect,
  sortHandler,
  currentSortColumn,
  selectAllRowsHandler,
  currentPageAllRowsSelected
}) => {

  const [isCurrentPageSelected,SetIsCurrentPageSelected] = useState(currentPageAllRowsSelected);

  useEffect(()=>{
    console.log("currentPageAllRowsSelected",currentPageAllRowsSelected);
    SetIsCurrentPageSelected(currentPageAllRowsSelected)
  },[currentPageAllRowsSelected])
 
  //const [allRowsSelected,SetAllRowsSelected] = useState(currentPageAllRowsSelected);


  if (!columns || columns.length === 0) {
    return null;
  } 
  return (
    <tr className="table-header">
      {allowRowsSelect && (
        <th
          scope="col"
          className={`table-header-th checkbox-column positionSticky`}          
        >
          <input type="checkbox" className="checkbox-color" checked={isCurrentPageSelected}  onClick={(event)=>{
              console.log("allRowsSelected",currentPageAllRowsSelected);
              selectAllRowsHandler(event,!currentPageAllRowsSelected)
          }}
            // const newValue = !allRowsSelected;
            // console.log("newValue",newValue)
            //SetAllRowsSelected(!newValue);
            //console.log("newValue",!allRowsSelected)
            //selectAllRowsHandler(!currentPageAllRowsSelected)}} 
            />
        </th>
      )}
      {columns &&
        columns.map((item, index) => (
          <HeaderCell item={item} index={index} sortHandler={sortHandler} currentSortColumn={currentSortColumn} />
        ))}
    </tr>
  );
};

export default TableHeader;
