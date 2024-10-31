import React from 'react';
import { formRows } from '../dto/SiteFilterConfig';
import './SiteFilterForm.css';
import 'rsuite/DateRangePicker/styles/index.css';
import Form from '../../../components/form/Form';

interface SiteFilterProps {
  formData: { [key: string]: any | [Date, Date] };
  onInputChange: (key: string, value: any) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
  cancelSearchFilter: () => void;
}

const SiteFilterForm: React.FC<SiteFilterProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onReset,
  cancelSearchFilter,
}) => {
  return (
    <>
      <form onSubmit={onSubmit}>
        <Form
          formRows={formRows}
          formData={formData}
          handleInputChange={onInputChange}
        />
        <div className="d-flex flex-wrap justify-content-between w-100 mt-3">
          <div>
            <button type="reset" className="reset-button" onClick={onReset}>
              Reset Filters
            </button>
          </div>
          <div>
            {/* Submit button */}
            <button type="submit" className=" submit-button">
              Submit
            </button>
            {/* Cancel button */}
            <button
              type="button"
              className=" cancel-button"
              onClick={cancelSearchFilter}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SiteFilterForm;
