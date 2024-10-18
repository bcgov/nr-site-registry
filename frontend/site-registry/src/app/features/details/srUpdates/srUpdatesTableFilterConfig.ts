import { useDispatch, useSelector } from 'react-redux';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { useState } from 'react';
import { getInternalUserNameForDropdown } from '../dropdowns/DropdownSlice';

const SRUpdatesFilterRows = () => {
  const userNameList = useSelector(getInternalUserNameForDropdown);

  const [userList] = useState(userNameList);

  const configuration = [
    [
      {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'id',
        value: '',
        allowNumbersOnly: true,
        colSize: 'col-lg-4 col-md-6 col-sm-12',
      },
      {
        type: FormFieldType.DropDown,
        label: 'Updated Fields',
        placeholder: 'Select Fields Types',
        graphQLPropertyName: 'changes',
        options: [
          { key: 'summary', value: 'Summary' },
          { key: 'notation', value: 'Notation' },
          { key: 'notation participants', value: 'Notation Participants' },
          { key: 'notation', value: 'Site Participants' },
          { key: 'documents', value: 'Documents' },
          { key: 'associated sites', value: 'Associated Sites' },
          { key: 'land histories', value: 'Land Histories' },
          { key: 'parcel description', value: 'Parcel Description' },
          { key: 'site profiles', value: 'Site Profiles' },
        ],
        value: '',
        colSize: 'col-lg-4 col-md-6 col-sm-12',
      },
      {
        type: FormFieldType.Text,
        label: 'Site Address',
        placeholder: 'Type keywords',
        graphQLPropertyName: 'addrLine',
        value: '',
        colSize: 'col-lg-4 col-md-6 col-sm-12',
      },
      {
        type: FormFieldType.DateRange,
        label: 'When Updated',
        placeholder: 'When Updated',
        graphQLPropertyName: 'whenUpdated',
        value: '',
        colSize: 'col-lg-4 col-md-6 col-sm-12',
      },
      {
        type: FormFieldType.DropDown,
        label: 'Created By',
        placeholder: 'Select Staff',
        graphQLPropertyName: 'whoCreated',
        options: userList,
        value: '',
        colSize: 'col-lg-4 col-md-6 col-sm-12',
      },
    ],
  ];

  return configuration;
};

export default SRUpdatesFilterRows;
