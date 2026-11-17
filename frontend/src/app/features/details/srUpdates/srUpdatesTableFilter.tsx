import React, { useState } from 'react';
import Form from '../../../components/form/Form';
import SRUpdatesFilterRows from './srUpdatesTableFilterConfig';
import { formatDateRange } from '../../../helpers/utility';
import { Button } from '../../../components/button/Button';
import './srUpdatesTableFilter.css';
import { ApprovalSearch } from './pendingSiteApprovals';

interface ISRUpdatesTableFilter {
  closeSection: () => void;
  onApply: (search: ApprovalSearch) => void;
  onReset: () => void;
}

const SRUpdatesTableFilter: React.FC<ISRUpdatesTableFilter> = ({
  closeSection,
  onApply,
  onReset,
}) => {
  const [columnConfig, SetColumnConfig] = useState(SRUpdatesFilterRows());

  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>({});

  const handleInputChange = (
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [graphQLPropertyName]: value,
    }));
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const dtoToAPI: ApprovalSearch = {
      id: typeof formData.id === 'string' ? formData.id : undefined,
      changes:
        typeof formData.changes === 'string' ? formData.changes : undefined,
      addrLine:
        typeof formData.addrLine === 'string' ? formData.addrLine : undefined,
      whoCreated:
        typeof formData.whoCreated === 'string'
          ? formData.whoCreated
          : undefined,
      whenUpdated: formData.whenUpdated
        ? formatDateRange(formData.whenUpdated as [Date, Date])
        : undefined,
    };

    onApply(dtoToAPI);
  };

  const handleReset = () => {
    setFormData({});
    onReset();
  };

  return (
    <form onSubmit={handleFormSubmit} data-testid="sr-update-filter-section">
      <Form
        formRows={columnConfig}
        formData={formData}
        handleInputChange={handleInputChange}
      />
      <div className="d-flex flex-wrap justify-content-between w-100 mt-3">
        <div>
          <Button
            variant="secondary"
            onClick={handleReset}
            data-testid="reset-filter"
          >
            Reset Filters
          </Button>
        </div>
        <div className="filter-action-buttons">
          <Button type="submit">Submit</Button>
          <Button
            variant="tertiary"
            onClick={() => {
              handleReset();
              closeSection();
            }}
            data-testid="cancel-filter"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SRUpdatesTableFilter;
