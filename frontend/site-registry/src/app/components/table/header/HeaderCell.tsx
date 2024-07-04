import React, { FC, useState } from 'react';
import { ColumnSize, TableColumn } from '../TableColumn';
import { SortIcon } from '../../common/icon';

interface HeaderCellProps
{
    item: TableColumn,
    index: number,
    sortHandler:(row:any,ascSort:boolean)=>void
}

const HeaderCell : FC<HeaderCellProps> = ({item, index,sortHandler}) => {

    const [ascendingSort,setSortDirection] = useState(false);


  return (
                <th
                key={index}
                scope="col"
                className={`table-header-th ${
                  item.displayName === "Region" ||
                  item.displayName === "Last Updated Date"
                    ? "hide-custom"
                    : ""
                } ${item.columnSize === ColumnSize.Triple ? "triple": ""}  ${item.stickyCol ? 'positionSticky': ''} `}
              >
                {item.displayName}
                <SortIcon className="column-sort-icon" onClick={()=>{
                    sortHandler(item,!ascendingSort);
                    setSortDirection(!ascendingSort);
                }} />
              </th>
  )
}

export default HeaderCell