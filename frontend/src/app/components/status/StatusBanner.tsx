import React from 'react';
import './StatusBanner.css';

export type StatusBannerVariant = 'archived' | 'restored';

interface StatusBannerProps {
  variant: StatusBannerVariant;
  message?: string;
}

const variantConfig: Record<
  StatusBannerVariant,
  { label: string; defaultMessage: string }
> = {
  archived: {
    label: 'Archived Notation',
    defaultMessage: 'This notation has been archived.',
  },
  restored: {
    label: 'Restored Notation',
    defaultMessage: 'This notation has been restored.',
  },
};

const StatusBanner: React.FC<StatusBannerProps> = ({ variant, message }) => {
  const config = variantConfig[variant];

  return (
    <div className={`status-banner status-banner--${variant}`} role="status">
      <span className="status-banner-text">
        {config.label} — {message ?? config.defaultMessage}
      </span>
    </div>
  );
};

export default StatusBanner;
