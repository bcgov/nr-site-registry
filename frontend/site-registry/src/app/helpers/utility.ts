import { nanoid } from "@reduxjs/toolkit";
import { API } from "./endpoints";
import axios from "axios";
import { User } from "oidc-client-ts";
import { getClientSettings } from "../auth/UserManagerSetting";
import { format } from "date-fns";
import { FormFieldType, IFormField } from "../components/input-controls/IFormField";


  
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
  }

  flatten(arr);
  return flattened;
}

export function getUser() {
  const oidcStorage = sessionStorage.getItem(
    `oidc.user:` +
      getClientSettings().authority +
      `:` +
      getClientSettings().client_id
  );
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

export const getAxiosInstance = () => {
  const user = getUser();

  const instance = axios.create({
    baseURL: API,
    timeout: 1000,
    headers: {
      Authorization: "Bearer " + user?.access_token,
      requestID: generateRequestId(),
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });

  return instance;
};


export const deepSearch = (obj: any, searchTerm: string): boolean => {
  for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object') {
          if (deepSearch(value, searchTerm)) {
              return true;
          }
      }

      const stringValue = typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase();
      
      if (key === 'effectiveDate' || key === 'endDate') {
          const date = new Date(value);
          const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
          const ordinalSuffixPattern = /\b(\d+)(st|nd|rd|th)\b/g;
          searchTerm = searchTerm.replace(ordinalSuffixPattern, '$1')
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