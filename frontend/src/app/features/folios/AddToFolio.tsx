import { FC, useState } from 'react';
import SearchInput from '../../components/search/SearchInput';
import { FolderPlusIcon } from '../../components/common/icon';
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
}

const AddToFolio: FC<AddToFolioProps> = ({
  label,
  disabled = false,
  selectedSiteIds,
  popupPlacement = 'bottom-start',
  triggerClassName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const auth = useAuth();

  const [getFolioItems, { loading, data }] =
    useFolio_GetFolioItemsForUserLazyQuery();

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
              handleFolioSelect(value);
            }}
          />
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
};

export default AddToFolio;
