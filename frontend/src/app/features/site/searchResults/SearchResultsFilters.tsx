import { FC, useEffect, useState } from 'react';
import {
  BarsIcon,
  FilterIcon,
  TableColumnsIcon,
} from '../../../components/common/icon';

import { Dropdown } from 'react-bootstrap';
import { Button } from '../../../components/button/Button';
import Column from '../columns/Column';
import type { TableColumn } from '../../../components/table/TableColumn';
import SiteFilterForm from '../filters/SiteFilterForm';
import { formRows } from '../dto/SiteFilterConfig';
import { useDispatch, useSelector } from 'react-redux';
import { siteRiskCodeDrpdown } from '../../details/dropdowns/DropdownSlice';
import { updateFields } from '../../../helpers/utility';

interface SearchResultsFiltersProps {
  columns: TableColumn[];
  onColumnSelectionChange: (column: TableColumn) => void;
  resetColumns: () => void;
  filtersFormData: { [key: string]: any | [Date, Date] };
  onFiltersChange: (key: string, value: any) => void;
  onFiltersSubmit: (e: React.FormEvent) => void;
  onFiltersReset: () => void;
  panelToShow?: PanelOption;
  setPanelToShow?: (panel: PanelOption) => void;
  selectedFilter?: { key: string; value: string; label: string }[];
}

type PanelOption = 'filters' | 'columns' | null;
export const SearchResultsFilters: FC<SearchResultsFiltersProps> = ({
  columns,
  onColumnSelectionChange,
  resetColumns,
  filtersFormData,
  onFiltersChange,
  onFiltersSubmit,
  onFiltersReset,
  panelToShow,
  setPanelToShow = () => {},
  selectedFilter = [],
}) => {
  const siteRiskCode = useSelector(siteRiskCodeDrpdown);
  const [siteFilterFormRows, setSiteFilterFormRows] = useState(formRows);

  useEffect(() => {
    if (siteRiskCode?.data?.length > 0) {
      setSiteFilterFormRows((prev) =>
        updateFields(prev, {
          indexToUpdate: prev.findIndex((row) =>
            row.some((field) => field.graphQLPropertyName === 'siteRiskCode'),
          ),
          updates: {
            options: siteRiskCode?.data,
          },
        }),
      );
    }
  }, [siteRiskCode]);

  const togglePanel = (panel: PanelOption) => {
    if (panelToShow === panel) {
      setPanelToShow(null);
      return;
    }
    setPanelToShow(panel);
  };

  return (
    <div className="py-4">
      {panelToShow === 'columns' && (
        <Column
          toggleColumnSelectionForDisplay={onColumnSelectionChange}
          columns={columns}
          reset={resetColumns}
          close={() => togglePanel(null)}
        />
      )}
      {panelToShow === 'filters' && (
        <SiteFilterForm
          formRows={siteFilterFormRows}
          formData={filtersFormData}
          onInputChange={onFiltersChange}
          onSubmit={(e) => {
            onFiltersSubmit(e);
            togglePanel(null);
          }}
          onReset={onFiltersReset}
          cancelSearchFilter={() => togglePanel(null)}
          selectedFilter={selectedFilter}
        />
      )}
    </div>
  );
};
