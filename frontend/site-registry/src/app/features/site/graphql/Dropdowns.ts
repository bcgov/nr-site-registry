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

export const graphQLPeopleOrgsCd = () => {
    return(
        gql
        `query getPeopleOrgsCd
        {
            getPeopleOrgsCd
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
