import { DropdownItem } from "../../components/action/IActions";
import Disclosure from "./disclosure/Disclosure";
import Notations from "./notations/Notations";
import Participants from "./participants/participants";
import Summary from "./summary/Summary";

export const navItems: string[] = [
    'Summary',
    'Notations',
    'Site Participants',
    'Documents',
    'Associated Sites',
    'Suspect Land Uses',
    'Parcel Description',
    'Site Disclosure',
];

export const navComponents: JSX.Element[] = [
        <Summary/>, 
        <Notations/>,
        <Participants/>,
        <></>,
        <></>,
        <></>,
        <></>,
        <Disclosure/>,
];

export const dropDownNavItems: DropdownItem[] = [
    {
        label:'Summary',
        value:'Summary'
    },
    {
        label:'Notations',
        value:'Notations'
    },
    {
        label:'Site Participants',
        value: 'Site Participants',
    },
    {
        label:'Documents',
        value:'Documents',
    },
    {
        label:'Associated Sites',
        value:'Associated Sites',
    },
    {
        label:'Suspect Land Uses',
        value: 'Suspect Land Uses',
    },
    {
        label:'Parcel Description',
        value: 'Parcel Description',
    },
    {
        label:'Site Disclosure',
        value: 'Site Disclosure',
    },
  ]