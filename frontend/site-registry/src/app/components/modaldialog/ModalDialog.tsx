import React, { Children, ReactNode, useState } from "react";
import "./ModalDialog.css";
import { XmarkIcon, FloppyDisk  } from "../common/icon";
import { CancelButton, SaveButton } from "../simple/CustomButtons";

interface ModalDialogCloseHandlerProps {
  closeHandler: (save:boolean)=> void;
  children?: ReactNode;
  label?: string;
}

const ModalDialog: React.FC<ModalDialogCloseHandlerProps> = ({closeHandler,children,label}) => {
  const [open, setOpen] = useState<boolean>(true);
  const displayLabel = label ?? "Are you sure you want to commit changes to this site?"

  const handleClose = () => {
    setOpen(false);
    closeHandler(false);
  };

  const handleSave = () => {
    // Add save logic here
    console.log("Save button clicked");
    setOpen(false);
    closeHandler(true);
  };

  return (
    <div>
      {open && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <span className="custom-modal-header-text">
                {displayLabel}
              </span>
              <XmarkIcon
                className="custom-modal-header-close"
                onClick={handleClose}
              ></XmarkIcon>
            </div>
           {children &&  <div className="custom-modal-data">
              {children}
            </div>}
            <div className="custom-modal-actions-footer">
             
             <CancelButton clickHandler={handleClose}/>
             <SaveButton clickHandler={handleSave}/>
                
                
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalDialog;
