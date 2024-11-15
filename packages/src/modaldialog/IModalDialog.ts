// Importing ReactNode type from 'react' which represents any valid React child element
import { ReactNode } from "react";

// Interface definition for IModalDialog which describes the structure of props for a modal component
export interface IModalDialog {
    // Function to handle closing the modal. The 'save' parameter can be of any type.
    closeHandler: (save: any) => void;
    
    // Optional children prop to allow passing of any ReactNode as content inside the modal
    children?: ReactNode;
    
    // Optional label prop for the modal's title or label text
    label?: string;
    
    // Optional save button label, allows customization of the save button text
    saveBtnLabel?: string;
    
    // Optional cancel button label, allows customization of the cancel button text
    cancelBtnLabel?: string;
    
    // Optional discard button label, allows customization of the discard button text
    dicardBtnLabel?: string;
    
    // Optional discardOption boolean to determine if the discard button should be shown
    discardOption?: boolean;
}
