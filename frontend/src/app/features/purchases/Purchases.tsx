import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from 'react-oidc-context';
import { signInWithReturnUrl } from '../../auth/returnUrl';
import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import { getUser } from '../../helpers/utility';
import { AppDispatch } from '../../Store';
import { TableColumn } from '../../components/table/TableColumn';
import { PurchasesTableColumns } from './PurchasesTableConfig';
import {
  fetchPurchasedSites,
  selectPurchasedSites,
  selectPurchasesTotalRecords,
  selectPurchasesSortBy,
  selectPurchasesSortByDir,
} from './PurchasesSlice';

const Purchases = () => {
  const auth = useAuth();
  const user = getUser();
  const dispatch = useDispatch<AppDispatch>();

  const purchasedSites = useSelector(selectPurchasedSites);
  const totalRecords = useSelector(selectPurchasesTotalRecords);
  const sortBy = useSelector(selectPurchasesSortBy);
  const sortByDir = useSelector(selectPurchasesSortByDir);

  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  useEffect(() => {
    if (user === null) {
      signInWithReturnUrl(auth);
    }
  }, []);

  useEffect(() => {
    dispatch(
      fetchPurchasedSites({
        page: currentPage,
        pageSize: resultsPerPage,
        sortBy,
        sortByDir,
      }),
    );
  }, [currentPage, resultsPerPage]);

  const columnToSortByMap: Record<string, string> = {
    siteId: 'siteId',
    address: 'address',
    city: 'city',
    purchaseDate: 'purchaseDate',
    status: 'status',
  };

  const handleSortChange = (column: TableColumn, ascSort: boolean) => {
    const newSortBy =
      columnToSortByMap[column.graphQLPropertyName] ?? 'purchaseDate';
    const newSortByDir = ascSort ? 'ASC' : 'DESC';
    dispatch(
      fetchPurchasedSites({
        page: currentPage,
        pageSize: resultsPerPage,
        sortBy: newSortBy,
        sortByDir: newSortByDir,
      }),
    );
  };

  const formattedData = purchasedSites.map((site: any) => ({
    ...site,
    purchaseDate: site.purchaseDate
      ? new Date(site.purchaseDate).toLocaleString()
      : '',
  }));

  return (
    <PageContainer role="purchases">
      <div>
        <CustomLabel label="Site Details" labelType="b-h1" />
      </div>
      <div className="col-12">
        <Table
          showPageOptions={true}
          label="Site Details"
          isLoading={RequestStatus.success}
          columns={PurchasesTableColumns}
          data={formattedData}
          totalResults={totalRecords}
          selectPage={(page: number) => setCurrentPage(page)}
          changeResultsPerPage={(size: number) => setResultsPerPage(size)}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          allowRowsSelect={false}
          changeHandler={() => {}}
          editMode={false}
          idColumnName="siteId"
          sortHandler={handleSortChange}
        />
      </div>
    </PageContainer>
  );
};

export default Purchases;
