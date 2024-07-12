import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { fetchLandUses, landUses } from './LandUsesSlice';
import { useParams } from 'react-router-dom';
import Table from '../../../components/table/Table';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { RequestStatus } from '../../../helpers/requests/status';
import SearchInput from '../../../components/search/SearchInput';

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

  useEffect(() => {
    if (siteId) {
      // TODO: debounce searchTerm
      dispatch(fetchLandUses({ siteId, searchTerm }));
    }
  }, [dispatch, searchTerm, siteId]);

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
          sort will go here
          {/* <Sort
            formData={sortByValue}
            editMode={true}
            handleSortChange={handleSortChange}
          /> */}
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
