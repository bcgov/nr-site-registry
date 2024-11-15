import React from 'react';
import './CustomButtons.css';
import { FaXmark, FaFloppyDisk } from 'react-icons/fa6';
import { IButtonProps, IButtonWithLabelProps } from './ICustomButton';


export const SaveButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <div className="custom-save-btn" onClick={clickHandler}>
      {showIcon && <FaFloppyDisk />}
      {label && label !== '' ? label : 'Save'}
    </div>
  );
};

export const CancelButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <div className="custom-cancel-btn" onClick={(e) => clickHandler(e)}>
      {showIcon && <FaXmark />}
      {label && label !== '' ? label : 'Cancel'}
    </div>
  );
};

export const DiscardButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <div className="discard-button-border" onClick={(e) => clickHandler(e)}>
      {showIcon && <FaXmark />}
      {label && label !== '' ? label : 'Dicard Changes'}
    </div>
  );
};

export const CustomPillButton: React.FC<IButtonWithLabelProps> = ({
  clickHandler,
  label,
}) => {
  return (
    <div className="custom-pill-button" onClick={() => clickHandler(label)}>
      <span className="custom-pill-button-label">{label}</span>
      <FaXmark className="custom-pill-close-btn" />
    </div>
  );
};
