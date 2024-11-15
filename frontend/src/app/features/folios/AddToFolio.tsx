import { FC, isValidElement, ReactElement, useEffect, useState } from 'react';
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
import { Button } from '../../components/button/Button';
import { ModalDialogWrapperWithHeader } from '../../components/modaldialog/ModalDialog';
import useMediaQuery from '../../hooks/useMediaQuery';

interface AddToFolioProps {
  label?: string;
  disabled?: boolean;
  selectedSiteIds: string[];
  popupPlacement?: Placement;
  triggerClassName?: string;
  triggerElement?: ReactElement;
}

const AddToFolio: FC<AddToFolioProps> = ({
  label,
  disabled = false,
  selectedSiteIds,
  popupPlacement = 'bottom-start',
  triggerClassName,
  triggerElement,
}) => {
  const isSmallDevices = useMediaQuery('(max-width: 575px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [show, setShow] = useState(false);

  const auth = useAuth();

  const [getFolioItems, { loading, data }] =
    useFolio_GetFolioItemsForUserLazyQuery();

  const [addSiteToFolio] = useFolio_AddSiteToFolioMutation({
    onCompleted: () => {
      notifySuccess('Successfully added site to folio');
      setShow(false);
    },
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
    return (
      <SearchInput
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
          if (value === 'close') {
            setShow(false);
          } else {
            handleFolioSelect(value);
          }
        }}
        showCloseBtnInDropdownOptions={showCloseBtnInDropdownOptions}
      />
    );
  };

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

  return (
    <OverlayTrigger
      show={show}
      trigger="click"
      placement={popupPlacement}
      rootClose // closes the popover on outside click
      transition={false}
      onToggle={(open) => {
        setShow(open);
        if (open && checkUserAuthentication()) {
          getFolioItems();
        }
      }}
      overlay={
        !isSmallDevices ? (
          <Popover className="folio-popover">{renderSearchInput()}</Popover>
        ) : (
          <ModalDialogWrapperWithHeader closeHandler={() => {}}>
            <div className="d-flex  flex-column justify-content-center">
              {renderSearchInput(true)}
              <div
                onClick={() => setShow(false)}
                className="d-flex flex-row align-items-center pt-2 justify-content-center "
              >
                <XmarkIcon className="custom-search-label"></XmarkIcon>
                <span className="custom-search-label">Close</span>
              </div>
            </div>
          </ModalDialogWrapperWithHeader>
        )
      }
    >
      {isValidElement(triggerElement) ? (
        triggerElement
      ) : (
        <Button
          variant="secondary"
          className={triggerClassName}
          disabled={disabled}
        >
          <FolderPlusIcon /> <span>{label}</span>
        </Button>
      )}
    </OverlayTrigger>
  );
};

export default AddToFolio;
