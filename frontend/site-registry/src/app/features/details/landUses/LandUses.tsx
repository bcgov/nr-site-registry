import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { fetchLandUses, landUses } from './LandUsesSlice';
import { useParams } from 'react-router-dom';
import Table from '../../../components/table/Table';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import useDebouncedValue from '../../../helpers/useDebouncedValue';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import LandUseTable from './LandUseTable';

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


export const ColumnConfigForLandUses = ()=>{
  return columns;
}



const LandUses: React.FC<IComponentProps> = ({ showPending = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: siteId } = useParams();

  const { landUses: landUsesData, fetchRequestStatus } = useSelector(landUses);
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
          showPending:false
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
      <LandUseTable
        fetchRequestStatus={fetchRequestStatus}
        columns={columns}
        landUsesData={landUsesData}
      />
    </div>
  );
};

export default LandUses;
