import React, { useEffect, useState } from 'react';
import Form from '../../../components/form/Form';
import SRUpdatesFilterRows from './srUpdatesTableFilterConfig';
import { formatDateRange } from '../../../helpers/utility';
import {
  fetchPendingSiteForSRApproval,
  updateSearchParam,
} from './state/srUpdatesTableSlice';
import { AppDispatch } from '../../../Store';
import { useDispatch } from 'react-redux';
import { fetchInternalUserNameForDropdown } from '../dropdowns/DropdownSlice';
import SRUpdatesTableConfiguration from './srUpdatesTableConfiguration';

interface ISRUpdatesTableFilter {
  closeSection: () => void;
  currentPage: number;
  resultsPerPage: number;
}

const SRUpdatesTableFilter: React.FC<ISRUpdatesTableFilter> = ({
  closeSection,
  currentPage,
  resultsPerPage,
}) => {
  const dispatch = useDispatch<AppDispatch>();
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

  const [selectedFilters, setSelectedFilters] = useState<
    { key: any; value: any; label: string }[]
  >([]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let dtoToAPI = {
      ...formData,
      whenUpdated: formData.whenUpdated
        ? formatDateRange(formData.whenUpdated)
        : '',
    };

    dispatch(updateSearchParam(dtoToAPI));

    dispatch(
      fetchPendingSiteForSRApproval({
        searchParam: dtoToAPI,
        page: currentPage,
        pageSize: resultsPerPage,
      }),
    );
  };

  const handleReset = () => {
    setFormData({});
    setSelectedFilters([]);
    dispatch(updateSearchParam(null));

    dispatch(
      fetchPendingSiteForSRApproval({
        searchParam: null,
        page: currentPage,
        pageSize: resultsPerPage,
      }),
    );
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
          <button
            type="reset"
            className="reset-button"
            onClick={handleReset}
            data-testid="reset-filter"
          >
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
            data-testid="cancel-filter"
            onClick={() => {
              handleReset();
              closeSection();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default SRUpdatesTableFilter;
