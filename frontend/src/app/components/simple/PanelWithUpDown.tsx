import { FC, ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from '../common/icon';

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
    >
      {label && (
        <div className="d-flex align-items-start justify-content-between m-0 p-0">
          <div className="section-content-label w-100">{label}</div>
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
        <div className="d-flex gap-2 position-relative">
          {firstChild}
          <div className="m-0 position-absolute end-0">
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
            <div className="m-0 position-absolute end-0">
              <button
                className="border-0 bg-transparent"
                onClick={() => setShowDetails(!showDetails)}
                aria-label="Collapse section"
                data-testid="Collapse section"
              >
                <ChevronUp />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanelWithUpDown;
