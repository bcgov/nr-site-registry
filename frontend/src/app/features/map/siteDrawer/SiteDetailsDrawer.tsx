import { Drawer, SxProps, Theme } from '@mui/material';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

import './SiteDetailsDrawer.css';
import { StringParam, useQueryParam } from 'use-query-params';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  SpinnerIcon,
  XmarkIcon2,
} from '../../../components/common/icon';
import {
  useMapSearch_FindSiteBySiteIdQuery,
  MapSearch_FindSiteBySiteIdQuery,
} from '../../../../graphql/generated';

enum ExpansionState {
  Default,
  Expanded,
  Hidden,
}

const getExpandIcon = (state: ExpansionState) => {
  switch (state) {
    case ExpansionState.Expanded:
      return <ChevronDown />;
    case ExpansionState.Hidden:
      return <ChevronUp />;
    case ExpansionState.Default:
      return <ChevronRight />;
    default:
      return <ChevronRight />;
  }
};

const getNextExpansionStateFromCurrentState = (
  currentState: ExpansionState,
) => {
  switch (currentState) {
    case ExpansionState.Expanded:
      return ExpansionState.Default;
    case ExpansionState.Hidden:
      return ExpansionState.Default;
    case ExpansionState.Default:
      return ExpansionState.Expanded;
    default:
      return ExpansionState.Default;
  }
};

const getNextExpansionStateFromResizeRatio = (ratio: number) => {
  switch (true) {
    case ratio <= 60 && ratio > 30:
      return ExpansionState.Default;
    case ratio > 60:
      return ExpansionState.Expanded;
    default:
      return ExpansionState.Hidden;
  }
};

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) => {
  return (
    <div className="summary-item">
      <div className="fw-bold">{label}</div>
      <div>{value || ''}</div>
    </div>
  );
};

type Site = MapSearch_FindSiteBySiteIdQuery['findSiteBySiteId']['data'];
const formatAddress = (site: Site) => {
  const addressLines = [
    site?.addrLine_1,
    site?.addrLine_2,
    site?.addrLine_3,
    site?.addrLine_4,
  ];
  return addressLines.filter(Boolean).join(', ');
};

const formatCoordinates = (coords: Array<number | undefined | null>) => {
  const [d, m, s] = coords;
  let result = '';
  if (d) result += `${d}d`;
  if (m) result += `, ${m}m`;
  if (s) result += `, ${s}s`;
  return result;
};

export const SiteDetailsDrawer: FC = () => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [expansion, setExpansion] = useState<ExpansionState>(
    ExpansionState.Default,
  );

  const [selectedSiteId, setSelectedSiteId] = useQueryParam(
    'site',
    StringParam,
  );

  const { data, loading } = useMapSearch_FindSiteBySiteIdQuery({
    variables: { siteId: selectedSiteId || '' },
    skip: !selectedSiteId,
  });

  const siteData = data?.findSiteBySiteId.data;

  useEffect(() => {
    if (selectedSiteId) {
      setOpen(true);
      setIsVisible(true);
    }
  }, [selectedSiteId]);

  const [drawerResizeHeight, setDrawerResizeHeight] = useState<number | null>(
    null,
  );
  const drawerHeightRef = useRef(drawerResizeHeight);
  drawerHeightRef.current = drawerResizeHeight;

  const enterResizeMode = () => {
    document.addEventListener('mouseup', exitResizeMode, true);
    document.addEventListener('mousemove', resizeDrawer, true);
  };

  const handleDrawerClose = () => {
    setSelectedSiteId(null);
    setOpen(false);
    setExpansion(ExpansionState.Default);

    // Listen for the transition end to set visibility
    // Visibility change has to happen once the translateY() off screen has completed
    const drawerElement = document.querySelector('.site-drawer-container');
    const onTransitionEnd = () => {
      setIsVisible(false);
      drawerElement?.removeEventListener('transitionend', onTransitionEnd);
    };
    drawerElement?.addEventListener('transitionend', onTransitionEnd);
  };

  const exitResizeMode = () => {
    document.removeEventListener('mouseup', exitResizeMode, true);
    document.removeEventListener('mousemove', resizeDrawer, true);
    setDrawerResizeHeight(null);

    if (!drawerHeightRef.current) {
      return;
    }

    const drawerHeightRatio =
      (drawerHeightRef.current / document.body.clientHeight) * 100;

    setExpansion(getNextExpansionStateFromResizeRatio(drawerHeightRatio));
  };

  const resizeDrawer = useCallback((e: MouseEvent) => {
    const newHeight = document.body.offsetHeight - e.clientY;
    setDrawerResizeHeight(newHeight);
  }, []);

  const buildDrawerStyles = () => {
    let styles: SxProps<Theme> = {};

    if (expansion === ExpansionState.Default) {
      styles = {
        ...styles,
        height: `50%`,
        maxHeight: '480px',
      };
    }
    if (expansion === ExpansionState.Expanded) {
      styles = {
        ...styles,
        height: '100%',
        maxHeight: '100%',
      };
    }
    if (expansion === ExpansionState.Hidden) {
      styles = {
        ...styles,
        height: '70px',
        maxHeight: '70px',
        overflowY: 'hidden',
      };
    }
    if (drawerResizeHeight !== null) {
      styles = {
        ...styles,
        height: `${drawerResizeHeight}px`,
        maxHeight: '100%',
        transition: '0s !important',
      };
    }
    if (!open) {
      styles = {
        ...styles,
        transform: `translateY(${Math.floor(document.body.clientHeight / 2)}px)`,
        height: `50%`,
        maxHeight: '480px',
        visibility: isVisible ? 'visible' : 'hidden',
      };
    }

    return styles;
  };

  return (
    <Drawer
      open
      anchor="bottom"
      variant="persistent"
      aria-hidden={!open}
      className="site-drawer-container"
      PaperProps={{
        sx: buildDrawerStyles(),
      }}
    >
      <div className="site-drawer-header">
        <div className="resize-handle" onMouseDown={enterResizeMode}></div>

        <button
          className="border-0 bg-transparent"
          onClick={() => {
            setExpansion(getNextExpansionStateFromCurrentState(expansion));
          }}
        >
          {getExpandIcon(expansion)}
        </button>
        <span>Selected Site</span>
        <button className="border-0 bg-transparent" onClick={handleDrawerClose}>
          <XmarkIcon2 size={20} />
        </button>
      </div>

      <div className="site-drawer-body">
        <div className="mb-2">
          <span className="fw-bold mb-2">Site ID:</span> {selectedSiteId}
        </div>
        {loading && <SpinnerIcon size={20} className="site-fa-spin" />}
        {!loading && (
          <div className="d-grid gap-3">
            <h4 className="fw-bold">{formatAddress(siteData)}</h4>
            <div className="site-drawer-info-summary">
              <SummaryItem
                label="Latitude"
                value={formatCoordinates([
                  siteData?.latDegrees,
                  siteData?.latMinutes,
                  siteData?.latSeconds,
                ])}
              />
              <SummaryItem
                label="Site Risk Classification"
                value={siteData?.siteRiskCode || 'N/A'}
              />
              <SummaryItem
                label="Longitude"
                value={formatCoordinates([
                  siteData?.longDegrees,
                  siteData?.longMinutes,
                  siteData?.longSeconds,
                ])}
              />
              <SummaryItem label="Region" value={siteData?.city} />
            </div>
            <div>
              <div className="fw-bold mb-2">Location Description</div>
              <div>{siteData?.generalDescription}</div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
