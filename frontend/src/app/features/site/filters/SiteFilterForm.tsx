import React from 'react';
import './SiteFilterForm.css';
import 'rsuite/DateRangePicker/styles/index.css';
import Form from '../../../components/form/Form';
import { Button } from '../../../components/button/Button';
import { IFormField } from '../../../components/input-controls/IFormField';

interface SiteFilterProps {
  formRows: IFormField[][];
  formData: { [key: string]: any | [Date, Date] };
  onInputChange: (key: string, value: any) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
  cancelSearchFilter: () => void;
  selectedFilter?: { key: string; value: string; label: string }[];
}

const SiteFilterForm: React.FC<SiteFilterProps> = ({
  formRows,
  formData,
  onInputChange,
  onSubmit,
  onReset,
  cancelSearchFilter,
  selectedFilter,
}) => {
  return (
    <>
      <form onSubmit={onSubmit} data-testid="form">
        <Form
          formRows={formRows}
          formData={formData}
          handleInputChange={onInputChange}
        />
        <div className="d-flex flex-wrap justify-content-between w-100 mt-3">
          <div>
            <Button
              variant="secondary"
              onClick={onReset}
              data-testid="Reset Filters"
              disabled={
                Object.keys(formData).length === 0 ||
                selectedFilter?.length === 0
              }
            >
              Reset Filters
            </Button>
          </div>
          <div className="d-flex gap-2">
            <Button
              type="submit"
              data-testid="Submit"
              disabled={Object.keys(formData).length === 0}
            >
              Submit
            </Button>
            <Button
              variant="tertiary"
              onClick={cancelSearchFilter}
              data-testid="Cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SiteFilterForm;
