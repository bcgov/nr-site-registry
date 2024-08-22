import { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  fetchLandUses,
  fetchLandUseCodes,
  landUses,
  updateLandUses,
} from './LandUsesSlice';
import { useParams } from 'react-router-dom';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import useDebouncedValue from '../../../helpers/useDebouncedValue';
import Widget from '../../../components/widget/Widget';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { Plus, Minus } from '../../../components/common/icon';
import { v4 } from 'uuid';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { set } from '../../../components/table/utils';

const getColumns = (landUseCodes: any[] = [], editMode = false) => {
  const landUseCodeColumns = editMode
    ? {
        id: 1,
        displayName: 'Land Use',
        active: true,
        graphQLPropertyName: 'landUse.code',
        displayType: {
          type: FormFieldType.DropDownWithSearch,
          label: 'Land Use',
          options: landUseCodes.map(({ description, code }) => {
            return { value: description, key: code };
          }),
          graphQLPropertyName: 'landUse.code',
          tableMode: true,
          placeholder: 'Please enter land use',
        },
      }
    : {
        id: 1,
        displayName: 'Land Use',
        active: true,
        graphQLPropertyName: 'landUse.description',
        displayType: {
          type: FormFieldType.Text,
          label: 'Land Use',
          graphQLPropertyName: 'landUse.code',
          tableMode: true,
          placeholder: 'Please enter land use note.',
        },
      };

  const noteColumn = {
    id: 2,
    displayName: 'Notes',
    active: true,
    graphQLPropertyName: 'note',
    displayType: {
      type: FormFieldType.Text,
      label: 'Notes',
      graphQLPropertyName: 'note',
      tableMode: true,
    },
  };
  return [landUseCodeColumns, noteColumn];
};

const LandUses: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: siteId } = useParams();

  const {
    landUses: landUsesData,
    landUseCodes,
    landUsesFetchRequestStatus,
    landUseCodesFetchRequestStatus,
  } = useSelector(landUses);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const viewMode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const [sortByValue, setSortByValue] = useState<{
    [key: string]: any;
  }>({});

  const [tableData, setTableData] = useState<{ [key: string]: any }[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set<string>());

  const editModeEnabled = viewMode === SiteDetailsMode.EditMode;
  const tableColumns = useMemo(() => {
    return getColumns(landUseCodes, editModeEnabled);
  }, [editModeEnabled, landUseCodes]);

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

  useEffect(() => {
    setTableData(landUsesData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, resetDetails, landUsesFetchRequestStatus]);

  useEffect(() => {
    if (editModeEnabled) {
      dispatch(fetchLandUseCodes());
    }
  }, [dispatch, editModeEnabled]);

  const tableLoading =
    landUseCodesFetchRequestStatus === RequestStatus.loading ||
    landUsesFetchRequestStatus === RequestStatus.loading
      ? RequestStatus.loading
      : RequestStatus.idle;

  const onTableChange = (event: any) => {
    if (event.property.includes('select_row')) {
      handleRowSelect(event.row.guid);
      return;
    }

    const updatedLandUses = tableData.map((landUse) => {
      if (landUse.guid === event.row.guid) {
        // Create a deep copy of the landUse object
        const updatedLandUse = JSON.parse(JSON.stringify(landUse));
        set(updatedLandUse, event.property, event.value);
        return updatedLandUse;
      }
      return landUse;
    });

    const tableColumn = tableColumns.find(
      (column) => column.graphQLPropertyName === event.property,
    );
    const propertyLabel = tableColumn?.displayName || '';
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Suspect Land Uses: ' + propertyLabel,
    );
    dispatch(trackChanges(tracker.toPlainObject()));

    setTableData(updatedLandUses);
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const ids = new Set(prev);
      ids.has(rowId) ? ids.delete(rowId) : ids.add(rowId);
      return ids;
    });
  };

  const handleAddLandUse = () => {
    setTableData((prevData) => [...prevData, { guid: v4() }]);
    const tracker = new ChangeTracker(IChangeType.Added, 'New Land Use');
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleRemoveLandUse = () => {
    setTableData((prevData) => {
      const updatedData = prevData.filter(
        (landUse) => !selectedRowIds.has(landUse.guid),
      );
      dispatch(updateLandUses(updatedData));
      return updatedData;
    });

    setSelectedRowIds(new Set());

    const tracker = new ChangeTracker(IChangeType.Deleted, 'Land Use');
    dispatch(trackChanges(tracker.toPlainObject()));
  };

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
      <Widget
        changeHandler={onTableChange}
        title={'Suspect Land Uses'}
        tableColumns={tableColumns}
        tableData={tableData}
        allowRowsSelect={editModeEnabled}
        tableIsLoading={tableLoading}
        editMode={editModeEnabled}
        srMode={viewMode === SiteDetailsMode.SRMode}
        primaryKeycolumnName="guid"
      >
        {editModeEnabled && (
          <div className="d-flex gap-2 flex-wrap ">
            <button
              className="d-flex align-items-center participant-btn"
              type="button"
              onClick={handleAddLandUse}
              aria-label={'Add Land Use'}
            >
              <Plus />
              <span>Add Land Use</span>
            </button>

            <button
              className={`d-flex align-items-center participant-btn`}
              disabled={selectedRowIds.size <= 0}
              type="button"
              onClick={handleRemoveLandUse}
              aria-label={'Remove Land Use'}
            >
              <Minus />
              <span>Remove Land Use</span>
            </button>
          </div>
        )}
      </Widget>
    </div>
  );
};

export default LandUses;
