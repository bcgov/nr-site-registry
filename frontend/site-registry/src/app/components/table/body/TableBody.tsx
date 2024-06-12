import React, { FC, useEffect, useState } from "react";
import { SpinnerIcon } from "../../common/icon";
import { RequestStatus } from "../../../helpers/requests/status";
import { TableColumn } from "../TableColumn";

import { Label, TextInput , Link ,Dropdown,CheckBoxInput } from "../../form/InputControls";
import { ChangeTracker } from "../../common/IChangeType";
import { FormFieldType } from "../../form/IFormField";
interface TableBodyProps {
  isLoading: RequestStatus;
  columns: TableColumn[];
  data: any;
  allowRowsSelect: boolean;
  changeHandler: (
    data:any
  ) => void;
  editMode: boolean;
  idColumnName:string;
}

const TableBody: FC<TableBodyProps> = ({
  isLoading,
  columns,
  data,
  allowRowsSelect,
  changeHandler,
  editMode,
  idColumnName,
}) => {

  const [selectedRowIds,SetSelectedRowsId] = useState([""]);


  const handleSelectTableRow = (event:any,id:string,rowIndex:any)=>
  {
    if(event.target.checked)
    {
      SetSelectedRowsId([...selectedRowIds, id]);    
    }
    else
    {
      SetSelectedRowsId(selectedRowIds.filter(x=>x!== id));
    }

    tableRecordChangeHandler(rowIndex,'select_row', event.target.checked)
  }

  useEffect(()=>{ console.log('selectedRowIds',selectedRowIds)},[selectedRowIds]);


  const isChecked = (id:string) =>{
   return (selectedRowIds.indexOf(id) !== -1);
  }

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

  const tableRecordChangeHandler= (rowKey:number,propertyName:any,value:any)=>
    {
        const changeRecord = {
          "row": getDataRow(rowKey),
          "property":propertyName,
          "value":value
        }
        console.log(changeRecord)
        changeHandler(changeRecord);
    }

  const getTableCellHtml = (
    field: any,
    displayName: string,
    value: string,
    rowKey: number,
    href: string,
    changeHandler: any,
    editMode: boolean
  ) => {
    if (field.type === FormFieldType.Text) {
      return (
        <TextInput
          label={field.label}
          customLabelCss={field.customLabelCss}
          customInputTextCss={field.customInputTextCss}
          customEditLabelCss={field.customEditLabelCss}
          customEditInputTextCss={field.customEditInputTextCss}
          placeholder={field.placeholder}
          value={value}
          onChange={(value) => tableRecordChangeHandler(rowKey,field.graphQLPropertyName, value)}
          type={field.type}
          validation={field.validation}
          allowNumbersOnly={field.allowNumbersOnly}
          isEditing={editMode ?? true}
          tableMode={field.tableMode ?? false}
        />
      );
    }
    else if(field.type === FormFieldType.Label)
      {
        return (
          <Label
            label={field.label}
            customLabelCss={field.customLabelCss}
            customInputTextCss={field.customInputTextCss}
            customEditLabelCss={field.customEditLabelCss}
            customEditInputTextCss={field.customEditInputTextCss}
            placeholder={field.placeholder}
            value={value}
            onChange={(value) => tableRecordChangeHandler(rowKey,field.graphQLPropertyName, value)}
            type={field.type}
            validation={field.validation}
            allowNumbersOnly={field.allowNumbersOnly}
            isEditing={editMode ?? true}
            tableMode={field.tableMode ?? false}
          />
        );
      }
      else if(field.type === FormFieldType.Link)
        {
          return (
            <Link 
              label={field.label}
              customLabelCss={field.customLabelCss}
              customInputTextCss={field.customInputTextCss}
              customEditLabelCss={field.customEditLabelCss}
              customEditInputTextCss={field.customEditInputTextCss}
              placeholder={field.placeholder}
              value={value}
              onChange={(value) => tableRecordChangeHandler(rowKey,field.graphQLPropertyName, value)}
              type={field.type}
              validation={field.validation}
              allowNumbersOnly={field.allowNumbersOnly}
              isEditing={editMode ?? true}
              tableMode={field.tableMode ?? false}
              href={field.href}
            />
          );
        }
        else if(field.type === FormFieldType.DropDown)
          {
            return (
              <Dropdown 
                label={field.label}
                customLabelCss={field.customLabelCss}
                customInputTextCss={field.customInputTextCss}
                customEditLabelCss={field.customEditLabelCss}
                customEditInputTextCss={field.customEditInputTextCss}
                placeholder={field.placeholder}
                value={value}
                onChange={(value) => tableRecordChangeHandler(rowKey,field.graphQLPropertyName, value)}
                type={field.type}
                validation={field.validation}
                allowNumbersOnly={field.allowNumbersOnly}
                isEditing={editMode ?? true}
                tableMode={field.tableMode ?? false}
                href={field.href}
                options={field.options}
              />
            );
          }
          else if(field.type === FormFieldType.Checkbox)
            {
              return (
                <CheckBoxInput 
                  label={field.label}
                  customLabelCss={field.customLabelCss}
                  customInputTextCss={field.customInputTextCss}
                  customEditLabelCss={field.customEditLabelCss}
                  customEditInputTextCss={field.customEditInputTextCss}
                  placeholder={field.placeholder}
                  isChecked={value === 'true' ? true : false}
                  // value={value}
                  onChange={(value) => tableRecordChangeHandler(rowKey,field.graphQLPropertyName, value)}
                  type={field.type}
                  validation={field.validation}
                  allowNumbersOnly={field.allowNumbersOnly}
                  isEditing={editMode ?? true}
                  tableMode={field.tableMode ?? false}
                  href={field.href}
                  options={field.options}
                />
              );
            }
  };

  const getValue = (rowIndex: number, propertyName: string) => {
    return data[rowIndex][propertyName];
  };

  const getDataRow = (rowIndex: number) => {
    return data[rowIndex];
  };

  const renderTableCell = (
    column: TableColumn,
    rowIndex: number,
    columnIndex: number
  ) => {
    if (isNaN(rowIndex)) return "";

    if (data[rowIndex] === undefined) {
      return "";
    }

    const cellValue =
      column.graphQLPropertyName &&
      column.graphQLPropertyName
        .split(",")
        .map((graphQLPropertyName) => getValue(rowIndex, graphQLPropertyName))
        .join(" ");

    return getTableCellHtml(
      column.displayType,
      column.displayName,
      cellValue ?? "",
      rowIndex,
      column.linkRedirectionURL ?? "",
      changeHandler,
      editMode
    );
  };

  const renderTableRow = (rowIndex: number) => {

   const checkboxId = getValue(rowIndex,idColumnName);
   const rowChecked = isChecked(checkboxId);

    return (
      <React.Fragment key={rowIndex}>
        <tr>
          {allowRowsSelect && (
            <td className="table-border-light content-text">
              <input
                id={getValue(rowIndex,idColumnName)}
                type="checkbox"
                className="checkbox-color"
                aria-label="Select Row"
                onChange={(event) =>{handleSelectTableRow(event,checkboxId,rowIndex)}}
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
