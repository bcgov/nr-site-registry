import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { fetchLandUses, landUses } from './LandUsesSlice';
import { useParams } from 'react-router-dom';
import Table from '../../../components/table/Table';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { RequestStatus } from '../../../helpers/requests/status';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import useDebouncedValue from '../../../helpers/useDebouncedValue';

const columns = [
  {
    id: 1,
    displayName: 'Land Use',
    active: true,
    graphQLPropertyName: 'landUse.description',
    displayType: {
      type: FormFieldType.Text,
      label: 'Land Use',
      graphQLPropertyName: 'landUse.description',
      tableMode: true,
    },
  },
  {
    id: 2,
    displayName: 'Notes',
    active: true,
    graphQLPropertyName: 'note',
    displayType: {
      type: FormFieldType.Text,
      label: 'Notes',
      graphQLPropertyName: 'landUse.description',
      tableMode: true,
    },
  },
];

const LandUses: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: siteId } = useParams();

  const { landUses: landUsesData } = useSelector(landUses);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const [sortByValue, setSortByValue] = useState<{
    [key: string]: any;
  }>({});

  useEffect(() => {
    if (siteId) {
      let sortDirection = sortByValue.sortBy === 'newToOld' ? 'DESC' : 'ASC';

      dispatch(
        fetchLandUses({
          siteId,
          searchTerm: debouncedSearchTerm,
          sortDirection,
        }),
      );
    }
  }, [dispatch, debouncedSearchTerm, siteId, sortByValue]);

  return (
    <div>
      <div className="row">
        <div className={`mb-3 col-lg-8`}>
          <SearchInput
            label={'Search'}
            searchTerm={searchTerm}
            clearSearch={() => setSearchTerm('')}
            handleSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={`col-lg-4`}>
          <Sort
            formData={sortByValue}
            editMode={true}
            handleSortChange={(key, value) => {
              setSortByValue({ [key]: value });
            }}
          />
        </div>
      </div>
      <Table
        label="Search Results"
        isLoading={RequestStatus.loading}
        columns={columns}
        data={landUsesData}
        totalResults={landUsesData.length}
        changeHandler={() => {}}
        editMode={false}
        idColumnName="id"
      />
    </div>
  );
};

export default LandUses;
