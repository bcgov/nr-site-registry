import React from 'react';
import { IWidget } from './IWidget';
import Table from '../table/Table';
import './Widget.css';
import { CheckBoxInput } from '../input-controls/InputControls';
import { FormFieldType } from '../input-controls/IFormField';

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
    changeHandler,
    handleCheckBoxChange
}) => {
    return(
        <div className={`d-flex flex-column widget-container`}>
        {
          !hideTitle && title && 
          <div className='d-flex align-items-center'>
            {
              srMode && 
              <CheckBoxInput
                type={FormFieldType.Checkbox}
                label={''}
                isLabel={false}
                onChange={handleCheckBoxChange ?? (() => {})}
              />
            }
            <div className='w-100'>
              <h4 className={`${customLabelCss ?? `widget-lbl`}`}>{title}</h4>
            </div>
          </div>
        }
        {children && 
          <div>
            {children}
          </div>
        }
        { !hideTable && 
          <div>
            <Table
              label={title ?? ""}
              isLoading={tableIsLoading}
              columns={tableColumns}
              data={tableData}
              showPageOptions={false}
              allowRowsSelect={allowRowsSelect}
              changeHandler={changeHandler}
              editMode={editMode ?? false}
            />
          </div>
        }
      </div>
    );
}

export default Widget;