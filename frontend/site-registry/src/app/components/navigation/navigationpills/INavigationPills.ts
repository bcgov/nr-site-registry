import { ReactNode } from "react";

export interface INavigationPills {
    items: string[];
    dropdownItems?:any;
    components?: JSX.Element[];
}

// export interface INavDropdownItem {
//   index:any;
//   label: string;
//   value: any;
// }