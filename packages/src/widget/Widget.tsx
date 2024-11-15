import React, { useEffect, useState } from 'react';
// Importing interface for Widget props and other components like Table and CheckBoxInput
import { IWidget } from './IWidget';
import Table from '../table/Table';
import './Widget.css';
import { CheckBoxInput } from '../inputControl/InputControls';
import { FormFieldType } from '../inputControl/IFormField';
import { RequestStatus } from '../inputControl/RequestStatus';

// Define the Widget component, which accepts the IWidget props interface
const Widget: React.FC<IWidget> = ({
  title,                     // Title of the widget (optional)
  tableColumns,              // Table columns for the widget (optional)
  tableIsLoading,            // Loading status for the table (optional)
  tableData,                 // Data to populate the table (optional)
  children,                  // Any child components (optional)
  customLabelCss,            // Custom CSS class for the label (optional)
  allowRowsSelect,           // Flag to allow row selection in the table (optional)
  hideTable,                 // Flag to hide the table (optional)
  hideTitle,                 // Flag to hide the title (optional)
  editMode,                  // Flag to enable edit mode for the widget (optional)
  srMode,                    // Flag to enable screen reader mode (optional)
  primaryKeycolumnName,      // Name of the primary key column in the table (optional)
  currentPage,               // Current page for pagination (optional)
  changeHandler,             // Event handler for change events (optional)
  handleCheckBoxChange,      // Event handler for checkbox change (optional)
  sortHandler,               // Event handler for sorting (optional)
  showPageOptions,           // Flag to show pagination options (optional)
  customWidgetContainerCss,  // Custom CSS class for the widget container (optional)
  customWidgetTableContainerCss // Custom CSS class for the table container (optional)
}) => {
  // Defaulting sortHandler to an empty function if it's not provided
  let widgetSortHandler = sortHandler ?? (() => {});
  
  // State to hold the widget data, initialized with tableData prop
  const [widgetData, setWidgetData] = useState(tableData);

  // useEffect hook to update widget data whenever tableData changes
  useEffect(() => {
    setWidgetData(tableData);
  }, [tableData]);

  return (
    // Container for the widget, uses custom CSS class if provided, or defaults to a flex column layout
    <div className={`${customWidgetContainerCss ? customWidgetContainerCss : 'd-flex flex-column widget-container'}`}>
      
      {/* Render title section if it's not hidden and title exists */}
      {!hideTitle && title && (
        <div className="d-flex align-items-center">
          
          {/* If screen reader mode (srMode) is enabled, render a checkbox input */}
          {srMode && (
            <CheckBoxInput
              type={FormFieldType.Checkbox}
              label={''}
              isLabel={false}
              onChange={handleCheckBoxChange ?? (() => {})}
              srMode={srMode}
            />
          )}
          
          {/* Display the title, with custom or default styling */}
          <div className="w-100 me-1">
            <h4 className={`${customLabelCss ?? `widget-lbl`}`}>{title}</h4>
          </div>
        </div>
      )}

      {/* Render children components, if any */}
      {children && <div>{children}</div>}
      
      {/* Render the table if it's not hidden */}
      {!hideTable && (
        <div
          className={`${customWidgetTableContainerCss ? customWidgetTableContainerCss : `${widgetData && widgetData.length > 12 ? 'widget-table-container' : 'widget-table-conatiner-overflow '}`}`}
        >
          {/* Table container with custom or default overflow handling */}
          <div className="me-1">
            <Table
              label={title ?? ''}                            // Table label
              isLoading={tableIsLoading ?? RequestStatus.idle} // Loading state for table
              columns={tableColumns ?? []}                   // Table columns
              data={widgetData}                               // Table data
              showPageOptions={showPageOptions}              // Show pagination options
              allowRowsSelect={allowRowsSelect}              // Allow row selection
              changeHandler={changeHandler ?? (() => {})}    // Change handler for table interactions
              editMode={editMode ?? false}                   // Enable/Disable edit mode
              srMode={srMode ?? false}                       // Enable/Disable screen reader mode
              idColumnName={primaryKeycolumnName ?? ''}      // Primary key column name for rows
              sortHandler={widgetSortHandler}                // Sorting handler for the table
              currentPage={currentPage}                      // Current page for pagination
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Exporting the Widget component as default
export default Widget;
