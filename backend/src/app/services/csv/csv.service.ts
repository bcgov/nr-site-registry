import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as fastCsv from 'fast-csv';
import { InjectRepository } from '@nestjs/typeorm';
import { Sites } from '../../entities/sites.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class CsvService {
  private s3: S3Client;
  constructor(
    @InjectRepository(Sites)
    private siteRepository: Repository<Sites>,
    private readonly configService: ConfigService,
    private readonly sitesLogger: LoggerService,
  ) {
    const s3Endpoint = this.configService.get<string>('ESRA_S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('ESRA_S3_ACCESS_KEY');
    const secretAccessKey =
      this.configService.get<string>('ESRA_S3_SECRET_KEY');

    if (!s3Endpoint || !accessKeyId || !secretAccessKey) {
      this.sitesLogger.log(
        'Object Storage configuration missing essential credentials or endpoint',
      );
      throw new Error(
        'Object Storage configuration missing essential credentials or endpoint',
      );
    }

    this.s3 = new S3Client({
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for some S3-compatible storage
    });
  }

  async generateCSVFiles(): Promise<void> {
    try {
      const filesToBeGenerated = [
        { key: 'srdate', query: await this.getSRDates() },
        { key: 'srsites', query: await this.getApprovedSitesQuery() },
        { key: 'srevents', query: await this.getApprovedSiteEvents() },
        { key: 'srevpart', query: await this.getApprovedEventParticipants() },
        { key: 'srpinpid', query: await this.getApprovedPINsANDPIDs() },
        { key: 'srsitpar', query: await this.getApprovedSiteParticipants() },
        {
          key: 'srparrol',
          query: await this.getApprovedSiteParticipantRoles(),
        },
        { key: 'srsitdoc', query: await this.getApprovedSiteDocuments() },
        { key: 'srdocpar', query: await this.getApprovedSiteDocParticipants() },
        { key: 'srlands', query: await this.getApprovedLandHistories() },
        { key: 'srassocs', query: await this.getApprovedSiteAssociations() },
        { key: 'srprofil', query: await this.getApprovedSiteProfiles() },
        { key: 'srprfans', query: await this.getSiteProfileAnswers() },
        { key: 'srprfuse', query: await this.getSiteProfileLandUseCode() },
        { key: 'srprfcat', query: await this.getSiteProfileCategories() },
        { key: 'srprfque', query: await this.getSiteProfileQuestions() },
      ];

      await Promise.all(
        filesToBeGenerated.map(async ({ key, query }) => {
          const data = await this.executeQuery(query);
          if (data.length > 0) {
            const fileName = `${key}.csv`;
            await this.generateCsv(data, fileName);
          }
        }),
      );
    } catch (error) {
      this.sitesLogger.error('Error generating CSV files:', error);
      console.error('Error generating CSV files:', error);
    }
  }

  async generateCsv(data: any[], fileName: string): Promise<string> {
    try {
      const filePath = path.join(__dirname, `../../${fileName}`);

      const stream = fs.createWriteStream(filePath);
      const csvStream = fastCsv.format({ headers: false });

      return new Promise((resolve, reject) => {
        csvStream.pipe(stream).on('finish', async () => {
          try {
            const fileUrl = await this.uploadFile(filePath, fileName);
            fs.unlinkSync(filePath); // Delete local file after upload
            resolve(fileUrl);
          } catch (error) {
            //reject(error);
            this.sitesLogger.error('Error uploading file:', error);
            console.log('Error uploading file:', error);
          }
        });

        data.forEach((row) => csvStream.write(row));
        csvStream.end();
      });
    } catch (error) {
      console.log(error);
      this.sitesLogger.error('Error in generateCsv:', error);
      throw error;
    }
  }

  async uploadFile(filePath: string, fileName: string): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('ESRA_S3_BUCKET');
      const folderName = this.configService.get<string>('ESRA_S3_BUCKET_ENV');
      if (!folderName) throw new Error('Folder name not found');
      if (!bucketName) throw new Error('Bucket name not found');
      const folderPath = `dbdump/${folderName}/`;
      const actualFilePath = `${folderPath}${fileName}`;

      const fileBuffer = fs.readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: actualFilePath,
        Body: fileBuffer,
        ContentType: 'text/csv',
        ACL: 'public-read', // or 'private'
      });

      await this.s3.send(command); // AWS SDK v3 uses `send(command)`

      return `https://${this.configService.get<string>('S3_ENDPOINT')}/${bucketName}/${actualFilePath}`;
    } catch (error) {
      this.sitesLogger.error('Error in uploadFile', error);
      throw error;
    }
  }

  private async executeQuery(query: string) {
    const entityManager = this.siteRepository.manager;
    const queryResult = await entityManager.query(query);

    let result: any[] = [];

    if (queryResult?.length > 0) {
      result = queryResult.map((res) => {
        return {
          ...res,
        };
      });

      return result;
    } else {
      return [];
    }
  }

  private getSRDates = () =>
    `SELECT TO_CHAR(NOW(), 'YYYY-MM-DD') AS downloaddate;`;

  private getApprovedSitesQuery = () => `SELECT
     SUBSTRING(to_char(SITES.ID, '0999999999') FROM 2 FOR 10) AS siteid
    ,BCE_REGION_CD.DESCRIPTION,
	SITE_STATUS_CD.description,
       SITES.COMMON_NAME,	   
    SITES.ADDR_LINE_1
    ,SITES.ADDR_LINE_2
    ,SITES.CITY
    ,SITES.PROV_STATE
    ,SITES.POSTAL_CODE,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LATDEG, 0) * 1000000, '000000000') FROM 2 FOR 9) AS lat,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LAT_DEGREES, 0), '000') FROM 2 FOR 3) AS latdeg,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LAT_MINUTES, 0), '000') FROM 2 FOR 3) AS latmin,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LAT_SECONDS, 0) * 10, '000') FROM 2 FOR 3) AS latsec,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LONGDEG, 0) * 1000000, '000000000') FROM 2 FOR 9) AS lon,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LONG_DEGREES, 0), '000') FROM 2 FOR 3) AS londeg,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LONG_MINUTES, 0), '000') FROM 2 FOR 3) AS lonmin,
  SUBSTRING(TO_CHAR(COALESCE(SITES.LONG_SECONDS, 0) * 10, '000') FROM 2 FOR 3) AS lonsec
    ,SITES.VICTORIA_FILE_NO
    ,SITES.REGIONAL_FILE_NO,
	SITES.general_description,
	TO_CHAR(site_registry.INIT_APPROVAL_DATE, 'YYYY-MM-DD') AS regdate,
    TO_CHAR(site_registry.LAST_APPROVAL_DATE, 'YYYY-MM-DD') AS moddate,
    TO_CHAR(site_registry.tombstone_date, 'YYYY-MM-DD') AS tombdate
  FROM sites.sites 
     inner join sites.bce_region_cd on bce_region_cd.code = sites.BCER_CODE 
	 inner join sites.site_registry on site_registry.site_id = sites.id
	 inner join sites.SITE_STATUS_CD on SITE_STATUS_CD.CODE  =  SITES.SST_CODE
  WHERE 
	sites.sr_action = 'public'`;

  private getApprovedPINsANDPIDs = () => `SELECT
      SUBSTRING(to_char(SS.id, '0999999999') FROM 2 FOR 10) AS siteId,
    SUB.PIN
    ,SUB.PID
    ,SUB.CROWN_LANDS_FILE_NO
    ,SUB.LEGAL_DESCRIPTION
    ,SUB.DATE_NOTED   
FROM
    sites.sites ss,
    (select   SITE_ID               ,
 SUBDIV_ID              ,
 DATE_NOTED             ,
 INITIAL_INDICATOR      ,
 WHO_CREATED            ,
 WHO_UPDATED            ,
 WHEN_CREATED           ,
 WHEN_UPDATED           ,
 SPROF_DATE_COMPLETED   ,
 SITE_SUBDIV_ID         ,
 SEND_TO_SR
from sites.site_subdivisions ss1
where ss1.site_subdiv_id in
 (select a.site_subdiv_id
  from sites.site_subdivisions a
  where not exists
         (select b.subdiv_id
          from sites.site_subdivisions b
          where a.site_subdiv_id  <> b.site_subdiv_id
          and a.site_id = b.site_id
          and a.subdiv_id = b.subdiv_id)
  union
  select c.site_subdiv_id
  from sites.site_subdivisions c
  where exists
       (select d.subdiv_id
        from sites.site_subdivisions d
        where c.site_subdiv_id  <> d.site_subdiv_id
        and c.site_id = d.site_id
        and c.subdiv_id = d.subdiv_id)
  and c.subdiv_id = ss1.subdiv_id
  and c.sprof_date_completed =
       (select max(d.sprof_date_completed)
        from sites.site_subdivisions d
        where c.site_id = d.site_id
        and  c.subdiv_id = d.subdiv_id)
  ))  v,
    sites.subdivisions sub
 where V.SITE_ID = SS.id
 and     V.SUBDIV_ID  = SUB.ID
 and sub.sr_action = 'public'
 and ss.sr_action = 'public'`;

  private getApprovedLandHistories = () =>
    `SELECT SUBSTRING(to_char(site_id, '0999999999') FROM 2 FOR 10) AS siteid, description as land_use, land_use_notes as  notestring FROM (SELECT 
    lh.site_id,
    luc.description,
    CASE 
                WHEN lh.site_profile = 'Y' THEN LEFT(lh.note || '(described on Site Profile dated ' || TO_CHAR(profile_date_received, 'YY-MM-DD') || ')', 255)
                ELSE lh.note 
            END 
     AS land_use_notes,
    lh.when_created
FROM sites.land_histories lh
JOIN sites.land_use_cd luc 
    ON luc.code = lh.lut_code
JOIN sites.sites s 
    ON s.id = lh.site_id
JOIN sites.site_registry sr     ON sr.site_id = s.id
WHERE lh.sr_action = 'public'
AND s.sr_action = 'public' ) A
order by A.site_id, A.when_created desc`;

  private getApprovedEventParticipants = () => `SELECT EVENT_ID,
namestring,
namerole FROM (
	SELECT 
    SUBSTRING(to_char(ep.event_id, '0999999999') FROM 2 FOR 10) AS EVENT_ID,
    REPLACE(po.display_name, CHR(10), ' ') AS namestring,
    eprc.description AS namerole,
    ep.epr_code
FROM sites.event_partics ep
JOIN sites.event_partic_role_cd eprc 
    ON eprc.code = ep.epr_code
JOIN sites.people_orgs po 
    ON po.id = ep.psnorg_id
JOIN sites.events se 
    ON se.id = ep.event_id
WHERE ep.sr_action = 'public')
order by 
EVENT_ID, epr_code  DESC`;

  private getApprovedSiteEvents = () => `SELECT 
    SUBSTRING(to_char(S.ID, '0999999999') FROM 2 FOR 10) AS SITE_ID,
    SUBSTRING(to_char(e.ID, '0999999999') FROM 2 FOR 10) AS EVENT_ID,
    etcd.DESCRIPTION AS EVENT_TYPE_DESCRIPTION,
    eccd.DESCRIPTION AS EVENT_CLASS_DESCRIPTION,
    TO_CHAR(e.EVENT_DATE, 'YYYY-MM-DD') AS EVENT_DATE,
	TO_CHAR(e.COMPLETION_DATE, 'YYYY-MM-DD') AS APPROVAL_DATE,
    po.DISPLAY_NAME,
    e.NOTE AS NOTE_FLAG,
    ct.CONDITIONS_COMMENT AS CONDITIONS_COMMENT    
FROM SITES.sites s
JOIN SITES.events e ON e.SITE_ID = s.ID
JOIN SITES.event_type_cd etcd ON etcd.CODE = e.ETYP_CODE AND etcd.ECLS_CODE = e.ECLS_CODE
JOIN SITES.event_class_cd eccd ON eccd.CODE = etcd.ECLS_CODE
JOIN SITES.people_orgs po ON po.ID = e.PSNORG_ID
LEFT JOIN SITES.conditions_text ct ON ct.EVENT_ID = e.ID  -- Outer join
JOIN SITES.site_registry sr ON sr.SITE_ID = s.ID
WHERE 
   e.sr_action = 'public'`;

  private getApprovedSiteParticipants = () => `SELECT 
    SUBSTRING(TO_CHAR(SITE_PARTICS.SITE_ID, '0999999999') FROM 2 FOR 10) as siteid,
	SUBSTRING(TO_CHAR(SITE_PARTICS.ID, '0999999999') FROM 2 FOR 10) as participantid    ,
    PEOPLE_ORGS.DISPLAY_NAME as namestring,
    to_char(SITE_PARTICS.EFFECTIVE_DATE,'YYYY-MM-DD')  AS effectivedate,
	to_char(SITE_PARTICS.END_DATE,'YYYY-MM-DD')  AS enddate,
	REPLACE(SITE_PARTICS.NOTE, CHR(10), ' ') AS notestring,
    CASE 
        WHEN PEOPLE_ORGS.ENTITY_TYPE = 'EMP' THEN 'EMPLOYEE'
        WHEN PEOPLE_ORGS.ENTITY_TYPE = 'PER' THEN 'PERSON'
        WHEN PEOPLE_ORGS.ENTITY_TYPE = 'ORG' THEN 'ORGANIZATION'
        ELSE 'UNKNOWN'
    END AS parttype
FROM 
    sites.people_orgs 
JOIN sites.site_partics ON PEOPLE_ORGS.ID = SITE_PARTICS.PSNORG_ID
JOIN sites.sites ON SITES.ID = SITE_PARTICS.SITE_ID
JOIN sites.site_registry ON SITE_REGISTRY.SITE_ID = SITES.ID
WHERE 
    SITE_PARTICS.sr_action = 'public'
order by siteid, effectivedate desc`;

  private getApprovedSiteParticipantRoles = () => `SELECT 
    SUBSTRING(TO_CHAR(site_partic_roles.sp_id, '0999999999') FROM 2 FOR 10) as participantid,
    partic_role_cd.description as rolestring
FROM 
    sites.site_partic_roles
JOIN 
    sites.partic_role_cd 
    ON site_partic_roles.pr_code = partic_role_cd.code
JOIN 
    sites.site_partics 
    ON site_partics.id = site_partic_roles.sp_id
WHERE 
    site_partic_roles.sr_action = 'public'
	and site_partics.sr_action = 'public'
	order by participantid;`;

  private getApprovedSiteDocuments = () => `SELECT 
    SUBSTRING(TO_CHAR(site_docs.site_id, '0999999999') FROM 2 FOR 10) as siteid,
    SUBSTRING(TO_CHAR(site_docs.id, '0999999999') FROM 2 FOR 10) as docid,
    REPLACE(site_docs.title, CHR(10), ' ') AS titlestring,
    to_char(site_docs.submission_date,'YYYY-MM-DD') as submissiondate,
	to_char(site_docs.document_date,'YYYY-MM-DD') as documentdate,
    REPLACE(SUBSTRING(site_docs.note FROM 1 FOR 149), CHR(10), ' ') AS notestring    
FROM 
    sites.sites
JOIN 
    sites.site_docs ON sites.id = site_docs.site_id
JOIN 
    sites.site_registry ON site_registry.site_id = sites.id
WHERE sites.site_docs.sr_action = 'public' and sites.sr_action = 'public'
 order by siteid, documentdate desc, submissiondate desc, titlestring;`;

  private getApprovedSiteDocParticipants = () => `SELECT 
     SUBSTRING(TO_CHAR(site_doc_partics.sdoc_id, '0999999999') FROM 2 FOR 10) as docid,
    REPLACE(people_orgs.display_name, CHR(10), ' ') as namestring,
    doc_partic_role_cd.description as role
FROM 
    sites.doc_partic_role_cd
JOIN 
    sites.site_doc_partics ON doc_partic_role_cd.code = site_doc_partics.dpr_code
JOIN 
    sites.people_orgs ON people_orgs.id = site_doc_partics.psnorg_id
WHERE 
    site_doc_partics.sr_action = 'public'
order by   docid, namestring;`;

  private getApprovedSiteAssociations = () => `SELECT 
    SUBSTRING(to_char(site_assocs.site_id, '0999999999') FROM 2 FOR 10) AS siteid,
    SUBSTRING(to_char(site_assocs.site_id_associated_with, '0999999999') FROM 2 FOR 10)  as associatedsiteid,
    to_char(site_assocs.effective_date,'YYYY-MM-DD') as effectdate,
    site_assocs.note as notestring
FROM 
    sites.site_assocs
JOIN 
    sites.sites 
    ON sites.id = site_assocs.site_id
JOIN 
    sites.site_registry 
    ON site_registry.site_id = sites.id
WHERE 
    site_assocs.sr_action = 'public'
    AND sites.sr_action = 'public'
order by siteid, associatedsiteid
`;

  private getApprovedSiteProfiles = () => `SELECT 
    SUBSTRING(to_char(site_profiles.site_id, '0999999999') FROM 2 FOR 10) as siteid,
    to_char(site_profiles.rwm_date_received,'YYYY-MM-DD')  as dateReceived,
    SUBSTRING(to_char(0, '0999999999') FROM 2 FOR 10) as ownerid,
    SUBSTRING(to_char(0, '0999999999') FROM 2 FOR 10) as contactid,
    SUBSTRING(to_char(0, '0999999999') FROM 2 FOR 10) as completorid,
    to_char(site_profiles.date_completed,'YYYY-MM-DD') as datecompleted ,
    to_char(site_profiles.local_auth_date_recd,'YYYY-MM-DD') as dateLocalAuthority ,
    to_char(site_profiles.site_reg_date_recd,'YYYY-MM-DD') as dateRegistrar ,
    to_char(site_profiles.rwm_date_decision,'YYYY-MM-DD') as dateDecision ,
    to_char(site_profiles.site_reg_date_entered,'YYYY-MM-DD') as dateEntered ,
    CASE 
        WHEN site_profiles.investigation_required = 'Y' THEN 'INVESTIGATION REQUIRED'
        WHEN site_profiles.investigation_required = 'N' THEN 'INVESTIGATION NOT REQUIRED'
        ELSE 'INVESTIGATION PENDING'
    END,
    REPLACE(site_profiles.comments,chr(10),' ')  as commentString,
    REPLACE(site_profiles.planned_activity_comment,chr(10),' ')  as plannedActivityComment,
    REPLACE(site_profiles.site_disclosure_comment,chr(10),' ')  as siteDisclosureComment,
    REPLACE(site_profiles.gov_documents_comment,chr(10),' ')  as govDocumentsComment,
    REPLACE(site_profiles.local_auth_email,chr(10),' ')  as localAuthEmail
FROM 
    sites.site_profiles
JOIN 
    sites.sites ON sites.id = site_profiles.site_id
where
	site_profiles.sr_action = 'public'
	and sites.sr_action = 'public'
	
order by siteid, datecompleted desc`;

  private getSiteProfileQuestions = () => `SELECT
       SUBSTRING(to_char(PROFILE_QUESTIONS.ID, '0999999999') FROM 2 FOR 10) as questionid
    ,  SUBSTRING(to_char(PROFILE_QUESTIONS.SEQUENCE_NO, '0999999999') FROM 2 FOR 10) as sequenceno
    ,  SUBSTRING(to_char(PROFILE_QUESTIONS.CATEGORY_ID, '0999999999') FROM 2 FOR 10) as catid
    ,  SUBSTRING(to_char(PROFILE_QUESTIONS.PARENT_ID, '0999999999') FROM 2 FOR 10) as parentid
    ,to_char(PROFILE_QUESTIONS.EFFECTIVE_DATE,'YYYY-MM-DD')  as effectivedate
    ,to_char(PROFILE_QUESTIONS.EXPIRY_DATE,'YYYY-MM-DD')  as expirydate
    ,replace(PROFILE_QUESTIONS.DESCRIPTION,chr(10),' ')   as descr
FROM
   sites.profile_questions
order by   questionid, sequenceno;
`;

  private getSiteProfileCategories = () => `SELECT
     SUBSTRING(to_char(PROFILE_CATEGORIES.ID, '0999999999') FROM 2 FOR 10) as catid 	
    ,SUBSTRING(to_char(PROFILE_CATEGORIES.SEQUENCE_NO, '0999999999') FROM 2 FOR 10) as sequenceno
    ,to_char(PROFILE_CATEGORIES.EFFECTIVE_DATE,'YYYY-MM-DD')    as effectivedate
    ,to_char(PROFILE_CATEGORIES.EXPIRY_DATE,'YYYY-MM-DD')    as expirydate
    ,PROFILE_CATEGORIES.QUESTION_TYPE as question_type
    ,REPLACE(PROFILE_CATEGORIES.DESCRIPTION,chr(10),' ')  as descr
    ,PROFILE_CATEGORIES.CATEGORY_PRECURSOR as category_precursor
FROM
    sites.profile_categories
	order by   catid, sequence_no;
`;

  private getSiteProfileLandUseCode = () => `SELECT 
    SUBSTRING(to_char(SITE_PROFILE_LAND_USES.SITE_ID, '0999999999') FROM 2 FOR 10) as siteid, 
     to_char(SITE_PROFILE_LAND_USES.SPROF_DATE_COMPLETED,'YYYY-MM-DD') as datecompleted ,
    SITE_PROFILE_LAND_USES.LUT_CODE as land_use_cd,
    LAND_USE_CD.DESCRIPTION as land_use_description
FROM 
    sites.site_profile_land_uses
JOIN 
    sites.land_use_cd ON SITE_PROFILE_LAND_USES.LUT_CODE = LAND_USE_CD.CODE
order by   site_id, datecompleted, land_use_cd;
`;

  private getSiteProfileAnswers = () => `SELECT  
    SUBSTRING(to_char(site_profiles.SITE_ID, '0999999999') FROM 2 FOR 10) as siteid,  
	 SUBSTRING(to_char(PROFILE_QUESTIONS.ID , '0999999999') FROM 2 FOR 10) as questionid,  
    to_char(site_profiles.DATE_COMPLETED,'YYYY-MM-DD') as dateCompleted , 
    CASE  
        WHEN PROFILE_ANSWERS.SITE_ID IS NULL THEN 'NO'  
        ELSE 'YES'  
    END AS answer  
FROM  
    sites.profile_categories  
JOIN  
    sites.profile_questions ON PROFILE_QUESTIONS.CATEGORY_ID = PROFILE_CATEGORIES.ID  
JOIN  
    sites.site_profiles ON site_profiles.DATE_COMPLETED >= PROFILE_QUESTIONS.EFFECTIVE_DATE  
LEFT JOIN  
    sites.profile_answers ON  
    site_profiles.SITE_ID = PROFILE_ANSWERS.SITE_ID  
    AND site_profiles.DATE_COMPLETED = PROFILE_ANSWERS.SPROF_DATE_COMPLETED  
    AND PROFILE_QUESTIONS.ID = PROFILE_ANSWERS.QUESTION_ID  
WHERE  
    site_profiles.DATE_COMPLETED <= PROFILE_QUESTIONS.EXPIRY_DATE  
    OR PROFILE_QUESTIONS.EXPIRY_DATE IS NULL
order by   siteid, questionid`;
}
