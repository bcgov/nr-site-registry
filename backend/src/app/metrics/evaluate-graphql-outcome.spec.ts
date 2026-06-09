import { evaluateGraphqlOutcome } from './evaluate-graphql-outcome';

describe('evaluateGraphqlOutcome', () => {
  it('treats wire HTTP 401 as client failure', () => {
    expect(evaluateGraphqlOutcome({ httpStatus: 401 })).toEqual({
      outcome: 'failure',
      errorClass: 'client',
    });
  });

  it('treats wire HTTP 500 as server failure', () => {
    expect(evaluateGraphqlOutcome({ httpStatus: 500 })).toEqual({
      outcome: 'failure',
      errorClass: 'server',
    });
  });

  it('treats GraphQL errors as failure when HTTP is 200', () => {
    expect(
      evaluateGraphqlOutcome({
        httpStatus: 200,
        graphqlErrors: [{ message: 'bad' }],
      }),
    ).toEqual({
      outcome: 'failure',
      errorClass: 'unknown',
    });
  });

  it('treats payload httpStatusCode >= 400 as failure when HTTP is 200', () => {
    expect(
      evaluateGraphqlOutcome({
        httpStatus: 200,
        responseData: {
          searchSites: { httpStatusCode: 404, success: false },
        },
      }),
    ).toEqual({
      outcome: 'failure',
      errorClass: 'client',
    });
  });

  it('treats success false as client failure when HTTP is 200', () => {
    expect(
      evaluateGraphqlOutcome({
        httpStatus: 200,
        responseData: {
          updateSiteDetails: { success: false, httpStatusCode: 200 },
        },
      }),
    ).toEqual({
      outcome: 'failure',
      errorClass: 'client',
    });
  });

  it('treats HTTP 200 without errors as success', () => {
    expect(
      evaluateGraphqlOutcome({
        httpStatus: 200,
        responseData: {
          getCartItemsForUser: { httpStatusCode: 200, success: true },
        },
      }),
    ).toEqual({
      outcome: 'success',
      errorClass: 'na',
    });
  });
});
