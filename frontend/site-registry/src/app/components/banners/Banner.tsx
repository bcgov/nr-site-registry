import React from "react";
import "./banner.css";
import { Icon, backdropClasses } from "@mui/material";
import checkIcon from "../../images/tick.png";
import {TickIcon, ExclamationCircle, ExclamationTriangle} from "../common/icon";
import { Dispatch } from "react";
import { useDispatch } from "react-redux";

const imagePath = "/Users/ndixit/Documents/nr-site-registry/frontend/site-registry/src/app";

interface BannerProps {
  type: string;
}

const Banner: React.FC<BannerProps> = ({ type }) => {
  let message = '';
  let detailMessage1 = '';
  let detailMessage2 = '';
  let detailMessage3 = '';

  switch (type) {
    case 'outdated':
      message = 'Outdated';
      detailMessage1 = "Your current snapshot is an older version of this site's details. Please purchase another\
      \snapshot to view updates.";
      break;
    case 'pending':
      message = 'Changes Pending';
      detailMessage1 = "This site has updates pending approvals.";
      detailMessage2 = "If this site has not been updated by next week, please contact ";
      detailMessage3 = "SiteRemediation@gov.bc.ca.";
      break;
    case 'current':
      message = 'Current';
      break;
    default:
      message = '';
      break;
  }

  
  return (
    <div>
      <div className="d-flex status-banner-container ">
        <div className={`d-flex align-items-center ${type==="current" ? "status-banner-message message-current"
        : type === "outdated" ? "status-banner-message message-outdated" : "status-banner-message message-pending"}`} >
          
            {type === "current" ? <TickIcon className="m-1 m-2 icon icon-current"/> : type ==="outdated" ? 
            <ExclamationCircle className="m-1 m-2 icon icon-outdated" /> : <ExclamationTriangle className="m-1 m-2 icon icon-pending"/>}
        
              
            <span className="status-message">     
                {message}
            </span> 
        
        </div>
        
    </div>
    
      <div className={`${type === "outdated" ? "d-flex justify-content-between status-message-details p-3 message-outdated"
        : type === "pending" ? "d-flex justify-content-between status-message-details message-pending" : "hidden"}`}>
          <span className="d-flex m-1 m-2"> {detailMessage1}</span>
          {`type === "pending"`? 
          <div className="m-2">
            <span> {detailMessage2} </span> 
            <span className="detail-message-3"> {detailMessage3} </span>
          </div>
           :
           <div className="hidden"></div>}
      </div>
    </div>
   
  );
  
};

export default Banner;
