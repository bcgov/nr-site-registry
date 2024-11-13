import { FC, useEffect, useState } from 'react';
import SearchInput from '../../components/search/SearchInput';
import { FolderPlusIcon, XmarkIcon } from '../../components/common/icon';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import {
  useFolio_GetFolioItemsForUserLazyQuery,
  useFolio_AddSiteToFolioMutation,
} from '../../../graphql/generated';
import { notifyError, notifySuccess } from '../../components/alert/Alert';
import { getUser } from '../../helpers/utility';
import { useAuth } from 'react-oidc-context';
import { Placement } from 'react-bootstrap/esm/types';
import clsx from 'clsx';

interface AddToFolioProps {
  label?: string;
  disabled?: boolean;
  selectedSiteIds: string[];
  popupPlacement?: Placement;
  triggerClassName?: string;
  showSearchBoxOnly?: boolean;
  handleClose?: (event:any)=>void;
}

const AddToFolio: FC<AddToFolioProps> = ({
  label,
  disabled = false,
  selectedSiteIds,
  popupPlacement = 'bottom-start',
  triggerClassName,
  showSearchBoxOnly = false,
  handleClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  handleClose = handleClose ??( (event:any)=>{});

  const auth = useAuth();

  const [getFolioItems, { loading, data }] =
    useFolio_GetFolioItemsForUserLazyQuery();

   useEffect(()=>{
    if (showSearchBoxOnly) {
      getFolioItems();
    }
   }, []) 

  const [addSiteToFolio] = useFolio_AddSiteToFolioMutation({
    onCompleted: () => notifySuccess('Successfully added site to folio'),
    onError: () => notifyError('Unable to add to folio'),
  });

  const checkUserAuthentication = () => {
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({
        extraQueryParams: { kc_idp_hint: 'bceid' },
      });
      return false;
    }

    return true;
  };

  const folioItems =
    data?.getFolioItemsForUser.data?.filter((folio) => {
      const regex = new RegExp(searchTerm, 'i');
      return regex.test(folio.folioId);
    }) || [];

  const searchOptions = folioItems.map((folio) => {
    return {
      label: folio.folioId,
      value: folio.id,
    };
  });


  const renderSearchInput = (showCloseBtnInDropdownOptions?: boolean) => {
   return <SearchInput
        loading={loading}
        label={'Search Folios'}
        placeHolderText={'Search Folios'}
        searchTerm={searchTerm}
        clearSearch={() => {
          setSearchTerm('');
        }}
        handleSearchChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        options={searchOptions}
        optionSelectHandler={(value) => {
          if(value==='close')
          {
            handleClose && handleClose(null);
          }
          else
          {
          handleFolioSelect(value);
          }
        }}
       showCloseBtnInDropdownOptions={showCloseBtnInDropdownOptions}
      />
  }

  const handleFolioSelect = (selectedFolio: (typeof searchOptions)[number]) => {
    addSiteToFolio({
      variables: {
        addSiteToFolioDTO: selectedSiteIds.map((siteId) => {
          return {
            id: selectedFolio.value,
            siteId,
          };
        }),
      },
    });
  };

  if (!showSearchBoxOnly) {
    return (
      <OverlayTrigger
        trigger="click"
        placement={popupPlacement}
        rootClose // closes the popover on outside click
        transition={false}
        onToggle={(open) => {
          if (open && checkUserAuthentication()) {
            getFolioItems();
          }
        }}
        overlay={
          <Popover className="folio-popover">
            {renderSearchInput()}
          </Popover>
        }
      >
        <button
          className={clsx([
            'search-result-actions-btn',
            'search-result-actions-btn-highlight',
            triggerClassName,
          ])}
          disabled={disabled}
        >
          <FolderPlusIcon />
          <span>{label}</span>
        </button>
      </OverlayTrigger>
    );
  } else {
    
  return (
    <div className="d-flex  flex-column justify-content-center">
        {renderSearchInput(true)}
      <div
        onClick={handleClose}
        className="d-flex flex-row align-items-center pt-2 justify-content-center "      >        
        <XmarkIcon className="custom-search-label"></XmarkIcon>
        <span className='custom-search-label'>Close</span>
      </div>
    </div>
  );

  }
};

export default AddToFolio;
