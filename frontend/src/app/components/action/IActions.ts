import { ReactElement } from 'react';
import { SiteDetailsMode } from '../../features/details/dto/SiteDetailsMode';

export interface DropdownItem {
  label: string;
  value: any;
}

export interface IActions {
  label: string;
  items: Array<DropdownItem | ReactElement>;
  disable?: boolean;
  customCssToggleBtn?: string;
  customCssMenu?: string;
  customCssMenuItem?: string;
  onItemClick: (value: string, index?: any) => void;
}
