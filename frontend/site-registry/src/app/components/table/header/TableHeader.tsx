import React, { FC } from 'react';
import { ColumnSize, TableColumn } from '../TableColumn';
import { SortIcon } from '../../common/icon';
import './TableHeader.css'
import HeaderCell from './HeaderCell';

interface TableHeaderProps
{
    columns: TableColumn[];
    allowRowsSelect: boolean
    sortHandler:(row:any,ascSort:boolean)=>void
}

const TableHeader:FC<TableHeaderProps> = ({columns,allowRowsSelect, sortHandler}) => {
    if (!columns || columns.length === 0) {
        return null;
      }
  
      return (
        <tr className="table-header">
         {allowRowsSelect && <th scope="col" className="table-header-th checkbox-column">
            <input type="checkbox" className="checkbox-color" />
          </th>}
          {columns &&
            columns.map((item, index) => (
              <HeaderCell item={item} index={index} sortHandler={sortHandler}/>
            ))}        
        </tr>
      );
}

export default TableHeader