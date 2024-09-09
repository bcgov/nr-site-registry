import React, { act, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import {
  AngleLeft,
  DropdownIcon,
  FolderPlusIcon,
  MicrophoneIcon,
  ShoppingCartIcon,
  SpinnerIcon,
} from '../../components/common/icon';
import {
  fetchSitesDetails,
  selectSiteDetails,
  trackedChanges,
  clearTrackChanges,
  siteDetailsMode,
  updateSiteDetailsMode,
} from '../site/dto/SiteSlice';
import { AppDispatch } from '../../Store';
import NavigationPills from '../../components/navigation/navigationpills/NavigationPills';
import {
  dropDownNavItems,
  navComponents,
  navItems,
} from './navigation/NavigationPillsConfig';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import {
  CancelButton,
  SaveButton,
} from '../../components/simple/CustomButtons';
import { IChangeType } from '../../components/common/IChangeType';

import './SiteDetails.css'; // Ensure this import is correct
import { SiteDetailsMode } from './dto/SiteDetailsMode';
import { UserType } from '../../helpers/requests/userType';
import Actions from '../../components/action/Actions';
import { ActionItems } from '../../components/action/ActionsConfig';
import {
  formatDate,
  formatDateWithNoTimzoneName,
  getUser,
  showNotification,
} from '../../helpers/utility';
import { addRecentView } from '../dashboard/DashboardSlice';
import { fetchSiteParticipants } from './participants/ParticipantSlice';
import { fetchSiteDisclosure } from './disclosure/DisclosureSlice';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import { fetchNotationParticipants } from './notations/NotationSlice';
import { fetchDocuments } from './documents/DocumentsSlice';
import SearchInput from '../../components/search/SearchInput';
import {
  addSiteToFolio,
  addSiteToFolioRequest,
  fetchFolioItems,
  folioItems,
} from '../folios/redux/FolioSlice';
import { Folio, FolioContentDTO } from '../folios/dto/Folio';
import {
  fetchSnapshots,
  snapshots,
  getFirstSnapshotCreatedDate,
} from './snapshot/SnapshotSlice';
import { RequestStatus } from '../../helpers/requests/status';
import {
  fetchNotationClassCd,
  fetchNotationParticipantRoleCd,
  fetchNotationTypeCd,
  fetchParticipantRoleCd,
  fetchPeopleOrgsCd,
} from './dropdowns/DropdownSlice';
import {
  FormFieldType,
  IFormField,
} from '../../components/input-controls/IFormField';
import BannerDetails from '../../components/banners/BannerDetails';
import { 
  resetSaveSiteDetails,
  resetSaveSiteDetailsRequestStatus,
  saveRequestStatus,
  saveSiteDetails,
  setupSiteIdForSaving,
} from './SaveSiteDetailsSlice';
import { fetchAssociatedSites } from './associates/AssociateSlice';
import { is } from 'date-fns/locale';

const SiteDetails = () => {
  
  const [folioSearchTerm, SetFolioSearchTeam] = useState('');

  const folioDetails = useSelector(folioItems);

  const addSiteToFolioRequestStatus = useSelector(addSiteToFolioRequest);


  const handleFolioSelect = (folioId: string) => {
    let selectedFolio = folioDetails.filter(
      (x: any) => x.folioId === folioId,
    )[0];
    let dto: FolioContentDTO = {
      siteId: details.id,
      folioId: selectedFolio.id + '',
      id: parseInt(selectedFolio.id),
      whoCreated: loggedInUser?.profile.given_name ?? '',
      userId: loggedInUser?.profile.sub ?? '',
    };
    dispatch(addSiteToFolio([dto])).unwrap();
  };

  useEffect(() => {
    showNotification(
      addSiteToFolioRequestStatus,
      'Successfully added site to folio',
      'Unable to add to folio',
    );
  }, [addSiteToFolioRequestStatus]);

  const folioDropdown: IFormField = {
    type: FormFieldType.DropDownWithSearch,
    label: '',
    isLabel: false,
    graphQLPropertyName: 'folioId',
    placeholder: 'Please enter folio .',
    value: '',
    options: [],
    colSize: 'col-lg-6 col-md-6 col-sm-12',
    customLabelCss: 'custom-participant-lbl-text',
    customInputTextCss: 'custom-participant-input-text',
    customEditLabelCss: 'custom-participant-edit-label',
    customEditInputTextCss: 'custom-participant-edit-input',
    tableMode: true,
  };

  const arr: IFormField[] = [folioDropdown];

  const arr2: IFormField[][] = [arr];

  const auth = useAuth();

  const [addToFolioVisible, SetAddToFolioVisible] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const snapshot = useSelector(snapshots);
  const snapshotTakenDate = useSelector(getFirstSnapshotCreatedDate);
  const [edit, setEdit] = useState(false);
  const [showLocationDetails, SetShowLocationDetails] = useState(false);
  const [showParcelDetails, SetShowParcelDetails] = useState(false);
  const [save, setSave] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  useEffect(()=>{

    if(saveSiteDetailsRequestStatus === RequestStatus.success || saveSiteDetailsRequestStatus === RequestStatus.failed)
    {
      if(saveSiteDetailsRequestStatus === RequestStatus.success)
      {
        dispatch(resetSaveSiteDetails(null));
        dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
        setEdit(false);
      }
      else
      {
        // dont close edit mode
      }

      showNotification(
        saveSiteDetailsRequestStatus,
        'Successfully saved site details',
        'Failed To save site details'
      );
      dispatch(resetSaveSiteDetailsRequestStatus(null));

      
    }  
    else
    {
       // do nothing
    }

  },[saveSiteDetailsRequestStatus])


  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const { id } = useParams();

  const details = useSelector(selectSiteDetails);

  const loggedInUser = getUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        // Adjust the scroll position as needed
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (loggedInUser?.profile.preferred_username?.indexOf('bceid') !== -1) {
      setUserType(UserType.External);
    } else if (
      loggedInUser?.profile.preferred_username?.indexOf('idir') !== -1
    ) {
      setUserType(UserType.Internal);
    } else {
      // not logged in
      setUserType(UserType.External);
    }
    dispatch(fetchFolioItems(loggedInUser?.profile.sub ?? ''));
  }, []);

  const savedChanges = useSelector(trackedChanges);
  const mode = useSelector(siteDetailsMode);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    setIsLoading(true); // Set loading state to true before starting API calls
    if (id) {
      dispatch(resetSaveSiteDetails(null));
      dispatch(setupSiteIdForSaving(id));
      Promise.all([
        dispatch(fetchSnapshots(id ?? '')),
        dispatch(fetchSitesDetails({ siteId: id ?? '' })),
      ])
        .then(() => {
          setIsLoading(false); // Set loading state to false after all API calls are resolved
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (details && details.id === id) {
      handleAddRecentView(details);
    }
  }, [details]);

  const handleItemClick = (value: string) => {
    switch (value) {
      case SiteDetailsMode.EditMode:
        setEdit(true);
        setViewMode(SiteDetailsMode.EditMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.EditMode));
        break;
      case SiteDetailsMode.SRMode:
        setEdit(true);
        setViewMode(SiteDetailsMode.SRMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.SRMode));
        break;
      case SiteDetailsMode.ViewOnlyMode:
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
  };

  const handleAddRecentView = async (details: any) => {
    try {
      if (details) {
        await dispatch(
          addRecentView({
            userId: loggedInUser?.profile.preferred_username ?? '',
            siteId: details.id,
            address: details.addrLine_1,
            city: details.city,
            generalDescription: details.generalDescription,
            whenUpdated: new Date(details.whenUpdated),
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  };
  const handleAddToCart = () => {
    console.log('nupur - Add to cart clicked');
    dispatch(resetCartItemAddedStatus);
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      console.log('nupur - Not logged in');
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      console.log('nupur - Adding to cart for id: ', details.id);
      console.log('nupur - id:', details.id);
      dispatch(resetCartItemAddedStatus(null));
      dispatch(
        addCartItem([
          {
            userId: loggedInUser.profile.sub,
            siteId: details.id,
            whoCreated: loggedInUser.profile.given_name ?? '',
            price: 200.11,
          },
        ]),
      ).unwrap();
    }
  };

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const [isListening, setIsListening] = useState(false);
  const isListeningRef =  useRef(isListening);

  useEffect(() => { 
    isListeningRef.current = isListening;
  }, [isListening]);

  const [showActions, setShowActions] = useState(false);
  type SpeechRecognitionType = typeof SpeechRecognition | null;
  const [recognition, setRecognition] = useState<SpeechRecognitionType>(null);
  const [activeComponent, setActiveComponent] = useState<JSX.Element | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [matchedIndex, setMatchedIndex] = useState(-1);
  // Toggle showActions state
  // const toggleActionsVisibility = () => {
  //   console.log('nupur - Toggling actions visibility...');
  //   setShowActions(!showActions);
  // };
  
  useEffect(() => {
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onresult = (event: any) => {
      if(isListeningRef.current) {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const command = event.results[i][0].transcript.trim().toLowerCase();
            console.log('nupur - command is : ', command);
            console.log('nupur - Entire navItems array:', navItems);
            const matchedIndex = navItems.findIndex(item => command.toLowerCase().includes(item.toLowerCase()));
            setMatchedIndex(matchedIndex);
            console.log('nupur - matchedIndex:', matchedIndex);
            console.log('nupur - navItems:', navItems[matchedIndex]);
            console.log('nupur - navComponents:', navComponents[matchedIndex]);
            if (matchedIndex !== -1) {
              console.log('nupur - Match found in navItems:', navItems[matchedIndex]);
            } else {
              console.log('nupur - No match found in navItems for command');
            }
            //console.log('nupur - navComponents:', navComponents[matchedIndex]);
            
            if(command.includes("enable mic") || command.includes("enable mike")) {
              console.log('Enabling mic...');
              //toggleSpeechRecognition();
              handleStartListening();
            }
            console.log('nupur - isListening is : ', isListening);
            if (command.includes("add to cart")) {
              handleAddToCart();
            } else if (command.includes("notations") || command.includes("summary") || command.includes("associated sites") ||
              command.includes("documents") || command.includes("suspect land uses") || command.includes("parcel description") ||
                command.includes("site disclosure")) {
              
              setActiveComponent(navComponents[matchedIndex]);
              setActiveTab(navItems[matchedIndex]);
            }
            // Add more conditions as needed
            else if (command.includes("edit mode")) {
              setEdit(true);
              setViewMode(SiteDetailsMode.EditMode);
            } else if (command.includes("sr mode")) {
              setEdit(true);
              setViewMode(SiteDetailsMode.SRMode);
            } else if (command.includes("view mode")) {
              setEdit(false);
              setViewMode(SiteDetailsMode.ViewOnlyMode);
            } else if (command.includes("cancel")) {
              setSave(false);
              setEdit(false);
              setViewMode(SiteDetailsMode.ViewOnlyMode);
              setShowActions(false);
            } else if (command.includes("go back") || command.includes("stop")) {
              setIsListening(false);
              recognitionInstance.stop();
              onClickBackButton();
            }  else if (command.includes("show action")) {
              setShowActions(true);
            } else if (command.includes("hide action")) {
              setShowActions(false);
             }
            
            else {
              console.log("Speech Command not recognized:", command);
              // Handle unrecognized command or do nothing
            
            }
          }
        }
      }
    };
    setRecognition(recognitionInstance);
    handleStartListening();
    recognitionInstance.start();
    return () => {
      console.log('nupur - Cleaning up speech recognition in SiteDetails...');
      handleStopListening();
      recognitionInstance.stop();
    };
  }, []);

  
  const initializeSpeechRecognition = () => {
    console.log('nupur - Initializing speech recognition...');
    if (recognition) {
      //recognition.start();
      //setIsListening(true);
      recognition.onend = () => {
        if (isListening) {
          console.log('nupur - Restarting speech recognition...');
          recognition.start(); // Restart recognition if still listening
        }
      };
      recognition.onerror = (event: any) => {
        console.error('nupur - Speech recognition error:', event.error);
      //setError('Voice recognition failed. Please try again.');
        //handleSessionTimeout();
      };
    }
  };

  const handleSessionTimeout = () => {
    // Optionally restart recognition or notify the user
    setIsListening(false); // Stop listening if it was active
    setTimeout(() => {
        setIsListening(true); // Restart listening after a short delay
    }, 1000); // Adjust delay as needed
  };
  
  const handleStartListening = () => {
    console.log('nupur - Starting speech recognition...');
    //setIsListening(true);
    initializeSpeechRecognition();
  };
  
  const handleStopListening = () => {
    console.log('nupur - Stopping speech recognition...');
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleMicButtonClick = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      switch (result.state) {
        case 'granted':
          // Permission has already been granted
          //alert('Microphone is ready to use.');
          toggleSpeechRecognition();
          // Here, you can also start using the microphone directly
          break;
        case 'denied':
          // Permission has been denied
          alert('Microphone permission has been denied. Please enable it in your browser settings.');
          break;
        case 'prompt':
          const userAgreed = window.confirm("This app wants to use your microphone. Do you want to allow it?");
          if (userAgreed) {
            // Step 3: Request permission
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              // Permission granted, microphone enabled
              console.log("Microphone permission granted.");
              // Proceed with enabling the microphone feature in your app
            } catch (error) {
              // Permission denied or an error occurred
              console.error("Microphone permission denied or not available.", error);
            }
          }
          // This case might not occur if permission is already granted but is here for completeness
          //alert('Please allow microphone access.');
          // Here, you would normally request permission
          break;
        default:
          console.error('Unexpected permission state');
      }
      result.onchange = () => {
        console.log('nupur - Microphone permission state has changed', result.state);
      };
    }catch (error) {  
      console.error('nupur - Error checking microphone permission', error);
    }
  };


  const toggleSpeechRecognition = () => {
    console.log('nupur - Toggling speech recognition...before toggle isListening: ', isListening);
    isListeningRef.current = !isListeningRef.current;
    setIsListening(isListeningRef.current);
    console.log('nupur - isListening after toggling is set to:', isListeningRef.current);
    if (isListeningRef.current) { 
      handleStartListening(); // Ensure this starts the recognition
    } else {
      handleStopListening(); // Ensure this stops the recognition
    }
  };

  // const InfoBanner = () => (
  //   <div className='infoBanner'>
  //     Say "Enable mic" to start speaking.
  //   </div>
  // );

  async function checkMicrophonePermission() {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'granted') {
        console.log('nupur - Microphone permission granted');
        // Permission has been granted, you can start audio capture
      } else if (result.state === 'prompt') {
        console.log('nupur - Microphone permission is prompt');
        // Permission needs to be requested (e.g., the user has not yet granted or denied permission)
        const userAgreed = window.confirm("This app wants to use your microphone. Do you want to allow it?");

          if (userAgreed) {
            // Step 3: Request permission
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              // Permission granted, microphone enabled
              console.log("Microphone permission granted.");
              // Proceed with enabling the microphone feature in your app
            } catch (error) {
              // Permission denied or an error occurred
              console.error("Microphone permission denied or not available.", error);
            }
          }
        } else if (result.state === 'denied') {
          console.log('nupur - Microphone permission denied');
          // Permission has been denied, you cannot start audio capture
        }
  
      // Optional: Listen for changes in permission state
      result.onchange = () => {
        if(result.state === 'granted') {
          
            alert('Microphone permission has been granted. You can now use the microphone.');
          
           console.log('nupur - Microphone permission state has changed', result.state);
        }
      } 
    }
    catch (error) {
      console.error('nupur - Error checking microphone permission', error);
      // This can happen if the browser doesn't support the Permissions API or the 'microphone' permission name
    }
  }
  
  // Call the function to check microphone permissions
  //checkMicrophonePermission();

  if (isLoading || snapshot.status === RequestStatus.loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner-container">
          <SpinnerIcon data-testid="loading-spinner" className="site-fa-spin" />
        </div>
      </div>
    );
  }
  if (snapshot.status === RequestStatus.failed)
    return <div>Error: {snapshot.error || 'Failed to load data'}</div>;

  return (
    <>
      {isVisible && (
        <div className="d-flex justify-content-between custom-sticky-header w-100">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Voice command activation button */}
          <button
            className={`micButton ${isListening ? "micEnabled" : "micDisabled"}`}
            onClick= {handleMicButtonClick}
            aria-label="Activate voice command"
          >
            
            <MicrophoneIcon /> {/* Replace with your microphone icon */}
            {isListeningRef.current && <span className="speaking-dots">•••</span>}
          </button>
          <button
            className="d-flex btn-back align-items-center me-3"
            onClick={onClickBackButton}
          >
            <AngleLeft className="btn-icon" />
          </button>
            <button
              className="d-flex btn-back align-items-center me-3"
              onClick={onClickBackButton}
            >
              <AngleLeft className="btn-icon" />
              <span className="btn-back-lbl">Back </span>
            </button>
            <div className="d-flex  flex-wrap  align-items-center gap-2 pe-3 custom-sticky-header-lbl">
              Site ID:{' '}
              <span className="custom-sticky-header-txt">{id ?? ''}</span>
              <span className="d-flex align-items-center justify-content-center px-2 custom-dot">
                .
              </span>
              <div className="custom-sticky-header-lbl">
                <span>{details && details.addrLine_1}</span>
              </div>
            </div>
          </div>
         
          <div className="d-flex gap-2 justify-align-center pe-2 position-relative">
            {/* For Action Dropdown*/}
            {!edit &&
              viewMode === SiteDetailsMode.ViewOnlyMode &&
              userType === UserType.Internal && (
                <Actions
                  label="Action"
                  items={ActionItems}
                  onItemClick={handleItemClick}
                  showActions={showActions}
                />
              )}

            {/* For Edit / SR Dropdown*/}
            <div className="d-flex gap-3 align-items-center">
              {edit && userType === UserType.Internal && (
                <>
                  <CustomLabel
                    labelType="c-b"
                    label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                  />
                  <SaveButton clickHandler={() => setSave(true)} />
                  <CancelButton clickHandler={handleCancelButton} />
                </>
              )}
            </div>

            {/* For Cart /Folio Controls*/}
            {!edit &&
              viewMode === SiteDetailsMode.ViewOnlyMode &&
              userType === UserType.External && (
                <>
                  <div
                    className="d-flex btn-cart align-items-center "
                    onClick={() => handleAddToCart()}
                  >
                    <ShoppingCartIcon className="btn-icon" />
                    <span className="btn-cart-lbl"> Add to Cart</span>
                  </div>
                  <div
                    className="d-flex btn-folio align-items-center"
                    onClick={() => {
                      SetAddToFolioVisible(!addToFolioVisible);
                    }}
                  >
                    <FolderPlusIcon className="btn-folio-icon" />
                    <span className="btn-folio-lbl"> Add to Folio</span>
                    <DropdownIcon className="btn-folio-icon" />
                  </div>
                  {addToFolioVisible && (
                    <div className="pos-absolute">
                      <SearchInput
                        label={'Search Folios'}
                        placeHolderText={'Search Folios'}
                        searchTerm={folioSearchTerm}
                        clearSearch={() => {
                          SetFolioSearchTeam('');
                          //SetAddToFolioVisible(false);
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
                              y.folioId
                                .toLowerCase()
                                .indexOf(folioSearchTerm.toLowerCase()) !== -1,
                          )
                          .map((x: any) => x.folioId)}
                        optionSelectHandler={(value) => {
                          handleFolioSelect(value);
                          SetAddToFolioVisible(false);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      )}
      <PageContainer role="details">
        {save && (
          <ModalDialog
            closeHandler={(response) => {
              setSave(false);
              if (response) {
                
               
               
                dispatch(saveSiteDetails(null)).unwrap();
              
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

        {!isVisible && (
          <div className="d-flex justify-content-between">
             <button
            className={`micButton ${isListening ? "micEnabled" : "micDisabled"}`}
            onClick={handleMicButtonClick}
            
            aria-label="Activate voice command"
          >
            
            <MicrophoneIcon /> {/* Replace with your microphone icon */}
            {isListening && <span className="speaking-dots">•••</span>}
          </button>
            <button
              className="d-flex btn-back align-items-center"
              onClick={onClickBackButton}
            >
        
              <AngleLeft className="btn-icon" />
              <span className="btn-back-lbl">Back to</span>
            </button>
            
            <div className="d-flex gap-2 justify-align-center pe-2 pos-relative">
              {/* For Action Dropdown*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.Internal && (
                  <Actions
                    label="Action"
                    items={ActionItems}
                    onItemClick={handleItemClick}
                    showActions={showActions}
                  />
                )}

              {/* For Edit / SR Dropdown*/}
              <div className="d-flex gap-3 align-items-center">
                {edit && userType === UserType.Internal && (
                  <>
                    <CustomLabel
                      labelType="c-b"
                      label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                    />
                    <SaveButton clickHandler={() => setSave(true)} />
                    <CancelButton clickHandler={handleCancelButton} />
                  </>
                )}
              </div>

              {/* For Cart /Folio Controls*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.External && (
                  <>
                    <div
                      className="d-flex btn-cart align-items-center"
                      onClick={() => handleAddToCart()}
                    >
                      <ShoppingCartIcon className="btn-icon" />
                      <span className="btn-cart-lbl"> Add to Cart</span>
                    </div>
                    <div
                      className="d-flex btn-folio align-items-center"
                      onClick={() => {
                        SetAddToFolioVisible(!addToFolioVisible);
                      }}
                    >
                      <FolderPlusIcon className="btn-folio-icon" />
                      <span className="btn-folio-lbl"> Add to Folio</span>
                      <DropdownIcon className="btn-folio-icon" />
                    </div>
                    {addToFolioVisible && (
                      <div className="pos-absolute">
                        <SearchInput
                          label={'Search Folios'}
                          placeHolderText={'Search Folios'}
                          searchTerm={folioSearchTerm}
                          clearSearch={() => {
                            SetFolioSearchTeam('');
                            //SetAddToFolioVisible(false);
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
                                y.folioId
                                  .toLowerCase()
                                  .indexOf(folioSearchTerm.toLowerCase()) !==
                                -1,
                            )
                            .map((x: any) => x.folioId)}
                          optionSelectHandler={(value) => {
                            handleFolioSelect(value);
                            SetAddToFolioVisible(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        )}
        <div className="section-details-header row">
          {UserType.External === userType && (
            <div>
              <BannerDetails
                snapshotDate={`Snapshot Taken: ${formatDateWithNoTimzoneName(new Date(snapshotTakenDate))}`}
              />
            </div>
          )}
          
          {!isVisible && (
            <>
              <div>
                <CustomLabel label="Site ID: " labelType="b-h5" />
                <CustomLabel label={id ?? ''} labelType="r-h5" />
              </div>
              <div>
                <CustomLabel
                  label={details && details.addrLine_1}
                  labelType="b-h1"
                />
              </div>
            </>
          )}
        </div>
        <NavigationPills
          items={navItems}
          components={navComponents}
          dropdownItems={dropDownNavItems}
          isDisable={
            UserType.External === userType && snapshot.snapshot.data === null
          }
          matchedIndex={matchedIndex}
        />
  
      </PageContainer>
    </>
  );
};

export default SiteDetails;
