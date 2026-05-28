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
import { TableColumn } from '../components/table/TableColumn';
import { UserActionEnum } from '../common/userActionEnum';
import { MyLocationData, MyLocationSuccess } from '../features/map/ILocation';

// Define the type for the result cache
type ResultCache = {
  [key: string]: any; // Replace `any` with the actual type if known
};

// Cache to store fetched results
export const resultCache: ResultCache = {};

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

  // Validate the start and end dates
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    console.error('Invalid start date');
    return ''; // Return empty string or some fallback
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    console.error('Invalid end date');
    return ''; // Return empty string or some fallback
  }

  // If both dates are valid, format them
  const formattedStartDate = format(startDate, 'MMMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMMM d, yyyy');

  return `${formattedStartDate} - ${formattedEndDate}`;
};

/**
 * Formats a date as "March 2, 2025" without timezone shift
 */
export const formatDate = (input: Date | string | null): string => {
  let date: Date;

  if (!input) {
    return '';
  }

  date = parseDate(input) || new Date();
  return format(date, 'MMMM d, yyyy');
};

export const parseDate = (value: Date | string | null): Date | null => {
  if (!value) return null;

  // Handle ISO string or date-like string
  if (typeof value === 'string') {
    const isoString = new Date(value).toISOString(); // normalize input
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);

    // Construct local Date (for things like date pickers)
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Handle Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = value.getMonth();
    const day = value.getDate();
    return new Date(year, month, day);
  }

  return null;
};

export const formatDateTime = (input: Date | string | null): string => {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd HH:mm');
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
  const { authority, client_id } = getClientSettings();
  const storageKey = `oidc.user:${authority}:${client_id}`;
  const oidcStorage = localStorage.getItem(storageKey);
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
}

export const consoleLog = (identifier: string, message: any) => {
  console.log(identifier, message);
};

export const generateRequestId = () => {
  return nanoid();
};

export const getAxiosInstance = (URL?: string) => {
  const user = getUser();

  const instance = axios.create({
    baseURL: URL ?? API,
    headers: {
      Authorization: `Bearer ${user?.access_token || ''}`,
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
  errorMessageTitle?: string,
) => {
  if (currentStatus === RequestStatus.success) {
    notifySuccess(successMessage);
  } else if (currentStatus === RequestStatus.failed) {
    notifyError(errorMessage, errorMessageTitle);
  }
};

export enum UserRoleType {
  CLIENT = 'client',
  INTERNAL = 'internal',
  SR = 'sr',
  PUBLIC = 'public',
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
          'site-site-registrar';

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
    : isUserOfType(UserRoleType.SR)
      ? UserRoleType.SR
      : isUserOfType(UserRoleType.INTERNAL)
        ? UserRoleType.INTERNAL
        : UserRoleType.PUBLIC;
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

// Type for user actions
type UserAction = UserActionEnum;

export const deepFilterByUserAction = (
  data: any,
  actions: UserAction[], // actions is an array of user actions to filter by
  actionProperty = 'apiAction', // default property to filter by if not specified in the objects
): any[] => {
  const filterRecursive = (item: any, position: number): any => {
    // If the item is an array, apply recursive filtering to each element
    if (Array.isArray(item)) {
      const filteredArray = item
        .map((element, idx) => filterRecursive(element, idx)) // Pass index to each element
        .filter(Boolean); // Remove undefined values

      // Return the filtered array if it contains any valid elements, otherwise undefined
      return filteredArray.length > 0 ? filteredArray : undefined;
    }

    // ── OBJECT ─────────────────────────────────────────────────────────────
    if (item && typeof item === 'object') {
      const hasValidAction =
        item[actionProperty] && actions.includes(item[actionProperty]);

      // Recursively filter only object/array children to determine survival
      const filteredObjectChildren: any = {};
      let hasValidChildren = false;

      Object.keys(item).forEach((key: string) => {
        const child = item[key];

        if (child && typeof child === 'object') {
          const filteredChild = filterRecursive(child, position);

          if (filteredChild !== undefined) {
            // Child survived — mark that we have valid children
            filteredObjectChildren[key] = filteredChild;
            hasValidChildren = true;
          } else if (hasValidAction) {
            // Parent is valid but this child didn't survive:
            // keep arrays as [] and drop non-matching objects
            if (Array.isArray(child)) {
              filteredObjectChildren[key] = [];
            }
            // object children that don't match are simply omitted
          }
        }
        // Primitives are NOT evaluated here — added later only if node survives
      });

      // ── Decision: keep this node? ────────────────────────────────────────
      if (!hasValidAction && !hasValidChildren) {
        return undefined; // Neither this node nor any descendant matched
      }

      // Build the final object: primitives + surviving object/array children
      const primitives = Object.keys(item).reduce((acc: any, key: string) => {
        const child = item[key];
        if (!child || typeof child !== 'object') {
          acc[key] = child; // carry forward all primitive values
        }
        return acc;
      }, {});

      return { ...primitives, ...filteredObjectChildren, position };
    }

    // If the data is neither an object nor an array, return undefined
    return undefined;
  };

  // If data is an array, map over it
  if (Array.isArray(data)) {
    return data
      .map((item: any, idx: number) => filterRecursive(item, idx)) // Pass index here to filter each element
      .filter(Boolean); // Remove undefined values (empty results)
  }

  // If data is an object, directly filter it
  else if (data && typeof data === 'object') {
    const result = filterRecursive(data, 0); // Apply filterRecursive directly to the object
    return result ? [result] : []; // If the object passes filtering, return it as an array, else return an empty array
  }

  // If data is neither an object nor an array, return an empty array
  return [];
};

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
};

/**
 * Uses geolocation to find the current users latitude and longitude.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/permissions
 */
export function getMyLocation(
  onSuccess: MyLocationSuccess,
  onError: PositionErrorCallback | null | undefined = undefined,
  options: PositionOptions | undefined = DEFAULT_POSITION_OPTIONS,
) {
  // Extract just the position and accuracy values
  const successCb = (result: GeolocationPosition) => {
    const { coords } = result;
    const { latitude: lat, longitude: lng, accuracy = 0 } = coords || {};
    const newData: MyLocationData = { accuracy };
    if (!isNaN(lat) && !isNaN(lng)) {
      newData.position = [lat, lng];
    }
    onSuccess(newData);
  };
  const { geolocation: geo } = navigator;
  if (typeof geo?.getCurrentPosition === 'function') {
    // prettier-ignore Ignore Sonar error about geolocation - we need to allow this
    geo.getCurrentPosition(successCb, onError, options); // NOSONAR
  } else if (onError) {
    onError({ code: 2, message: 'Unavailable' } as GeolocationPositionError);
  }
}

type PermissionSuccessCallback = (state: PermissionState) => void;
type PermissionErrorCallback = (error: Error) => void;

/**
 * Queries the permissions API to see if geolocation has been granted
 * or denied
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
 */
export function getGeolocationPermission(
  onSuccess: PermissionSuccessCallback,
  onError: PermissionErrorCallback | undefined = undefined,
) {
  // Not supported on Safari (e2e)
  const { permissions: perms } = navigator;
  if (typeof perms?.query === 'function') {
    perms
      .query({ name: 'geolocation' })
      .then((result) => {
        onSuccess(result.state);
        return result;
      })
      .catch((ex: any) => {
        if (onError) {
          onError(ex);
        }
      });
  } else if (onError) {
    onError(new Error('Not supported'));
  }
}

/**
 * Sorts an array of objects based on a specified property and direction.
 *
 * @param array - The array of objects to sort.
 * @param property - The property to sort by. Should be a key of the object type.
 * @param ascDir - A boolean indicating the sort direction:
 *                 true for ascending and false for descending.
 * @returns A new sorted array.
 */
export function sortArray<T>(
  array: T[],
  property: keyof T,
  ascDir: boolean,
): T[] {
  return array.sort((a, b) => {
    // Replace null or undefined values with an empty string for comparison
    const aValue = a[property] == null ? '' : a[property];
    const bValue = b[property] == null ? '' : b[property];

    // Perform the sorting based on the ascending/descending direction specified by ascDir
    if (ascDir) {
      // For ascending order, compare aValue and bValue
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      // For descending order, reverse the comparison
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    }
  });
}

export function formatDistance(meters: number, kmDigits = 2): string {
  if (isNaN(meters)) {
    return '';
  }
  if (meters <= 1000) {
    return `${Math.round(meters)} m`;
  }
  const kms = Number((meters / 1000).toFixed(kmDigits));
  return `${kms} km`;
}

// Type for the configuration object that determines which user actions to filter by.
type SkipConfig = {
  fields: string | string[]; // one or many fields
  values: any | any[]; // one or many values
};

// Helper function to determine if validation should be skipped based on the skipConfig
const shouldSkip = (data: any, skipConfig?: SkipConfig): boolean => {
  if (!skipConfig) return false;

  // Normalize to arrays
  const fields = Array.isArray(skipConfig.fields)
    ? skipConfig.fields
    : [skipConfig.fields];

  const values = Array.isArray(skipConfig.values)
    ? skipConfig.values
    : [skipConfig.values];

  // Check: any field matches any value
  return fields.some((field) => values.includes(data?.[field]));
};

const buildErrorLabel = (
  parentLabel: string,
  parentIndex: string,
  message: string,
): string => {
  if (!parentIndex) return `${parentLabel} ${message}`;
  return `${parentLabel} [${Number.parseInt(parentIndex, 10) + 1}] ${message}`;
};

const validateField = (
  row: IFormField,
  fieldValue: any,
  parentLabel: string,
  parentIndex: string,
): { label: string; errorMessage: string }[] => {
  const errors: { label: string; errorMessage: string }[] = [];
  const { validation, label } = row;

  if (validation?.required && !fieldValue) {
    errors.push({
      label,
      errorMessage: buildErrorLabel(
        parentLabel,
        parentIndex,
        validation.customMessage ?? '',
      ),
    });
  }

  if (
    validation?.maxLength &&
    typeof fieldValue === 'string' &&
    fieldValue.length > validation.maxLength
  ) {
    errors.push({
      label,
      errorMessage: buildErrorLabel(
        parentLabel,
        parentIndex,
        `${label} exceeds maximum ${validation.maxLength} characters`,
      ),
    });
  }

  if (
    validation?.minLength &&
    typeof fieldValue === 'string' &&
    fieldValue.length > 0 &&
    fieldValue.length < validation.minLength
  ) {
    errors.push({
      label,
      errorMessage: buildErrorLabel(
        parentLabel,
        parentIndex,
        `${label} must be at least ${validation.minLength} characters`,
      ),
    });
  }

  if (
    validation?.pattern &&
    typeof fieldValue === 'string' &&
    fieldValue.length > 0 &&
    !validation.pattern.test(fieldValue)
  ) {
    errors.push({
      label,
      errorMessage: buildErrorLabel(
        parentLabel,
        parentIndex,
        validation.customMessage ?? `${label} has invalid format`,
      ),
    });
  }

  return errors;
};

export const validateForm = (
  formRows: IFormField[][],
  formData: any,
  source: string,
  skipConfig?: SkipConfig, // Optional configuration to skip validation based on a field's value
) => {
  const errors: any[] = [];

  const traverse = (
    rows: IFormField[][],
    data: any,
    parentLabel: string = source,
    parentIndex: string = '',
  ) => {
    // Skip validation if the data matches the skipConfig criteria
    if (shouldSkip(data, skipConfig)) return;

    // Iterate through the rows and validate each field
    rows.forEach((items) => {
      items.forEach((row) => {
        const propertyName = row.graphQLPropertyName;
        if (!propertyName) return;

        const fieldValue = data[propertyName];
        errors.push(
          ...validateField(row, fieldValue, parentLabel, parentIndex),
        );

        if (row.children && Array.isArray(fieldValue)) {
          fieldValue.forEach((child: any, index: number) => {
            traverse(
              row.children as any,
              child,
              `${parentLabel} [${parentIndex}] ${row.label}`,
              `${index + 1}`,
            );
          });
        }
      });
    });
  };

  if (Array.isArray(formData)) {
    formData.forEach((item) =>
      traverse(formRows, item, source, `${item.position}`),
    );
  } else {
    traverse(formRows, formData, source);
  }

  return errors;
};

export const removeProperty = (obj: any, propertyName: string): any => {
  // If obj is a Date object, return it as is (without modification)
  if (obj instanceof Date || obj instanceof File) {
    return obj;
  }
  // If obj is an array, recursively process each element
  if (Array.isArray(obj)) {
    return obj.map((item) => removeProperty(item, propertyName));
  }

  // If obj is an object, create a new object excluding the specified property
  if (obj && typeof obj === 'object') {
    const { [propertyName]: _, ...rest } = obj; // Destructure and exclude the specified property
    // Recursively process all the values in the object
    return Object.keys(rest).reduce(
      (acc, key) => {
        acc[key] = removeProperty(rest[key], propertyName);
        return acc;
      },
      {} as Record<string, any>,
    ); // Explicitly typing the return object
  }

  // Return the value if it's neither an array nor an object (i.e., a primitive)
  return obj;
};

/**
 * Safely parses a value to a float.
 * Returns null if the value cannot be parsed as a float.
 *
 * @param value - The value to parse.
 * @returns The parsed float or null if parsing fails.
 */
export const safeParseFloat = (value: any): number | null => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Sorts an array of objects by a given field name.
 *
 * @param data - The array to sort.
 * @param field - The property name to sort by. For multi-field columns use the first field (split on comma).
 * @param ascending - Sort direction.
 * @param dateFields - Set of field names that should be compared as dates.
 * @param rawDateFieldMap - Map of display field name to raw ISO date field name for date comparison.
 */
export const sortTableData = <T extends Record<string, any>>(
  data: T[],
  field: string,
  ascending: boolean,
  dateFields: string[] = [],
  rawDateFieldMap: Record<string, string> = {},
): T[] => {
  const sortField = field.split(',')[0];
  return [...data].sort((a, b) => {
    if (dateFields.includes(sortField)) {
      const rawKey = rawDateFieldMap[sortField] || sortField;
      const aTime = new Date(a[rawKey] || 0).getTime();
      const bTime = new Date(b[rawKey] || 0).getTime();
      return ascending ? aTime - bTime : bTime - aTime;
    }
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    const comparison = String(aVal).localeCompare(String(bVal), undefined, {
      numeric: true,
    });
    return ascending ? comparison : -comparison;
  });
};
