import React from 'react';
import './CustomButtons.css';
import { FaXmark, FaFloppyDisk } from 'react-icons/fa6';
import { Button } from '../button/Button';
import { IButtonProps, IButtonWithLabelProps } from './ICustomButton';

export const SaveButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <Button onClick={clickHandler}>
      {showIcon && <FaFloppyDisk />}
      {label && label !== '' ? label : 'Save'}
    </Button>
  );
};

export const CancelButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <Button variant="tertiary" onClick={clickHandler}>
      {showIcon && <FaXmark />}
      {label && label !== '' ? label : 'Cancel'}
    </Button>
  );
};

export const DiscardButton: React.FC<IButtonProps> = ({
  clickHandler,
  label,
  showIcon,
}) => {
  showIcon = showIcon ?? true;
  return (
    <Button variant="secondary" onClick={clickHandler}>
      {showIcon && <FaXmark />}
      {label && label !== '' ? label : 'Dicard Changes'}
    </Button>
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
