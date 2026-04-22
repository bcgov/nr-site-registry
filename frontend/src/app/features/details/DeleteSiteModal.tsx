import React, { useEffect, useState } from 'react';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import './DeleteSiteModal.css';

interface DeleteSiteModalProps {
  isOpen: boolean;
  siteId: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteSiteModal: React.FC<DeleteSiteModalProps> = ({
  isOpen,
  siteId,
  onClose,
  onConfirm,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setConfirmationInput('');
      setError('');
    }
  }, [isOpen]);

  const isConfirmDisabled = confirmationInput.trim() !== siteId;

  const handleClose = () => {
    setConfirmationInput('');
    setError('');
    onClose();
  };

  const closeHandler = (save: any) => {
    if (save !== true) {
      handleClose();
      return;
    }

    if (confirmationInput.trim() !== siteId) {
      setError(
        `Please type the Site ID ${siteId} exactly to confirm deletion.`,
      );
      return;
    }

    setError('');
    onConfirm();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalDialog
      closeHandler={closeHandler}
      headerLabel={`Delete Site (Site ID: ${siteId})?`}
      saveBtnLabel="Delete Site"
      cancelBtnLabel="Cancel"
      customHeaderCss="delete-site-modal-header"
      disableSaveButton={isConfirmDisabled}
    >
      <div className="delete-site-modal-content">
        <p className="delete-warning-text">
          <strong>Warning:</strong> This will delete this site and all
          associated data including:
        </p>
        <ul className="delete-items-list">
          <li>Site participants</li>
          <li>Site documents</li>
          <li>Site notations (events)</li>
          <li>Associated sites</li>
          <li>Land histories</li>
          <li>All other connected data</li>
        </ul>
        <p className="delete-confirmation-instruction">
          Please type the Site ID <strong>{siteId}</strong> to confirm:
        </p>
        <input
          type="text"
          className={`form-control delete-confirmation-input ${error ? 'is-invalid' : ''}`}
          value={confirmationInput}
          onChange={(e) => {
            setConfirmationInput(e.target.value);
            setError('');
          }}
          placeholder={`Enter Site ID: ${siteId}`}
          autoFocus
        />
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    </ModalDialog>
  );
};

export default DeleteSiteModal;
