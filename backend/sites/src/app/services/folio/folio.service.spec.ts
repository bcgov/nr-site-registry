import { Repository } from "typeorm";
import { FolioService } from "./folio.service";
import { FolioContentsService } from "./folioContents.service";
import { Folio } from "src/app/entities/folio.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe('FolioSerivce', () => {

    let folioSerivce: FolioService;
    let folioContentService: FolioContentsService;
    let folioRepository : Repository<Folio>;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers:[
                FolioService,
                FolioContentsService,
                {
                    provide: getRepositoryToken(Folio),
                    useClass: Repository
                }
            ]
        }).compile();

        folioSerivce = module.get<FolioService>(FolioService);

        folioContentService = module.get<FolioContentsService>(FolioContentsService);

        folioRepository = module.get<Repository<Folio>>(getRepositoryToken(Folio));
    })

    afterEach(() => {
        jest.clearAllMocks();
      });


      it('Folio Service should be defined', () => {
        expect(folioSerivce).toBeDefined();
      });

      it('Folio Content Service should be defined', () => {
        expect(folioContentService).toBeDefined();
      });
    
    
});
