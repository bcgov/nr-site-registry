import React from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { IFormField } from '../../../components/input-controls/IFormField';
import {
  DownloadPdfIcon,
  ReplaceIcon,
  TrashCanIcon,
  ViewOnlyIcon,
} from '../../../components/common/icon';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import { Button } from '../../../components/button/Button';

interface IDocumentProps {
  userType: UserType;
  mode: any;
  documentFirstChildFormRows: IFormField[][];
  externalRow: IFormField[][];
  viewMode: SiteDetailsMode;
  handleInputChange: (id: number, graphQLPropertyName: any, value: any) => void;
  document: {
    [key: string]: any;
  };
  srTimeStamp: string;
  handleViewOnline: () => void;
  handleDownload: () => void;
  handleFileReplace: (event: any, doc: any, docIsReplace?: boolean) => void;
  handleFileDelete: (document: any, docIsDelete?: boolean) => void;
  uniqueId: number;
  internalRow: IFormField[][];
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
}

const Document: React.FC<IDocumentProps> = ({
  userType,
  mode,
  documentFirstChildFormRows,
  externalRow,
  viewMode,
  handleInputChange,
  document,
  srTimeStamp,
  handleViewOnline,
  handleDownload,
  handleFileReplace,
  handleFileDelete,
  uniqueId,
  internalRow,
  approveRejectHandler,
  showApproveRejectSection,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler = approveRejectHandler ?? (() => {});

  return (
    <PanelWithUpDown
      firstChild={
        <div className="w-100" key={document?.id}>
          <Form
            formRows={
              userType === UserType.Internal
                ? mode === SiteDetailsMode.EditMode
                  ? documentFirstChildFormRows
                  : externalRow
                : externalRow
            }
            formData={document}
            editMode={viewMode === SiteDetailsMode.EditMode}
            srMode={viewMode === SiteDetailsMode.SRMode}
            handleInputChange={(graphQLPropertyName, value) =>
              handleInputChange(document.id, graphQLPropertyName, value)
            }
            aria-label="Document collasped form"
          />
          {userType === UserType.Internal && (
            <span className="sr-time-stamp">{srTimeStamp}</span>
          )}
        </div>
      }
      secondChild={
        <div className="w-100 custom-second-child" key={document?.id}>
          <div
            className="d-flex py-2 mb-3 gap-2 flex-wrap flex-column flex-sm-row"
            key={document?.id}
          >
            <Button onClick={handleViewOnline}>
              <ViewOnlyIcon />
              View Online
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={viewMode === SiteDetailsMode.SRMode}
            >
              <DownloadPdfIcon />
              Download (PDF)
            </Button>
            {viewMode === SiteDetailsMode.EditMode &&
              userType === UserType.Internal && (
                <>
                  <Button variant="secondary" data-testid="replace-file">
                    <label
                      htmlFor={`replace-file_${document?.id}`}
                      className="d-flex align-items-center gap-2 cursor-pointer"
                    >
                      <ReplaceIcon className="btn-document-icon" />
                      Replace File
                    </label>
                    <input
                      type="file"
                      id={`replace-file_${document?.id}`}
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileReplace(e, document)}
                      key={uniqueId}
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    data-testid="delete-file"
                    onClick={() => handleFileDelete(document)}
                  >
                    <TrashCanIcon />
                    Delete
                  </Button>
                </>
              )}
          </div>
          <Form
            formRows={internalRow}
            formData={document}
            editMode={viewMode === SiteDetailsMode.EditMode}
            srMode={viewMode === SiteDetailsMode.SRMode}
            handleInputChange={(graphQLPropertyName, value) =>
              handleInputChange(document.id, graphQLPropertyName, value)
            }
            aria-label="Sort Notation Form"
          />
          {userType === UserType.Internal && (
            <p className="sr-time-stamp">{srTimeStamp}</p>
          )}
          {showApproveRejectSection && (
            <ApproveRejectButtons approveRejectHandler={approveRejectHandler} />
          )}
        </div>
      }
    />
  );
};

export default Document;
