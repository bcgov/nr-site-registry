import gql from 'graphql-tag'

export const graphQLSiteDisclosureBySiteId = () => {
    return(
        gql
        `query getSiteDisclosureBySiteId($siteId: String!)
        {
            getSiteDisclosureBySiteId(siteId: $siteId)
            {
                 httpStatusCode,
                 success,
                 message,
                 timestamp,
                 data {
                    siteId
                    dateCompleted
                    rwmDateDecision
                    localAuthDateRecd    
                    siteRegDateEntered
                    siteRegDateRecd
                    govDocumentsComment
                    siteDisclosureComment
                    plannedActivityComment
                }
            }
        }`
    )
}

