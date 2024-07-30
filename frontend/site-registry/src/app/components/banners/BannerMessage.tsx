import React from "react";
import "./banner.css";
import { BannerStatus } from "../../helpers/requests/bannerStatus";

interface BannerMessageProps {
    type: string,
}

const BannerMessage: React.FC<BannerMessageProps> = ({ type }) => {
    const isDetailMessage = (type === BannerStatus.outdated || type === BannerStatus.pending) ? true : false;
    return(
        <div> 
            {isDetailMessage?
            <div className={`d-flex justify-content-between status-message-details message-${type}`}>
                    <span className="d-flex m-1 m-2"> {type === BannerStatus.pending ? BannerStatus.pendingMessage1 :  BannerStatus.outdatedMessage}</span>
                    {type === BannerStatus.pending? 
                    <div className="m-2">
                        <span> {BannerStatus.pendingMessage2} </span> 
                        <span className="detail-message-3"> {BannerStatus.pendingMessage3} </span>
                    </div>
                    :
                    <div className="hidden"></div>}
            </div>  
            :
            <div className="hidden">
            
        </div>
        }
        </div>

    )
};

export default BannerMessage;