import { FC, ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from '../common/icon';
import { ApproveRejectButtons } from '../approve/ApproveReject';

interface PanelWithUpDownProps {
  label?: string | ReactNode; // Optional label for the panel
  firstChild?: ReactNode;
  secondChild?: ReactNode; // Define children prop
  isDefaultOpen?: boolean; // Optional prop to control initial visibility
}

const PanelWithUpDown: FC<PanelWithUpDownProps> = ({
  label,
  firstChild,
  secondChild,
  isDefaultOpen,
}) => {
  const [showDetails, setShowDetails] = useState(isDefaultOpen || false);
  return (
    <div
      className={`d-flex flex-column mb-3 section-container me-2`}
      role="region"
      aria-label={typeof label === 'string' ? label || 'Section' : undefined}
      aria-expanded={showDetails}
    >
      {label && (
        <div className="d-flex justify-content-between">
          <div className="section-content-label">{label}</div>
          <button
            className="border-0 bg-transparent"
            onClick={() => setShowDetails(!showDetails)}
            aria-label={showDetails ? 'Collapse section' : 'Expand section'}
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      )}
      {!label && !showDetails && (
        <div className="d-flex gap-2">
          {firstChild}
          <div className="m-0 py-4">
            <button
              className="border-0 bg-transparent"
              onClick={() => setShowDetails(!showDetails)}
              aria-label="Expand section"
              data-testid="Expand section"
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      )}
      {showDetails && (
        <div className="d-flex position-relative">
          {secondChild}
          {showDetails && !label && (
            //  <div className="position-absolute end-0">
            <div className="m-0 py-4 position-absolute end-0">
              <button
                className="border-0 bg-transparent"
                onClick={() => setShowDetails(!showDetails)}
                aria-label="Collapse section"
                data-testid="Collapse section"
              >
                <ChevronUp />
              </button>
            </div>
            //  </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanelWithUpDown;
