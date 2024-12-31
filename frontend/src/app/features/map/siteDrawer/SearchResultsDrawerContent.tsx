import { FC, useState } from 'react';
import { Site } from '../MapView';
import SearchResults from '../../site/searchResults/SearchResults';
import { SearchResultsFilters } from '../../site/searchResults/SearchResultsFilters';
import { SearchResultsActions } from '../../site/searchResults/SearchResultsActions';
import FilterPills from '../../site/filters/FilterPills';
import { getSiteSearchResultsColumns } from '../../site/dto/Columns';
import { TableColumn } from '../../../components/table/TableColumn';
import {
  MapSearch_FilterSearchResultsQuery,
  useMapSearch_FilterSearchResultsQuery,
} from '../../../../graphql/generated';
import { SpinnerIcon } from '../../../components/common/icon';
import useDebouncedValue from '../../../helpers/useDebouncedValue';

const defaultColumns = getSiteSearchResultsColumns();

type Pagination = {
  page: number;
  pageSize: number;
};

interface SearchResultsDrawerContentProps {
  sites: Site[];
  loading: boolean;
}
export const SearchResultsDrawerContent: FC<
  SearchResultsDrawerContentProps
> = ({ sites, loading: siteIdsLoading }) => {
  const siteIds = sites.map((site) => site.id);
  // Saving fetched data to local state allows us avoid table component flickering
  // when a refetch with new variables takes place
  const [searchResults, setSearchResults] = useState<
    MapSearch_FilterSearchResultsQuery['searchSites']
  >({
    sites: [],
    pageSize: 0,
    count: 0,
    page: 1,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 5,
  });

  const { loading: siteDetailsLoading } = useMapSearch_FilterSearchResultsQuery(
    {
      variables: {
        siteIds,
        page: pagination.page,
        pageSize: pagination.pageSize,
      },
      onCompleted: (data) => {
        setSearchResults(data.searchSites);
      },
    },
  );

  const siteDetailsLoadingDebounced = useDebouncedValue(siteDetailsLoading);

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

  const loading = siteIdsLoading || siteDetailsLoadingDebounced;

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

      <SearchResults
        pageChange={(page, pageSize) => setPagination({ page, pageSize })}
        data={searchResults.sites}
        columns={columnsToDisplay.filter((x) => x.isChecked === true)}
        totalRecords={searchResults.count}
        changeHandler={changeHandler}
      />
    </div>
  );
};
