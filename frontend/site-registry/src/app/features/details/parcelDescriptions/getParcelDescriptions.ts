import { print } from 'graphql';
import gql from 'graphql-tag';
import { GRAPHQL } from '../../../helpers/endpoints';
import { getAxiosInstance } from '../../../helpers/utility';
import {
  IParcelDescriptionDto,
  IParcelDescriptionResponseDto,
} from './parcelDescriptionDto';
import { format } from 'date-fns';

export async function getParcelDescriptions(
  siteId: number,
  page: number,
  pageSize: number,
  searchParam: string,
  sortBy: string,
  sortByDir: string,
) {
  const axios = getAxiosInstance();
  const response = await axios.post(GRAPHQL, {
    query: print(gql`
      query getParcelDescriptionBySiteId(
        $siteId: Int!
        $page: Int!
        $pageSize: Int!
        $searchParam: String!
        $sortBy: String!
        $sortByDir: String!
      ) {
        getParcelDescriptionsBySiteId(
          siteId: $siteId
          page: $page
          pageSize: $pageSize
          searchParam: $searchParam
          sortBy: $sortBy
          sortByDir: $sortByDir
        ) {
          message
          httpStatusCode
          success
          count
          page
          pageSize
          data {
            id
            descriptionType
            idPinNumber
            dateNoted
            landDescription
          }
        }
      }
    `),
    variables: {
      siteId: siteId,
      page: page,
      pageSize: pageSize,
      searchParam: searchParam,
      sortBy: sortBy,
      sortByDir: sortByDir,
    },
  });

  let rawData = response?.data?.data?.getParcelDescriptionsBySiteId;

  let formattedData: IParcelDescriptionDto[] = rawData?.data?.map(
    (parcelDescription: IParcelDescriptionDto) => {
      // This slices the Z (Zulu Time) designator off of the ISO8601 date string
      // preventing the browser from applying it's local timezone to the date
      // object when formatting. Since all of our date strings have a time of
      // 00:00:00, if a time zone with a negative value were applied it would
      // cause the resulting formatted date string to be one day lower than it
      // should be.
      let dateNoted = new Date(parcelDescription?.dateNoted.slice(0, -1));
      let formattedDateNoted = dateNoted
        ? format(new Date(dateNoted), 'PPP')
        : '';
      return {
        id: parcelDescription?.id,
        descriptionType: parcelDescription?.descriptionType,
        idPinNumber: parcelDescription?.idPinNumber,
        dateNoted: formattedDateNoted,
        landDescription: parcelDescription?.landDescription,
      };
    },
  );

  let formattedResponse: IParcelDescriptionResponseDto = {
    page: rawData.page,
    pageSize: rawData.pageSize,
    count: rawData.count,
    data: formattedData,
  };

  return formattedResponse;
}
