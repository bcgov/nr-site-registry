import React from 'react';
import { IWidget } from './IWidget';
import './Widget.css';
import { CheckBoxInput } from '../input-controls/InputControls';
import { FormFieldType } from '../input-controls/IFormField';
import { RequestStatus } from '../../helpers/requests/status';
import SectionGrid from '../grid/SectionGrid';

const Widget: React.FC<IWidget> = ({
  title,
  tableColumns,
  tableIsLoading,
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
  handleCheckBoxChange,
  showPageOptions,
  isRequired,
  widgetIschecked,
  hideWidgetCheckbox,
  selectPage,
  changeResultsPerPage,
  resultsPerPage,
  totalResults,
  deleteHandler,
  filter,
  sortControl,
  empty,
}) => {
  return (
    <div className={`d-flex flex-column widget-container`}>
      {!hideTitle && title && (
        <div className="d-flex align-items-center">
          {srMode && !hideWidgetCheckbox && (
            <CheckBoxInput
              type={FormFieldType.Checkbox}
              label={''}
              isLabel={false}
              onChange={handleCheckBoxChange ?? (() => {})}
              srMode={srMode}
              isChecked={widgetIschecked}
            />
          )}
          <div className="widget-lbl-container w-100 me-1 d-flex flex-wrap align-items-center justify-content-between">
            <h4
              className={`${customLabelCss ?? `widget-lbl`} ${isRequired ? 'widget-required-field' : ''}`}
            >
              {title}
            </h4>
            {filter}
          </div>
        </div>
      )}
      {children && <div>{children}</div>}
      {!hideTable && (
        <div className="me-1">
          <SectionGrid
            label={title ?? ''}
            columns={tableColumns ?? []}
            rows={tableData ?? []}
            isLoading={tableIsLoading ?? RequestStatus.idle}
            showPageOptions={showPageOptions}
            allowRowsSelect={allowRowsSelect ?? false}
            changeHandler={changeHandler ?? (() => {})}
            editMode={editMode ?? false}
            srMode={srMode ?? false}
            idColumnName={primaryKeycolumnName ?? ''}
            currentPage={currentPage}
            selectPage={selectPage}
            changeResultsPerPage={changeResultsPerPage}
            resultsPerPage={resultsPerPage}
            totalResults={totalResults}
            deleteHandler={deleteHandler ?? (() => {})}
            sortControl={sortControl}
            empty={empty}
          />
        </div>
      )}
    </div>
  );
};

export default Widget;
