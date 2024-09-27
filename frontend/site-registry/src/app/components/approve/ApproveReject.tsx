import React, { useState } from 'react';
import './ApproveReject.css';
import { CaretRightIcon, DropdownIcon } from '../common/icon';
import { Link } from 'react-router-dom';

export interface IApproveReject {
  name: string;
  children: any;
}

const ApproveReject: React.FC<IApproveReject> = ({ name, children }) => {
  const [isOpen, SetIsOpen] = useState(false);

  return (
    <div className="approve-reject-container">
      <div className="ar-continer-header">
        <div className="ar-continer-header-left">
          {isOpen && (
            <DropdownIcon
              className="caret-icons"
              onClick={() => {
                SetIsOpen(false);
              }}
            />
          )}
          {!isOpen && (
            <CaretRightIcon
              className="caret-icons"
              onClick={() => {
                SetIsOpen(true);
              }}
            />
          )}
          <span className="header-label">{name}</span>
        </div>
        <div className="ar-continer-header-right">
         <Link to="">
         View</Link>
        </div>
      </div>
      {isOpen && <div>{children}</div>}      
    </div>
  );
};

export default ApproveReject;

export interface IApproveRejectButtons {
 approveLabel?: string;
 rejectLabel?: string;
  approveRejectHandler: (approved: boolean) => void;
}

export const ApproveRejectButtons: React.FC<IApproveRejectButtons> = ({  
    approveLabel,
    rejectLabel,  
    approveRejectHandler
}) => {
    approveLabel = approveLabel ?? 'Approve';
    rejectLabel = rejectLabel ?? 'Not Public';
    approveRejectHandler= approveRejectHandler ?? ((event)=>{console.log('approveRejectHandler not provided')})
  return (
    <div className="approve-reject-actions">
      <div className="not-public-btn" onClick={()=>approveRejectHandler(false)}> {rejectLabel}</div>
      <div className="approve-btn" onClick={()=>approveRejectHandler(true)}> {approveLabel}</div>
    </div>
  );
};

