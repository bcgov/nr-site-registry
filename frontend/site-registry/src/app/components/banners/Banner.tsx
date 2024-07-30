import React, { ReactNode } from "react";
import "./banner.css"; 

interface DetailMessage {
  message: string;
  cssClass?: string;
}

interface BannerProps {
  bannerLabel: string,
  iconType: ReactNode,
  customClassForBanner?: string,
  customClassForIcon?: string,
  detailMessageNode?: ReactNode,
}

const Banner: React.FC<BannerProps> = ({
  bannerLabel,
  iconType,
  customClassForBanner,
  customClassForIcon,
  detailMessageNode
}) => {
  const bannerClass = `d-flex align-items-center status-banner-message ${customClassForBanner || ''}`;
  const iconClass = `m-1 m-2 icon ${customClassForIcon || ''}`;

  return (
    <div>
      {/* Banner Type Message Section */}
      <div className="d-flex status-banner-container">
        <div className={bannerClass}>
          <span className={iconClass}>{iconType}</span>
          <span className="status-message">{bannerLabel}</span>
        </div>
      </div>
        {detailMessageNode}
    </div>
   );
};

export default Banner;