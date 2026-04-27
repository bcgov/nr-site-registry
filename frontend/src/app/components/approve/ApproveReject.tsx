import React, { useState } from 'react';
import './ApproveReject.css';
import { CaretRightIcon, DropdownIcon } from '../common/icon';
import { Link } from 'react-router-dom';
import { Button } from '../button/Button';

export interface IApproveReject {
  name: string;
  children: any;
  testId?: string;
  link?: string;
}

const ApproveReject: React.FC<IApproveReject> = ({
  name,
  children,
  testId,
  link,
}) => {
  const [isOpen, SetIsOpen] = useState(false);
  link = link ?? '';

  return (
    <div className="approve-reject-container" data-testid={testId}>
      <div className="ar-continer-header">
        <div className="ar-continer-header-left">
          {isOpen && (
            <DropdownIcon
              className="caret-icons"
              data-testid="dropdown-icon"
              onClick={() => {
                SetIsOpen(false);
              }}
            />
          )}
          {!isOpen && (
            <CaretRightIcon
              className="caret-icons"
              data-testid="caret-right-icon"
              onClick={() => {
                SetIsOpen(true);
              }}
            />
          )}
          <span className="header-label">{name}</span>
        </div>
        <div className="ar-continer-header-right">
          <Link to={link}>View</Link>
        </div>
      </div>
      {isOpen && <div data-testid="child-content">{children}</div>}
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
  approveRejectHandler,
}) => {
  approveLabel = approveLabel ?? 'Public';
  rejectLabel = rejectLabel ?? 'Private';
  approveRejectHandler = approveRejectHandler ?? (() => {});
  return (
    <div
      className="approve-reject-actions"
      data-testid="approve-reject-actions-div"
    >
      <Button
        intent="danger"
        data-testid="not-public-btn"
        onClick={() => approveRejectHandler(false)}
      >
        {rejectLabel}
      </Button>
      <Button
        intent="success"
        data-testid="approve-btn"
        onClick={() => approveRejectHandler(true)}
      >
        {approveLabel}
      </Button>
    </div>
  );
};
