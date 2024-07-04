import React, { FC, useState } from "react";
import { ColumnSize, TableColumn } from "../TableColumn";
import { SortIcon } from "../../common/icon";

interface HeaderCellProps {
  item: TableColumn;
  index: number;
  sortHandler: (row: any, ascSort: boolean) => void;
}

const getColumnSize = (columnSize: ColumnSize | undefined) => {
  switch (columnSize) {
    case ColumnSize.Triple:
      return "triple";   
    case ColumnSize.Double:
      return "double";     
    case ColumnSize.Small:
      return "small";    
    case ColumnSize.XtraSmall:
      return "xtraSmall";   
    default:
      return "";     
  }
};

const HeaderCell: FC<HeaderCellProps> = ({ item, index, sortHandler }) => {
  const [ascendingSort, setSortDirection] = useState(false);

  return (
    <th
      key={index}
      scope="col"
      className={`table-header-th ${
        getColumnSize(item.columnSize)
      }  ${item.stickyCol ? 'positionSticky': ''} `}
    >
      {item.displayName}
      <SortIcon
        className="column-sort-icon"
        onClick={() => {
          sortHandler(item, !ascendingSort);
          setSortDirection(!ascendingSort);
        }}
      />
    </th>
  );
};

export default HeaderCell;
