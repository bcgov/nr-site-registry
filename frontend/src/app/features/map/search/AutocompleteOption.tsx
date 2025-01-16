import { FC } from 'react';
import clsx from 'clsx';
import './AutocompleteOption.css';

import memoIcon from './assets/memo.png';
import markerIcon from './assets/marker.png';

export interface AutocompleteOption {
  id: string;
  label: string;
  latdeg?: number | null;
  longdeg?: number | null;
  type?: 'Sites' | 'Place';
}
interface AutocompleteItemProps {
  option: AutocompleteOption;
  [key: string]: any;
}
export const AutocompleteItem: FC<AutocompleteItemProps> = ({
  option: { label, type, id },
  className,
  ...rest
}) => {
  const optionTypeLabel =
    type === 'Sites' ? (
      <span>
        Site ID #: <u>{id}</u>
      </span>
    ) : (
      'City'
    );
  return (
    <li className={clsx('autocomplete-item', className)} {...rest}>
      <img
        src={type === 'Sites' ? memoIcon : markerIcon}
        alt=""
        className="autocomplete-icon"
      />
      <div className="autocomplete-column">
        <div className="autocomplete-label">{optionTypeLabel}</div>
        <div className="autocomplete-value">{label}</div>
      </div>
    </li>
  );
};
