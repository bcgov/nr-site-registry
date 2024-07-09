import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CustomLabel from "../../components/simple/CustomLabel";
import PageContainer from "../../components/simple/PageContainer";
import LabelComponent from "./LabelComponent";
import {
  ChevronDown,
  ChevronUp,
  AngleLeft,
  DropdownIcon,
  FolderPlusIcon,
  ShoppingCartIcon,
} from "../../components/common/icon";
import { TableColumn } from "../../components/table/TableColumn";
import Table from "../../components/table/Table";
import { RequestStatus } from "../../helpers/requests/status";
import SummaryForm from "./SummaryForm";
import PanelWithUpDown from "../../components/simple/PanelWithUpDown";
import {
  fetchSitesDetails,
  selectSiteDetails,
  trackChanges,
  trackedChanges,
  clearTrackChanges,
  siteDetailsMode,
  updateSiteDetailsMode,
} from "../site/dto/SiteSlice";
import { AppDispatch } from "../../Store";
import Notations from "./notations/Notations";
import NavigationPills from "../../components/navigation/navigationpills/NavigationPills";
import { dropDownNavItems, navComponents, navItems } from "./NavigationPillsConfig";
import ModalDialog from "../../components/modaldialog/ModalDialog";
import {
  CancelButton,
  CustomPillButton,
  SaveButton,
} from "../../components/simple/CustomButtons";
import {
  ChangeTracker,
  IChangeType,
} from "../../components/common/IChangeType";

import "./SiteDetails.css"; // Ensure this import is correct
import { FormFieldType } from "../../components/input-controls/IFormField";
import { SiteDetailsMode } from "./dto/SiteDetailsMode";
import { UserType } from "../../helpers/requests/userType";
import { UserMode } from "../../helpers/requests/userMode";
import Actions from "../../components/action/Actions";
import { ActionItems } from "../../components/action/ActionsConfig";
import { getUser } from "../../helpers/utility";
import { addRecentView } from "../dashboard/DashboardSlice";
import { fetchParticipantRoleCd, fetchPeopleOrgsCd } from "./dropdowns/DropdownSlice";
import { fetchSiteParticipants } from "./participants/ParticipantSlice";
import { addCartItem, resetCartItemAddedStatus } from "../cart/CartSlice";
import { useAuth } from "react-oidc-context";

const SiteDetails = () => {

 


  const auth = useAuth();

  const [edit, setEdit] = useState(false);
  const [showLocationDetails, SetShowLocationDetails] = useState(false);
  const [showParcelDetails, SetShowParcelDetails] = useState(false);
  const [save, setSave] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);

  const dispatch = useDispatch<AppDispatch>();
    
  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const { id } = useParams();

  const details = useSelector(selectSiteDetails);
  const loggedInUser = getUser();
  useEffect(()=>{
    if(loggedInUser?.profile.preferred_username?.indexOf("bceid") !== -1)
      {
        setUserType(UserType.External);
      }
      else if (loggedInUser?.profile.preferred_username?.indexOf("idir") !== -1)
      {
        setUserType(UserType.Internal);
      }
      else
      {
        // not logged in 
        setUserType(UserType.External);
  
      }
  }, [])
 

 
  const savedChanges = useSelector(trackedChanges);
  const mode = useSelector(siteDetailsMode);
  useEffect(()=> {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    dispatch(fetchSitesDetails({ siteId: id ?? "" }));
    dispatch(fetchPeopleOrgsCd());
    dispatch(fetchParticipantRoleCd());
    dispatch(fetchSiteParticipants(id ?? ''));
  }, [id]);

  useEffect(() => {
    if(details && details.id === id)
    {
      handleAddRecentView(details);
    }
  }, [details]);

  
  const handleItemClick = (value: string) => {
    switch(value)
    {
      case SiteDetailsMode.EditMode :
       setEdit(true);
       setViewMode(SiteDetailsMode.EditMode);
       dispatch(updateSiteDetailsMode(SiteDetailsMode.EditMode));
       break;
      case SiteDetailsMode.SRMode :
       setEdit(true);
       setViewMode(SiteDetailsMode.SRMode);
       dispatch(updateSiteDetailsMode(SiteDetailsMode.SRMode));
       break;
      case SiteDetailsMode.ViewOnlyMode :
       setEdit(false);
       setViewMode(SiteDetailsMode.ViewOnlyMode);
       dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
       break;
      default:
       break;
    }
 };

  const handleCancelButton = () => {
    dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
    dispatch(clearTrackChanges({}));
    setSave(false);
    setEdit(false);
  }

  const handleAddRecentView = async (details: any) => {
    try {
      if(details)
      {
        await dispatch(
          addRecentView({
            userId: loggedInUser?.profile.preferred_username ?? '',
            siteId: details.id,
            address: details.addrLine_1,
            city: details.city,
            generalDescription: details.generalDescription,
            whenUpdated: new Date(details.whenUpdated),
          })
        );
      }
    } 
    catch (error) 
    {
        throw error;
    }
  };
  const handleAddToCart = ()=>{

    dispatch(resetCartItemAddedStatus);
    const loggedInUser = getUser();
    if(loggedInUser === null)
    {
     
      auth.signinRedirect(
         {extraQueryParams:{'kc_idp_hint':'bceid'}})
    }
    else
    {
    
      dispatch(resetCartItemAddedStatus(null));
      dispatch(addCartItem({ userId: loggedInUser.profile.sub , siteId:details.id, 
        whoCreated: loggedInUser.profile.given_name ?? "", price:200.11})).unwrap()
    }
   

  }



  return (
    <PageContainer role="details">
      {save && (
        <ModalDialog
          closeHandler={(response) => {
           
            setSave(false);
            if(response)
              {
                dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
                setEdit(false);
              }
          }}
        >
          {savedChanges.length > 0 ? (
            <React.Fragment>
              <div>
                <span className="custom-modal-data-text">
                  The following fields will be updated:
                </span>
              </div>
              <div>
                <ul className="custom-modal-data-text">
                  {savedChanges.map((item: any) => (
                    <li key={item.label}>
                      {IChangeType[item.changeType]} {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div>
                <span className="custom-modal-data-text">
                  No changes to save
                </span>
              </div>
            </React.Fragment>
          )}
        </ModalDialog>
      )}

      <div className="d-flex justify-content-between">
        <button className="d-flex btn-back align-items-center" onClick={onClickBackButton}>
          <AngleLeft className="btn-icon" />
          <span className="btn-back-lbl">Back to</span>
        </button>
        <div className="d-flex gap-2 justify-align-center pe-2">

         {/* { <Actions label="User" items={ [
                { 
                    label:'External User',
                    value: UserType.External
                },
                {
                    label:'Internal User',
                    value: UserType.Internal
                },
                
            ]} 
            onItemClick={handleUserClick} /> } */}
          {/* For Action Dropdown*/}
          {(!edit && viewMode === SiteDetailsMode.ViewOnlyMode && userType === UserType.Internal) && <Actions label="Action" items={ActionItems} onItemClick={handleItemClick} /> }
           
           
          {/* For Edit / SR Dropdown*/}
            <div className="d-flex gap-3 align-items-center">
            {edit && userType === UserType.Internal &&
              <>
                <CustomLabel labelType="c-b" label={`${ viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`} />
                <SaveButton clickHandler={() => setSave(true)} />
                <CancelButton clickHandler={handleCancelButton} />
              </>
            }
          </div>
          
          {/* For Cart /Folio Controls*/}
          { (!edit && viewMode === SiteDetailsMode.ViewOnlyMode && userType === UserType.External) &&
            <>
              <button className="d-flex btn-cart align-items-center" onClick={()=>handleAddToCart()}>
                <ShoppingCartIcon className="btn-icon" />
                <span className="btn-cart-lbl"> Add to Cart</span>
              </button>
              <button className="d-flex btn-folio align-items-center">
                <FolderPlusIcon className="btn-folio-icon" />
                <span className="btn-folio-lbl"> Add to Folio</span>
                <DropdownIcon className="btn-folio-icon" />
              </button>
            </>
          }
        </div>
      </div>
      <div className="section-details-header row">
        <div>
          <CustomLabel label="Site ID: " labelType="b-h5" />
          <CustomLabel label="1" labelType="r-h5" />
        </div>
        <div>
          <CustomLabel label="2929 Quadra" labelType="b-h1" />
        </div>
      </div>
      <NavigationPills items={navItems} components={navComponents} dropdownItems={dropDownNavItems}/>
    </PageContainer>
  );
};

export default SiteDetails;
