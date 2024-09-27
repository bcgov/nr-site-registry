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
import { get, set } from '../../../components/table/utils';
import './LandUses.css';
import LandUseTable from './LandUseTable';
import { getLandUseColumns } from './LandUseColumnConfiguration';

type createdAtSortDirection = 'newToOld' | 'oldTonew';



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

  const viewMode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const [sortByValue, setSortByValue] = useState<createdAtSortDirection>();

  const [tableData, setTableData] = useState<{ [key: string]: any }[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set<string>());

  const editModeEnabled = viewMode === SiteDetailsMode.EditMode;
  const tableColumns = useMemo(() => {
    return getLandUseColumns(landUseCodes, editModeEnabled);
  }, [editModeEnabled, landUseCodes]);

  useEffect(() => {
    if (siteId) {
      dispatch(fetchLandUses({ siteId , showPending:false}));
    }
  }, [dispatch, siteId]);

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

  const getLandUseObjectByCode = (code: string) => {
    return landUseCodes.find((landUseCode: any) => landUseCode.code === code);
  };

  const onTableChange = (event: any) => {
    if (event.property.includes('select_row')) {
      handleRowSelect(event.row.guid);
      return;
    }

    if (event.property.includes('select_all')) {
      event.selected
        ? setSelectedRowIds(new Set(tableData.map((row) => row.guid)))
        : setSelectedRowIds(new Set());
      return;
    }

    const updatedLandUses = tableData.map((landUse) => {
      if (landUse.guid === event.row.guid) {
        // Create a deep copy of the landUse object
        const updatedLandUse = JSON.parse(JSON.stringify(landUse));

        if (event.property === 'landUse.code') {
          set(updatedLandUse, 'landUse', getLandUseObjectByCode(event.value));
        } else {
          set(updatedLandUse, event.property, event.value);
        }

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

  const handleSortChange = (_: any, value: string | [Date, Date]) => {
    const sortDirection = value as createdAtSortDirection;
    setSortByValue(sortDirection as createdAtSortDirection);
    sortByDate(sortDirection, tableData);
  };

  const sortByDate = (sortDirection: createdAtSortDirection, data: any) => {
    let sorted = [...data];
    switch (sortDirection) {
      case 'newToOld':
        sorted.sort(
          (a, b) =>
            new Date(b.whenCreated).getTime() -
            new Date(a.whenCreated).getTime(),
        );
        break;
      case 'oldTonew':
        sorted.sort(
          (a, b) =>
            new Date(a.whenCreated).getTime() -
            new Date(b.whenCreated).getTime(),
        );
        break;
      default:
        break;
    }
    setTableData(sorted);
  };

  const handleTableSort = (row: any, ascDir: boolean) => {
    const property = row['graphQLPropertyName'];
    setTableData((prevData) => {
      let landUses = [...prevData];
      landUses.sort(function (rowA: any, rowB: any) {
        const valueA = get(rowA, property);
        const valueB = get(rowB, property);

        if (valueA > valueB) return ascDir ? 1 : -1;
        if (valueA < valueB) return ascDir ? -1 : 1;
        return 0;
      });
      return landUses;
    });
  };

  const dataWithTextSearchApplied = !searchTerm
    ? tableData
    : tableData.filter((rowData) => {
        const term = searchTerm.toLowerCase().trim();
        return (
          rowData.note?.toLowerCase().includes(term) ||
          rowData.landUse?.description?.toLowerCase().includes(term)
        );
      });

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
            formData={{ sortBy: sortByValue }}
            editMode={true}
            handleSortChange={handleSortChange}
          />
        </div>
      </div>
      <LandUseTable
        onTableChange={onTableChange} 
        tableColumns={tableColumns} 
        dataWithTextSearchApplied={dataWithTextSearchApplied} 
        editModeEnabled={editModeEnabled}
        tableLoading={tableLoading}
        viewMode={viewMode} 
        handleTableSort={handleTableSort}
        selectedRowIds={selectedRowIds}
        handleRemoveLandUse={handleRemoveLandUse} handleAddLandUse={handleAddLandUse}
      ></LandUseTable>
    </div>
  );
};

export default LandUses;
