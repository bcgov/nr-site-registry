import gql from 'graphql-tag'

export const graphQLParticipantRoleCd = () => {
    return(
        gql
        `query getParticipantRoleCd
        {
            getParticipantRoleCd
            {
                httpStatusCode,
                success,
                message,
                timestamp,
                data {
                    key
                    value
                }
            }
        }`
    )
}

export const graphQLPeopleOrgs = () => {
    return(
        gql
        `query getPeopleOrgs
        {
            getPeopleOrgs
            {
                httpStatusCode,
                success,
                message,
                timestamp,
                data {
                    key
                    value
                }
            }
        }`
    )
}
