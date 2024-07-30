import { getParcelDescriptions } from './getParcelDescriptions';
import { getAxiosInstance } from '../../../helpers/utility';

jest.mock('../../../helpers/utility', () => ({
  getAxiosInstance: jest.fn(),
}));

describe('getParcelDescriptions', () => {
  beforeEach(() => {
    (getAxiosInstance as jest.Mock).mockReturnValue({
      url: '',
      post: () => {
        return {
          data: {
            data: {
              getParcelDescriptionsBySiteId: {
                message: '',
                httpStatusCode: 200,
                success: true,
                count: 10,
                page: 1,
                pageSize: 5,
                data: [
                  {
                    id: 11,
                    descriptionType: 'Parcel ID',
                    idPinNumber: '123456',
                    dateNoted: '2023-06-26T00:00:00.000Z',
                    landDescription: 'first land description',
                  },
                  {
                    id: 12,
                    descriptionType: 'Crown Land PIN',
                    idPinNumber: '654321',
                    dateNoted: '2023-06-26T00:00:00.000Z',
                    landDescription: 'second land description',
                  },
                  {
                    id: 13,
                    descriptionType: 'Crown Land File Number',
                    idPinNumber: 'ax213456',
                    dateNoted: '2023-06-26T00:00:00.000Z',
                    landDescription: 'third land description',
                  },
                  {
                    id: 14,
                    descriptionType: 'Parcel ID',
                    idPinNumber: '789012',
                    dateNoted: '2023-06-26T00:00:00.000Z',
                    landDescription: 'fourth land description',
                  },
                  {
                    id: 15,
                    descriptionType: 'Crown Land PIN',
                    idPinNumber: '210987',
                    dateNoted: '2023-06-26T00:00:00.000Z',
                    landDescription: 'fifth land description',
                  },
                ],
              },
            },
          },
        };
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('makes a query', async () => {
    await getParcelDescriptions(1, 1, 5, '', 'id', 'ASC');
    expect(getAxiosInstance).toHaveBeenCalled();
  });

  it('formats the dates appropriately', async () => {
    let response = await getParcelDescriptions(1, 1, 5, '', 'id', 'ASC');
    expect(response).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ dateNoted: 'June 26th, 2023' }),
        ]),
      }),
    );
  });
});
