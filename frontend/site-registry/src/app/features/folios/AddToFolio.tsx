import React, { FC, useEffect, useState } from 'react';
import SearchInput from '../../components/search/SearchInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  addSiteToFolio,
  addSiteToFolioRequest,
  fetchFolioItems,
  folioItems,
} from './FolioSlice';
import { getUser, showNotification } from '../../helpers/utility';
import { AppDispatch } from '../../Store';

interface ColumnProps {
  className: string;
  selectedRows: any[];
}

const AddToFolio: FC<ColumnProps> = ({ className, selectedRows }) => {
  const [folioSearchTerm, SetFolioSearchTeam] = useState('');
  const folioDetails = useSelector(folioItems);

  const loggedInUser = getUser();
  const dispatch = useDispatch<AppDispatch>();

  const addSiteToFolioRequestStatus = useSelector(addSiteToFolioRequest);

  const handleFolioSelect = (folioId: string) => {
    let selectedFolio = folioDetails.filter(
      (x: any) => x.folioId === folioId,
    )[0];

    if (selectedRows.length === 0) {
      alert('Please select one or more sites to be added to folio');
      return;
    }

    let rows = selectedRows.map((row) => {
      return {
        siteId: row.id,
        folioId: selectedFolio.id + '',
        id: parseInt(selectedFolio.id),
        whoCreated: loggedInUser?.profile.given_name ?? '',
        userId: loggedInUser?.profile.sub ?? '',
      };
    });

    dispatch(addSiteToFolio(rows)).unwrap();
  };

  useEffect(() => {
    dispatch(fetchFolioItems(loggedInUser?.profile.sub ?? ''));
  }, []);

  useEffect(() => {
    showNotification(
      addSiteToFolioRequestStatus,
      'Successfully added site to folio',
      'Unable to add to folio',
    );
  }, [addSiteToFolioRequestStatus]);

  return (
    <div className={className}>
      <SearchInput
        label={'Search Folios'}
        placeHolderText={'Search Folios'}
        searchTerm={folioSearchTerm}
        clearSearch={() => {
          SetFolioSearchTeam('');        
        }}
        handleSearchChange={(e) => {
          if (e.target) {
            SetFolioSearchTeam(e.target.value);
          } else {
            SetFolioSearchTeam(e);
          }
        }}
        options={folioDetails
          .filter(
            (y: any) =>
              y.folioId.toLowerCase().indexOf(folioSearchTerm.toLowerCase()) !==
              -1,
          )
          .map((x: any) => x.folioId)}
        optionSelectHandler={(value) => {
          handleFolioSelect(value);       
        }}
      />
    </div>
  );
};

export default AddToFolio;
