import React, { useEffect, useState } from 'react';
import { IWidget } from './IWidget';
import Table from '../table/Table';
import './Widget.css';
import { CheckBoxInput } from '../input-controls/InputControls';
import { FormFieldType } from '../input-controls/IFormField';
import { RequestStatus } from '../../helpers/requests/status';

const Widget: React.FC<IWidget> = ({
  title,
  tableColumns,
  tableIsLoading,
  isListLoading,
  tableData,
  children,
  customLabelCss,
  allowRowsSelect,
  hideTable,
  hideTitle,
  editMode,
  srMode,
  primaryKeycolumnName,
  currentPage,
  changeHandler,
  onClickRightIcon,
  onClickLeftIcon,
  handleCheckBoxChange,
  sortHandler,
}) => {
  let widgetSortHandler = sortHandler ?? (() => {});
  const [widgetData, setWidgetData] = useState(tableData);
  useEffect(() => {
    setWidgetData(tableData);
  }, [tableData]);

  return (
    <div className={`d-flex flex-column widget-container`}>
      {!hideTitle && title && (
        <div className="d-flex align-items-center">
          {srMode && (
            <CheckBoxInput
              type={FormFieldType.Checkbox}
              label={''}
              isLabel={false}
              onChange={handleCheckBoxChange ?? (() => {})}
              srMode={srMode}
            />
          )}
          <div className="w-100 me-1">
            <h4 className={`${customLabelCss ?? `widget-lbl`}`}>{title}</h4>
          </div>
        </div>
      )}
      {children && <div>{children}</div>}
      {!hideTable && (
        <div
          className={`${widgetData && widgetData.length > 12 ? 'widget-table-container' : ''}`}
        >
          {/* <div> */}
          <div className="me-1">
            <Table
              label={title ?? ''}
              isLoading={tableIsLoading ?? RequestStatus.idle}
              isListLoading={isListLoading ?? RequestStatus.idle}
              columns={tableColumns ?? []}
              data={widgetData}
              showPageOptions={false}
              allowRowsSelect={allowRowsSelect}
              changeHandler={changeHandler ?? (() => {})}
              onClickLeftIcon={onClickLeftIcon ?? (() => {})}
              onClickRightIcon={onClickRightIcon ?? (() => {})}
              editMode={editMode ?? false}
              srMode={srMode ?? false}
              idColumnName={primaryKeycolumnName ?? ''}
              sortHandler={widgetSortHandler}
              currentPage={currentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Widget;
