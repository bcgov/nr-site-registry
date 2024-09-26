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
import { setupLandHistoriesDataForSaving } from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

type createdAtSortDirection = 'newToOld' | 'oldTonew';

const getColumns = (landUseCodes: any[] = [], editMode = false) => {
  const landUseCodeColumns = editMode
    ? {
        id: 1,
        displayName: 'Land Use',
        active: true,
        graphQLPropertyName: 'landUse.code',
        displayType: {
          type: FormFieldType.DropDown,
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

interface LandUseUpdateInput {
  originalLandUseCode?: string | null;
  shouldDelete?: boolean;
  [key: string]: string | boolean | null | undefined;
}

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

  const [editLandUsesData, setEditLandUsesData] = useState(
    new Map<string, LandUseUpdateInput>(),
  );

  const editModeEnabled = viewMode === SiteDetailsMode.EditMode;
  const tableColumns = useMemo(() => {
    return getColumns(landUseCodes, editModeEnabled);
  }, [editModeEnabled, landUseCodes]);

  useEffect(() => {
    if (siteId) {
      dispatch(fetchLandUses({ siteId }));
    }
  }, [dispatch, siteId]);

  useEffect(() => {
    setTableData(landUsesData);
  }, [siteId, resetDetails, landUsesFetchRequestStatus, landUsesData]);

  useEffect(() => {
    if (editModeEnabled) {
      dispatch(fetchLandUseCodes());
    }
  }, [dispatch, editModeEnabled]);

  useEffect(() => {
    dispatch(
      setupLandHistoriesDataForSaving(Array.from(editLandUsesData.values())),
    );
  }, [dispatch, editLandUsesData]);

  const tableLoading =
    landUseCodesFetchRequestStatus === RequestStatus.loading ||
    landUsesFetchRequestStatus === RequestStatus.loading
      ? RequestStatus.loading
      : RequestStatus.idle;

  const getLandUseObjectByCode = (code: string) => {
    return landUseCodes.find((landUseCode: any) => landUseCode.code === code);
  };

  const onTableChange = (event: any) => {
    const editedRowId = event.row.guid;

    if (event.property.includes('select_row')) {
      handleRowSelect(editedRowId);
      return;
    }

    if (event.property.includes('select_all')) {
      event.selected
        ? setSelectedRowIds(new Set(tableData.map((row) => row.guid)))
        : setSelectedRowIds(new Set());
      return;
    }

    const updatedLandUses = tableData.map((landUse) => {
      if (landUse.guid === editedRowId) {
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

    // generate input for update
    const existingLandUse = landUsesData.find((landUse: any) => {
      return landUse.guid === editedRowId;
    });

    const landUseUpdateInput: LandUseUpdateInput = {
      originalLandUseCode: existingLandUse
        ? existingLandUse.landUse.code
        : null,
      [event.property === 'landUse.code' ? 'landUseCode' : event.property]:
        event.value,
    };

    setEditLandUsesData((prev) => {
      const data = new Map(prev);

      data.set(editedRowId, {
        ...(data.get(editedRowId) ?? {}),
        ...landUseUpdateInput,
        userAction: UserActionEnum.updated,
        srAction: SRApprovalStatusEnum.Pending,
      });
      return data;
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
    setEditLandUsesData((prev) => {
      const data = new Map(prev);

      selectedRowIds.forEach((rowId) => {
        const existingLandUse = landUsesData.find((landUse: any) => {
          return landUse.guid === rowId;
        });

        data.set(rowId, {
          originalLandUseCode: existingLandUse
            ? existingLandUse.landUse.code
            : null,
          shouldDelete: true,
          userAction: UserActionEnum.deleted,
          srAction: SRApprovalStatusEnum.Pending,
        });
      });

      return data;
    });

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
      <Widget
        currentPage={1}
        changeHandler={onTableChange}
        title={'Suspect Land Uses'}
        tableColumns={tableColumns}
        tableData={dataWithTextSearchApplied}
        allowRowsSelect={editModeEnabled}
        tableIsLoading={tableLoading}
        editMode={editModeEnabled}
        srMode={viewMode === SiteDetailsMode.SRMode}
        primaryKeycolumnName="guid"
        sortHandler={handleTableSort}
      >
        {editModeEnabled && (
          <div className="d-flex gap-2 flex-wrap ">
            <button
              className="d-flex align-items-center land-uses-btn"
              type="button"
              onClick={handleAddLandUse}
              aria-label={'Add Land Use'}
            >
              <Plus />
              <span className="land-uses-lbl">Add Land Use</span>
            </button>

            <button
              className={`d-flex align-items-center land-uses-btn ${selectedRowIds.size <= 0 && 'land-uses-btn-disabled'}`}
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
