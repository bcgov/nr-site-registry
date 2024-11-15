// Importing necessary dependencies and components
import React, { useState } from 'react';
import './ModalDialog.css'; // Importing the modal styles
import { CancelButton, DiscardButton, SaveButton } from '../button'; // Importing button components
import { IModalDialog } from './IModalDialog'; // Importing the type definition for modal props
import { FaXmark } from 'react-icons/fa6'; // Importing a close icon from react-icons

// ModalDialog component definition
const ModalDialog: React.FC<IModalDialog> = ({
  closeHandler, // Function to handle closing the modal
  children, // Optional children content to display inside the modal
  label, // Modal title/label
  saveBtnLabel, // Label for the save button
  cancelBtnLabel, // Label for the cancel button
  dicardBtnLabel, // Label for the discard button
  discardOption, // Boolean flag to decide whether to show the discard button
}) => {
  // Setting default values for button labels if they are not provided
  saveBtnLabel = saveBtnLabel ?? ''; // Default to empty string if not provided
  cancelBtnLabel = cancelBtnLabel ?? ''; // Default to empty string if not provided
  dicardBtnLabel = dicardBtnLabel ?? ''; // Default to empty string if not provided

  // State hook to control the open/closed state of the modal
  const [open, setOpen] = useState<boolean>(true);

  // Default message displayed in the modal if no label is provided
  const displayLabel =
    label ?? 'Are you sure you want to commit changes to this site?';

  // Function to close the modal when the close button is clicked
  const handleClose = () => {
    setOpen(false); // Set the modal as closed
    closeHandler(false); // Notify the parent that the modal was closed without saving
  };

  // Function to handle the discard action
  const handleDiscard = () => {
    setOpen(false); // Set the modal as closed
    closeHandler('discard'); // Notify the parent that the discard option was selected
  };

  // Function to handle the save action
  const handleSave = () => {
    // Add save logic here, e.g., save changes to a database
    setOpen(false); // Set the modal as closed
    closeHandler(true); // Notify the parent that the save action was completed
  };

  return (
    <div>
      {/* Render the modal only if it is open */}
      {open && (
        <div className="custom-modal"> {/* Modal container */}
          <div className="custom-modal-content"> {/* Modal content area */}
            <div className="custom-modal-header"> {/* Header section */}
              {/* Modal title/label */}
              <span className="custom-modal-header-text">{displayLabel}</span>
              {/* Close button (X) */}
              <FaXmark className="custom-modal-header-close" onClick={handleClose} />
            </div>
            {/* Conditional rendering of children (modal content) */}
            {children && <div className="custom-modal-data">{children}</div>}
            
            {/* Modal actions footer */}
            {!discardOption && (
              <div className="custom-modal-actions-footer">
                {/* Cancel button */}
                <CancelButton clickHandler={handleClose} label={cancelBtnLabel} />
                {/* Save button */}
                <SaveButton clickHandler={handleSave} label={saveBtnLabel} />
              </div>
            )}

            {/* If discard option is enabled, show discard button */}
            {discardOption && (
              <div className="custom-modal-actions-footer">
                {/* Cancel button */}
                <CancelButton clickHandler={handleClose} label={cancelBtnLabel} />
                {/* Discard button */}
                <DiscardButton clickHandler={handleDiscard} label={dicardBtnLabel} showIcon={false} />
                {/* Save button */}
                <SaveButton clickHandler={handleSave} label={saveBtnLabel} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Exporting the ModalDialog component as default
export default ModalDialog;
