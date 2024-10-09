import gql from 'graphql-tag';

export const graphQlSiteQuery = (filter: {}) => {
  const filterConditions = filter && Object.keys(filter);
  let fieldsString = '';
  let fieldsArgString = '';
  let selectedInput = '';

  // Dynamically generate the fields part of the query
  if (filterConditions) {
    fieldsString = filterConditions
      .map((field) => `${field}: $${field}`)
      .join(', ');
    fieldsArgString = filterConditions
      .map((field) => `$${field}: String`)
      .join(', ');
  }

  return gql`
query searchSites($searchParam: String!,  $page: String!, $pageSize: String!, ${fieldsArgString}){ 
    searchSites(searchParam: $searchParam, , page: $page, pageSize: $pageSize, ${fieldsString}) {
       sites
       {
        id
        addrLine_1
        addrLine_2
        addrLine_3
        city
        srStatus
        siteRiskCode
        generalDescription
        commonName
        latdeg
        latDegrees
        latMinutes
        latSeconds
        longdeg
        longDegrees
        longMinutes
        longSeconds
        latlongReliabilityFlag
        whoCreated
        whenCreated
        whenCreated
        consultantSubmitted
       }
       count
       page
       pageSize
    }
  }
`;
};

export const graphqlSiteDetailsQuery = () => {
  return gql`
    query findSiteBySiteId($siteId: String!, $pending: Boolean) {
      findSiteBySiteId(siteId: $siteId, pending: $pending) {
        data {
          id
          commonName
          addrLine_1
          addrLine_2
          addrLine_3
          addrLine_4
          longDegrees
          longMinutes
          longMinutes
          latDegrees
          latMinutes
          latSeconds
          city
          generalDescription
          siteRiskCode
          whenUpdated
        }
        httpStatusCode
      }
    }
  `;
};

export const graphQlGetPendingSiteForSRApproval = () => {
  return gql`
    query getPendingSiteForSRApproval(
      $searchParam: SearchParams
      $page: String!
      $pageSize: String!    
    ) {
      getPendingSiteForSRApproval(
        searchParam: $searchParam
        page: $page
        pageSize: $pageSize       
      ) {
       
          httpStatusCode
          message
          data
          {
            totalRecords
            data
            {
              changes
              siteId
              whoUpdated
              whenUpdated
              address
            }
          }
      }
    }
  `;
};


export const bulkAproveRejectChangesQL = () => gql`
  mutation bulkAproveRejectChanges($approveRejectDTO: BulkApproveRejectChangesDTO!) {
    bulkAproveRejectChanges(approveRejectDTO: $approveRejectDTO) {      
      httpStatusCode
      success
    }
  }
`;
