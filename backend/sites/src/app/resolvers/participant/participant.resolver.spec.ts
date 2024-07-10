import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantResolver } from './participant.resolver';
import { ParticipantService } from '../../services/participant/participant.service';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { SiteParticsDto, SiteParticsResponse } from '../../dto/sitePartics.dto';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';

describe('ParticipantResolver', () => {
    let resolver: ParticipantResolver;
    let participantService: ParticipantService;
    let genericResponseProvider: GenericResponseProvider<SiteParticsDto[]>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ParticipantResolver,
                {
                    provide: ParticipantService,
                    useValue: {
                        getSiteParticipantsBySiteId: jest.fn(),
                    },
                },
                {
                    provide: GenericResponseProvider,
                    useValue: {
                        createResponse: jest.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<ParticipantResolver>(ParticipantResolver);
        participantService = module.get<ParticipantService>(ParticipantService);
        genericResponseProvider = module.get<GenericResponseProvider<SiteParticsDto[]>>(GenericResponseProvider);
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });

    describe('getSiteParticipantsBySiteId', ()=>{
        it('should return participants successfully', async () => {
            const siteId = 'site123';
            const expectedResult: SiteParticsDto[] = [
                {
                    guid: 'guid1',
                    id: '1',
                    psnorgId: 'org123',
                    effectiveDate: new Date(),
                    endDate: null,
                    note: null,
                    displayName: 'Participant 1',
                    prCode: 'PR123',
                    description: 'Participant description',
                },
            ];
            (participantService.getSiteParticipantsBySiteId as jest.Mock).mockResolvedValueOnce(expectedResult);
            (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce({
                message: 'Participants fetched successfully',
                httpStatusCode: 200,
                success: true,
                data: expectedResult,
            });
        
            const result = await resolver.getSiteParticipantsBySiteId(siteId);
        
            expect(result.message).toBe('Participants fetched successfully');
            expect(result.httpStatusCode).toBe(200);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(expectedResult);
        });
        
        it('should return not found error when participants are empty', async () => {
            const siteId = 'site123';
            (participantService.getSiteParticipantsBySiteId as jest.Mock).mockResolvedValueOnce([]);
            (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce({
                message: `Participants data not found for site id: ${siteId}`,
                httpStatusCode: 404,
                success: false,
            });
        
            const result = await resolver.getSiteParticipantsBySiteId(siteId);
        
            expect(result.message).toBe(`Participants data not found for site id: ${siteId}`);
            expect(result.httpStatusCode).toBe(404);
            expect(result.success).toBe(false);
        });
        
    })
});
