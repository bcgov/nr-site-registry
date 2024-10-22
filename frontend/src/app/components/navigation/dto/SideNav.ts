import { IconType } from 'react-icons/lib';
import {
  HouseIcon,
  MagnifyingGlassIcon,
  MapLocationIcon,
  ScrewdriverWrenchIcon,
  FolderIcon,
  FileExportIcon,
  BookIcon,
  ShoppingCartIcon,
  ListCheckIcon,
} from '../../common/icon';
import { useSelector } from 'react-redux';
import {
  cartItems,
  deleteRequestStatus,
  addCartItemRequestStatus,
} from '../../../features/cart/CartSlice';
import { UserRoleType } from '../../../helpers/utility';

export class SideNav {
  constructor(
    public id: number,
    public displayText: string,
    public hasChildren: boolean,
    public icon: IconType | null,
    public linkTo: string,
    public children: SideNav[] = [],
    public lowerSection: boolean = false,
  ) {}
}

const getSideBarNavList = (userRole: any) => {
  const dashboardIcon = HouseIcon;
  const textSearchIcon = MagnifyingGlassIcon;
  const mapLocationIcon = MapLocationIcon;
  const toolsIcon = ScrewdriverWrenchIcon;
  const foliosIcon = FolderIcon;
  const purchasesIcon = FileExportIcon;
  const referenceIcon = BookIcon;
  const cartIcon = ShoppingCartIcon;

  const roleBasedSideBarList: any = {
    client: [
      new SideNav(1, 'Dashboard', true, dashboardIcon, '/dashboard'),
      new SideNav(2, 'Search', true, null, '/', [
        new SideNav(1, 'Text Search', false, textSearchIcon, '/search'),
        new SideNav(2, 'Map Search', false, mapLocationIcon, '/map'),
      ]),
      new SideNav(
        3,
        'Resources',
        true,
        null,
        '/',
        [
          new SideNav(1, 'Tools', false, toolsIcon, '/tools'),
          new SideNav(2, 'Reference', false, referenceIcon, '/review'),
        ],
        false,
      ),
      new SideNav(
        4,
        'Account',
        true,
        null,
        '/',
        [
          new SideNav(1, 'Folios', false, foliosIcon, '/folios'),
          new SideNav(2, 'Purchases', false, purchasesIcon, '/purchases'),
        ],
        false,
      ),
      new SideNav(5, 'Cart', false, cartIcon, '/site/cart', [], true),
    ],
    internal: [
      new SideNav(1, 'Dashboard', true, dashboardIcon, '/dashboard'),
      new SideNav(2, 'Search', true, null, '/', [
        new SideNav(1, 'Text Search', false, textSearchIcon, '/search'),
        new SideNav(2, 'Map Search', false, mapLocationIcon, '/map'),
      ]),
      new SideNav(
        3,
        'Resources',
        true,
        null,
        '/',
        [
          new SideNav(1, 'Tools', false, toolsIcon, '/tools'),
          new SideNav(2, 'Reference', false, referenceIcon, '/ref'),
        ],
        false,
      ),
    ],
    sr: [
      new SideNav(1, 'Dashboard', true, dashboardIcon, '/dashboard'),
      new SideNav(2, 'Search', true, null, '/', [
        new SideNav(1, 'Text Search', false, textSearchIcon, '/search'),
        new SideNav(2, 'Map Search', false, mapLocationIcon, '/map'),
      ]),
      new SideNav(
        3,
        'SR',
        true,
        null,
        '/',
        [
          // new SideNav(1, 'Tools', false, toolsIcon, '/tools'),
          new SideNav(2, 'Reference', false, ListCheckIcon, '/review'),
        ],
        false,
      ),
    ],
    public: [
      new SideNav(2, 'Search', true, null, '/', [
        new SideNav(1, 'Text Search', false, textSearchIcon, '/search'),
        new SideNav(2, 'Map Search', false, mapLocationIcon, '/map'),
      ]),
      new SideNav(5, 'Cart', false, cartIcon, '/site/cart', [], true),
    ],
  };
  return roleBasedSideBarList[userRole];
};

export { getSideBarNavList };
export default SideNav;
