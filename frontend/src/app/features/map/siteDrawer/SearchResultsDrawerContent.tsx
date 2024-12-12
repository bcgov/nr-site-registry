import { FC, useState } from 'react';
import { Site } from '../MapView';
import SearchResults from '../../site/searchResults/SearchResults';
import { SearchResultsFilters } from '../../site/searchResults/SearchResultsFilters';
import { SearchResultsActions } from '../../site/searchResults/SearchResultsActions';
import FilterPills from '../../site/filters/FilterPills';
import { getSiteSearchResultsColumns } from '../../site/dto/Columns';
import { TableColumn } from '../../../components/table/TableColumn';
import { useMapSearch_FilterSearchResultsQuery } from '../../../../graphql/generated';
import { SpinnerIcon } from '../../../components/common/icon';

const defaultColumns = getSiteSearchResultsColumns();

interface SearchResultsDrawerContentProps {
  sites: Site[];
  loading: boolean;
}
export const SearchResultsDrawerContent: FC<
  SearchResultsDrawerContentProps
> = ({ sites, loading: siteIdsLoading }) => {
  const siteIds = sites.map((site) => site.id);

  const { data, loading: siteDetailsLoading } =
    useMapSearch_FilterSearchResultsQuery({
      variables: {
        siteIds,
      },
    });

  const [columnsToDisplay, setColumnsToDisplay] =
    useState<TableColumn[]>(defaultColumns);
  const [filtersFormData, setFiltersFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const toggleColumnSelectionForDisplay = (column: TableColumn) => {
    setColumnsToDisplay((prevColumns) =>
      prevColumns.map((item) =>
        item.id === column.id && !item.disabled
          ? { ...item, isChecked: !item.isChecked }
          : item,
      ),
    );
  };

  const onFiltersChange = (key: string, value: any) => {
    setFiltersFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const onFiltersSubmit = (e: React.FormEvent) => {
    console.log('TODO');
  };

  const changeHandler = (event: any) => {
    if (!event) return;
    const { property, value, row, selected: selectAllChecked } = event;

    if (property === 'select_row') {
      setSelectedRows((prevRows) =>
        value
          ? prevRows.some((r) => r.id === row.id)
            ? prevRows
            : [...prevRows, row]
          : prevRows.filter((r) => r.id !== row.id),
      );
    } else if (property === 'select_all') {
      setSelectedRows(selectAllChecked ? [...value] : []);
    }
  };

  const loading = siteIdsLoading || siteDetailsLoading;

  return (
    <div className="d-flex flex-column gap-3">
      <SearchResultsFilters
        columns={columnsToDisplay}
        onColumnSelectionChange={toggleColumnSelectionForDisplay}
        resetColumns={() => setColumnsToDisplay(defaultColumns)}
        filtersFormData={filtersFormData}
        onFiltersChange={onFiltersChange}
        onFiltersSubmit={onFiltersSubmit}
        onFiltersReset={() => setFiltersFormData({})}
      />
      <SearchResultsActions selectedRows={selectedRows} />

      <FilterPills filters={[]} onRemoveFilter={() => console.log('todo')} />

      {loading && <SpinnerIcon size={20} className="site-fa-spin" />}

      {!siteDetailsLoading && (
        <SearchResults
          pageChange={() => console.log('todo')}
          data={data?.searchSites.sites || []}
          columns={columnsToDisplay.filter((x) => x.isChecked === true)}
          totalRecords={0}
          changeHandler={changeHandler}
        />
      )}
    </div>
  );
};
