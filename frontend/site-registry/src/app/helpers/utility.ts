import { nanoid } from '@reduxjs/toolkit';
import { API } from './endpoints';
import axios from 'axios';
import { User } from 'oidc-client-ts';
import { getClientSettings } from '../auth/UserManagerSetting';
import { format } from 'date-fns';
import {
  FormFieldType,
  IFormField,
} from '../components/input-controls/IFormField';
import { RequestStatus } from './requests/status';
import { notifyError, notifySuccess } from '../components/alert/Alert';
import { useEffect, useState } from 'react';
import { TableColumn } from '../components/table/TableColumn';

export interface UpdateDisplayTypeParams {
  indexToUpdate: number;
  updates: Partial<IFormField>; // Use Partial<IFormField> to allow partial updates
}

export const serializeDate = (data: any) => {
  const serializedData: any = { ...data };

  // Example: Serialize all Date objects to ISO string
  Object.keys(serializedData).forEach((key) => {
    if (serializedData[key] instanceof Date) {
      serializedData[key] = serializedData[key].toISOString();
    }
  });

  return serializedData;
};

export const formatDateRange = (range: [Date, Date]) => {
  const [startDate, endDate] = range;
  const formattedStartDate = format(startDate, 'MMMM do, yyyy');
  const formattedEndDate = format(endDate, 'MMMM do, yyyy');
  return `${formattedStartDate} - ${formattedEndDate}`;
};

export const formatDate = (date: Date) => {
  const formattedDate = format(date, 'MMMM do, yyyy');
  return `${formattedDate}`;
};

/*
Currently new Date() returns date in this format eg Fri Aug 16 2024 09:12:54 GMT-0700 (Pacific Daylight Time)
In our design we did not wanted to show the timezone name at the end thus this function helps to remove the timezone name present at the end
*/
export const formatDateWithNoTimzoneName = (date: Date) => {
  return date.toString().replace(/\s\([^)]+\)$/, '');
};

export const flattenFormRows = (arr: IFormField[][]): IFormField[] => {
  const flattened: IFormField[] = [];

  const flatten = (arr: IFormField[][]): void => {
    for (const item of arr) {
      for (const field of item) {
        if (field.type === FormFieldType.Group && field.children) {
          flattened.push(field);
          flatten([field.children]);
        } else {
          flattened.push(field);
        }
      }
    }
  };

  flatten(arr);
  return flattened;
};

export function getUser() {
  const oidcStorage = sessionStorage.getItem(
    `oidc.user:` +
      getClientSettings().authority +
      `:` +
      getClientSettings().client_id,
  );
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  const handleStorageChange = () => {
    setUser(getUser());
  };

  useEffect(() => {
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return user;
}

export const consoleLog = (identifier: string, message: any) => {
  console.log(identifier, message);
};

export const generateRequestId = () => {
  return nanoid();
};

export const getAxiosInstance = () => {
  const user = getUser();

  const instance = axios.create({
    baseURL: API,
    // timeout: 2000,
    headers: {
      Authorization: 'Bearer ' + user?.access_token,
      requestID: generateRequestId(),
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

//Searches for a specific search term in a object properties.
export const deepSearch = (obj: any, searchTerm: string): boolean => {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object') {
      if (deepSearch(value, searchTerm)) {
        return true;
      }
    }

    const stringValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : String(value).toLowerCase();

    if (key === 'effectiveDate' || key === 'endDate') {
      const date = new Date(value);
      const formattedDate = date
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .toLowerCase();
      const ordinalSuffixPattern = /\b(\d+)(st|nd|rd|th)\b/g;
      searchTerm = searchTerm.replace(ordinalSuffixPattern, '$1');
      if (formattedDate.includes(searchTerm)) {
        return true;
      }
    }

    if (stringValue.includes(searchTerm)) {
      return true;
    }
  }
  return false;
};

export const showNotification = (
  currentStatus: RequestStatus,
  successMessage?: string,
  errorMessage?: string,
) => {
  if (currentStatus === RequestStatus.success) {
    notifySuccess(successMessage);
  } else if (currentStatus === RequestStatus.failed) {
    notifyError(errorMessage);
  }
};

export enum UserRoleType {
  CLIENT = 'client',
  INTERNAL = 'internal',
  SR = 'sr',
}

export const isUserOfType = (roleType: UserRoleType) => {
  const user = getUser();
  if (user !== null) {
    const userRoles: any = user.profile?.role;
    switch (roleType) {
      case 'client':
        const externalUserRole =
          process.env.REACT_APP_SITE_EXTERNAL_USER_ROLE ||
          ((window as any)._env_ &&
            (window as any)._env_.REACT_APP_SITE_EXTERNAL_USER_ROLE) ||
          'site-external-user';

        if (userRoles.includes(externalUserRole)) {
          return true;
        } else {
          return false;
        }
      case 'internal':
        const internalUserRole =
          process.env.REACT_APP_SITE_INTERNAL_USER_ROLE ||
          ((window as any)._env_ &&
            (window as any)._env_.REACT_APP_SITE_INTERNAL_USER_ROLE) ||
          'site-internal-user';

        if (userRoles.includes(internalUserRole)) {
          return true;
        } else {
          return false;
        }
      case 'sr':
        const srUserRole =
          process.env.REACT_APP_SITE_REGISTRAR_USER_ROLE ||
          ((window as any)._env_ &&
            (window as any)._env_.REACT_APP_SITE_REGISTRAR_USER_ROLE) ||
          'site-registrar';
        if (userRoles.includes(srUserRole)) {
          return true;
        } else {
          return false;
        }
    }
  }
};

export const getLoggedInUserType = () => {
  return isUserOfType(UserRoleType.CLIENT)
    ? UserRoleType.CLIENT
    : isUserOfType(UserRoleType.INTERNAL)
      ? UserRoleType.INTERNAL
      : isUserOfType(UserRoleType.SR)
        ? UserRoleType.SR
        : UserRoleType.CLIENT;
};

export const isUserRoleInternalUser = () => {};

export const isUserRoleSiteRegistrar = () => {};

export const updateTableColumn = (
  columns: TableColumn[],
  params: UpdateDisplayTypeParams,
): TableColumn[] => {
  const { indexToUpdate, updates } = params;

  if (indexToUpdate === -1) {
    return columns;
  }

  const itemToUpdate = columns[indexToUpdate];

  const updatedItem: TableColumn = {
    ...itemToUpdate,
    displayType: {
      ...itemToUpdate.displayType, // Use fallback if displayType is undefined
      ...updates, // Apply the updates
      type:
        updates.type ?? itemToUpdate.displayType?.type ?? FormFieldType.Text, // Provide a default type
      label: updates.label ?? itemToUpdate.displayType?.label ?? '', // Provide a default label
    },
  };

  return [
    ...columns.slice(0, indexToUpdate),
    updatedItem,
    ...columns.slice(indexToUpdate + 1),
  ];
};

export const updateFields = (
  fieldArray: IFormField[][],
  params: UpdateDisplayTypeParams,
): IFormField[][] => {
  const { indexToUpdate, updates } = params;

  if (indexToUpdate < 0 || indexToUpdate >= fieldArray.length) {
    return fieldArray; // Return the original array if index is out of bounds
  }

  // Update fields in the specified row
  const updatedRow = fieldArray[indexToUpdate].map((field) => ({
    ...field,
    ...updates,
    type: updates.type ?? field.type,
    label: updates.label ?? field.label,
  }));

  return [
    ...fieldArray.slice(0, indexToUpdate),
    updatedRow,
    ...fieldArray.slice(indexToUpdate + 1),
  ];
};
