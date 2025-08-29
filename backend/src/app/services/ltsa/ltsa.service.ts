import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { LtoDownload } from '../../entities/ltoDownload.entity';
import { LtoPrevDownload } from '../../entities/ltoPrevDownload.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { LoggerService } from '../../logger/logger.service';

// LTO file format constants based on lto_load.ctl specification
// Oracle SQL*Loader control file defines these fixed-width positions:
// LOAD DATA INTO TABLE LTO_DOWNLOAD (
//   pid                     position(001:009) char,
//   pid_status_cd           position(010:010) char,
//   legal_description       position(011:265) char,
//   child_pid               position(266:274) char,
//   child_pid_status_cd     position(275:275) char,
//   child_legal_description position(276:530) char
// )
const LTO_FILE_POSITIONS = {
  PID: { START: 0, END: 9 }, // position(001:009) - 9 chars
  PID_STATUS_CD: { START: 9, END: 10 }, // position(010:010) - 1 char
  LEGAL_DESCRIPTION: { START: 10, END: 265 }, // position(011:265) - 255 chars
  CHILD_PID: { START: 265, END: 274 }, // position(266:274) - 9 chars
  CHILD_PID_STATUS_CD: { START: 274, END: 275 }, // position(275:275) - 1 char
  CHILD_LEGAL_DESCRIPTION: { START: 275, END: 530 }, // position(276:530) - 255 chars
} as const;

// Minimum line lengths for validation
const MIN_LINE_LENGTHS = {
  BASIC_RECORD: LTO_FILE_POSITIONS.PID_STATUS_CD.END, // 10 chars (pid + status)
  WITH_CHILD_PID: LTO_FILE_POSITIONS.CHILD_PID.END, // 274 chars
  WITH_CHILD_STATUS: LTO_FILE_POSITIONS.CHILD_PID_STATUS_CD.END, // 275 chars
  WITH_CHILD_DESCRIPTION: LTO_FILE_POSITIONS.CHILD_LEGAL_DESCRIPTION.START + 1, // 276 chars
} as const;

// Database operation constants
const DB_CONSTANTS = {
  CHUNK_SIZE: 1000, // Maximum records to process in a single database operation
} as const;

// Database error codes
const DB_ERROR_CODES = {
  POSTGRESQL_UNIQUE_VIOLATION: '23505', // PostgreSQL unique constraint violation
} as const;

// Character cleaning constants
const CLEANING_PATTERNS = {
  // Remove null bytes and control characters except newlines and tabs
  INVALID_CHARS: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
  // Unicode quotation marks and similar characters that should be normalized
  UNICODE_QUOTES: /[\u2018\u2019\u201C\u201D\u2032\u2033]/g,
  // Other problematic Unicode characters that might appear in property descriptions
  UNICODE_DASHES: /[\u2013\u2014]/g,
  // Unicode spaces that might cause positioning issues
  UNICODE_SPACES: /[\u00A0\u2000-\u200B\u2028\u2029]/g,
} as const;

@Injectable()
export class LTSAService {
  constructor(
    @InjectRepository(Subdivisions)
    private subdivisionsRepository: Repository<Subdivisions>,
    @InjectRepository(LtoDownload)
    private ltoDownloadRepository: Repository<LtoDownload>,
    @InjectRepository(LtoPrevDownload)
    private ltoPrevDownloadRepository: Repository<LtoPrevDownload>,
    @InjectRepository(SiteSubdivisions)
    private siteSubdivisionsRepository: Repository<SiteSubdivisions>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getSubdivisionsPids(type: number): Promise<{ pidno: string }[]> {
    this.sitesLogger.log(
      `LTSAService.getSubdivisionsPids() start - type: ${type}`,
    );

    try {
      // Create a subquery to get distinct padded PIDs
      const subQuery = this.subdivisionsRepository
        .createQueryBuilder('subdivisions')
        .select("LPAD(subdivisions.pid, 9, '0')", 'pidno')
        .where('subdivisions.pid IS NOT NULL')
        .distinct(true);

      // Create the main query using the subquery
      let mainQuery = this.subdivisionsRepository.manager
        .createQueryBuilder()
        .select('sub.pidno', 'pidno')
        .from(`(${subQuery.getQuery()})`, 'sub')
        .setParameters(subQuery.getParameters());

      if (type === 1) {
        mainQuery = mainQuery.where("sub.pidno < '025000000'");
      } else if (type === 2) {
        mainQuery = mainQuery.where("sub.pidno >= '025000000'");
      } else {
        throw new Error('Invalid type parameter. Must be 1 or 2.');
      }

      const result = await mainQuery.orderBy('sub.pidno', 'ASC').getRawMany();

      this.sitesLogger.log(
        `LTSAService.getSubdivisionsPids() end - found ${result.length} records`,
      );

      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occurred in LTSAService.getSubdivisionsPids()',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async cleanLtoTables(): Promise<void> {
    this.sitesLogger.log('LTSAService.cleanLtoTables() start');

    try {
      // First, truncate lto_prev_download (equivalent to truncate table lto_prev_download)
      await this.ltoPrevDownloadRepository.clear();
      this.sitesLogger.log('Truncated lto_prev_download table');

      // Step 1: Copy data from lto_download to lto_prev_download
      const ltoDownloadData = await this.ltoDownloadRepository.find();
      if (ltoDownloadData.length > 0) {
        this.sitesLogger.log(
          `Found ${ltoDownloadData.length} records to copy from lto_download to lto_prev_download`,
        );

        // Map LtoDownload entities to LtoPrevDownload entities
        const ltoPrevDownloadData = ltoDownloadData.map((item) => {
          const prevDownloadItem = this.ltoPrevDownloadRepository.create();
          prevDownloadItem.pid = item.pid;
          prevDownloadItem.pidStatusCd = item.pidStatusCd;
          prevDownloadItem.legalDescription = item.legalDescription;
          prevDownloadItem.childPid = item.childPid;
          prevDownloadItem.childPidStatusCd = item.childPidStatusCd;
          prevDownloadItem.childLegalDescription = item.childLegalDescription;
          return prevDownloadItem;
        });

        // Insert in chunks to avoid database parameter limits
        const chunkSize = DB_CONSTANTS.CHUNK_SIZE;
        let totalCopiedRecords = 0;

        for (let i = 0; i < ltoPrevDownloadData.length; i += chunkSize) {
          const chunk = ltoPrevDownloadData.slice(i, i + chunkSize);
          this.sitesLogger.log(
            `Copying chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(ltoPrevDownloadData.length / chunkSize)} (${chunk.length} records)`,
          );

          const savedChunk = await this.ltoPrevDownloadRepository.save(chunk);
          totalCopiedRecords += savedChunk.length;
        }

        this.sitesLogger.log(
          `Copied ${totalCopiedRecords} records from lto_download to lto_prev_download`,
        );
      }

      // Step 2: Clear lto_download table (equivalent to having an empty table ready for new data)
      await this.ltoDownloadRepository.clear();
      this.sitesLogger.log('Cleared lto_download table');

      this.sitesLogger.log(
        'LTSAService.cleanLtoTables() completed successfully',
      );
    } catch (error) {
      this.sitesLogger.error(
        'Exception occurred in LTSAService.cleanLtoTables()',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async loadLtoData(
    fileContent: string,
  ): Promise<{ recordsProcessed: number; recordsLoaded: number }> {
    this.sitesLogger.log('LTSAService.loadLtoData() start');

    try {
      const lines = fileContent
        .split('\n')
        .filter((line) => line.trim().length > 0);
      const ltoDownloadRecords: LtoDownload[] = [];
      let recordsProcessed = 0;

      for (const rawLine of lines) {
        recordsProcessed++;

        // Clean the line first to normalize character positions
        const line = this.cleanString(rawLine);

        // Skip lines that are too short to contain minimum required data (pid + status)
        if (line.length < MIN_LINE_LENGTHS.BASIC_RECORD) {
          this.sitesLogger.log(
            `Skipping line ${recordsProcessed}: too short (${line.length} chars, minimum ${MIN_LINE_LENGTHS.BASIC_RECORD})`,
          );
          continue;
        }

        // Debug logging for lines that had character encoding issues
        if (rawLine !== line && recordsProcessed <= 10) {
          this.sitesLogger.log(
            `Line ${recordsProcessed} had Unicode characters normalized. Original length: ${rawLine.length}, cleaned length: ${line.length}`,
          );
        }

        // Parse according to lto_load.ctl positions using defined constants
        const pid = line
          .substring(LTO_FILE_POSITIONS.PID.START, LTO_FILE_POSITIONS.PID.END)
          .trim();
        const pidStatusCd = line
          .substring(
            LTO_FILE_POSITIONS.PID_STATUS_CD.START,
            LTO_FILE_POSITIONS.PID_STATUS_CD.END,
          )
          .trim();

        // Validate that we extracted a PID (basic sanity check)
        if (!pid || pid.length === 0) {
          this.sitesLogger.log(
            `Skipping line ${recordsProcessed}: could not extract valid PID from positions ${LTO_FILE_POSITIONS.PID.START}-${LTO_FILE_POSITIONS.PID.END}`,
          );
          continue;
        }

        // Legal description starts at position 11 (index 10) and goes to position 265 (index 264)
        let legalDescription = null;
        if (line.length > LTO_FILE_POSITIONS.LEGAL_DESCRIPTION.START) {
          const endPos = Math.min(
            line.length,
            LTO_FILE_POSITIONS.LEGAL_DESCRIPTION.END,
          );
          legalDescription =
            line
              .substring(LTO_FILE_POSITIONS.LEGAL_DESCRIPTION.START, endPos)
              .trim() || null;
        }

        // Child fields are optional (may not exist in shorter lines)
        let childPid = null;
        let childPidStatusCd = null;
        let childLegalDescription = null;

        if (line.length >= MIN_LINE_LENGTHS.WITH_CHILD_PID) {
          const childPidRaw = line
            .substring(
              LTO_FILE_POSITIONS.CHILD_PID.START,
              Math.min(line.length, LTO_FILE_POSITIONS.CHILD_PID.END),
            )
            .trim();
          childPid = childPidRaw || null;
        }

        if (line.length >= MIN_LINE_LENGTHS.WITH_CHILD_STATUS) {
          const childStatusRaw = line
            .substring(
              LTO_FILE_POSITIONS.CHILD_PID_STATUS_CD.START,
              Math.min(line.length, LTO_FILE_POSITIONS.CHILD_PID_STATUS_CD.END),
            )
            .trim();
          childPidStatusCd = childStatusRaw || null;
        }

        if (line.length >= MIN_LINE_LENGTHS.WITH_CHILD_DESCRIPTION) {
          const endPos = Math.min(
            line.length,
            LTO_FILE_POSITIONS.CHILD_LEGAL_DESCRIPTION.END,
          );
          const childDescRaw = line
            .substring(LTO_FILE_POSITIONS.CHILD_LEGAL_DESCRIPTION.START, endPos)
            .trim();
          childLegalDescription = childDescRaw || null;
        }

        // Create LtoDownload entity with cleaned data
        const ltoDownloadRecord = this.ltoDownloadRepository.create({
          pid: pid || null,
          pidStatusCd: pidStatusCd || null,
          legalDescription: legalDescription || null,
          childPid: childPid || null,
          childPidStatusCd: childPidStatusCd || null,
          childLegalDescription: childLegalDescription || null,
        });

        ltoDownloadRecords.push(ltoDownloadRecord);

        // Log first few records for debugging
        if (recordsProcessed <= 5) {
          this.sitesLogger.log(
            `Record ${recordsProcessed}: pid="${ltoDownloadRecord.pid}" (pos ${LTO_FILE_POSITIONS.PID.START}-${LTO_FILE_POSITIONS.PID.END}), ` +
              `status="${ltoDownloadRecord.pidStatusCd}" (pos ${LTO_FILE_POSITIONS.PID_STATUS_CD.START}-${LTO_FILE_POSITIONS.PID_STATUS_CD.END}), ` +
              `legalDesc="${ltoDownloadRecord.legalDescription ? ltoDownloadRecord.legalDescription.substring(0, 50) + '...' : 'null'}" (pos ${LTO_FILE_POSITIONS.LEGAL_DESCRIPTION.START}-${Math.min(line.length, LTO_FILE_POSITIONS.LEGAL_DESCRIPTION.END)}), ` +
              `childPid="${ltoDownloadRecord.childPid}" (pos ${LTO_FILE_POSITIONS.CHILD_PID.START}-${Math.min(line.length, LTO_FILE_POSITIONS.CHILD_PID.END)}), ` +
              `lineLength=${line.length}`,
          );
        }
      }

      // Batch insert all records
      if (ltoDownloadRecords.length === 0) {
        this.sitesLogger.log('No valid records found to insert');
        return {
          recordsProcessed,
          recordsLoaded: 0,
        };
      }

      this.sitesLogger.log(
        `Attempting to insert ${ltoDownloadRecords.length} records into lto_download table`,
      );

      // Insert in chunks to avoid database parameter limits
      const chunkSize = DB_CONSTANTS.CHUNK_SIZE;
      let totalSavedRecords = 0;

      for (let i = 0; i < ltoDownloadRecords.length; i += chunkSize) {
        const chunk = ltoDownloadRecords.slice(i, i + chunkSize);
        this.sitesLogger.log(
          `Inserting chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(ltoDownloadRecords.length / chunkSize)} (${chunk.length} records)`,
        );

        const savedChunk = await this.ltoDownloadRepository.save(chunk);
        totalSavedRecords += savedChunk.length;
      }

      this.sitesLogger.log(
        `LTSAService.loadLtoData() completed - processed ${recordsProcessed} lines, loaded ${totalSavedRecords} records`,
      );

      return {
        recordsProcessed,
        recordsLoaded: totalSavedRecords,
      };
    } catch (error) {
      this.sitesLogger.error(
        'Exception occurred in LTSAService.loadLtoData()',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async mergeLtoDescriptions(): Promise<{
    recordsProcessed: number;
    subdivisionUpdates: number;
    subdivisionInserts: number;
    siteSubdivisionInserts: number;
  }> {
    this.sitesLogger.log('LTSAService.mergeLtoDescriptions() start');

    try {
      // Step 1: Get changed records (equivalent to the MINUS query)
      const changedRecords = await this.getChangedLtoRecords();
      this.sitesLogger.log(
        `Found ${changedRecords.length} changed LTO records to process`,
      );

      let recordsProcessed = 0;
      let subdivisionUpdates = 0;
      let subdivisionInserts = 0;
      let siteSubdivisionInserts = 0;

      // Step 2: Process each changed record
      for (const record of changedRecords) {
        try {
          recordsProcessed++;

          // Log progress for large datasets
          if (recordsProcessed % 1000 === 0) {
            this.sitesLogger.log(
              `Processing record ${recordsProcessed} of ${changedRecords.length}`,
            );
          }

          const {
            pid: parentPid,
            pidStatusCd: parentStatus,
            legalDescription: parentDescription,
            childPid,
            childPidStatusCd: childStatus,
            childLegalDescription: childDescription,
          } = record;

          // Debug log for first few records
          if (recordsProcessed <= 3) {
            this.sitesLogger.log(
              `Processing record ${recordsProcessed}: pid="${parentPid}", status="${parentStatus}", childPid="${childPid}", childStatus="${childStatus}"`,
            );
          }

          // Step 3: Update parent subdivision
          const parentUpdateResult = await this.updateSubdivision(
            parentPid,
            parentStatus,
            parentDescription,
          );
          if (parentUpdateResult.updated) {
            subdivisionUpdates++;
          } else {
            // Parent was inserted (new subdivision created)
            subdivisionInserts++;
          }

          // Step 4: Process child subdivision if conditions are met
          if (this.shouldProcessChild(parentStatus, childPid)) {
            const childResult = await this.processChildSubdivision(
              parentPid,
              childPid,
              childStatus,
              childDescription,
            );

            if (childResult.wasInserted) {
              subdivisionInserts++;
            } else if (childResult.wasUpdated) {
              subdivisionUpdates++;
            }

            // Step 5: Create site subdivision relationships for the child
            const siteRelationshipsCreated =
              await this.createSiteSubdivisionRelationships(
                parentPid,
                childResult.childSubdivId,
              );
            siteSubdivisionInserts += siteRelationshipsCreated;
          }
        } catch (recordError) {
          this.sitesLogger.error(
            `Error processing record ${recordsProcessed} (PID: ${record.pid})`,
            recordError instanceof Error
              ? recordError.message
              : String(recordError),
          );
          throw recordError;
        }
      }

      this.sitesLogger.log(
        `LTSAService.mergeLtoDescriptions() completed - processed ${recordsProcessed} records, ` +
          `${subdivisionUpdates} subdivision updates, ${subdivisionInserts} subdivision inserts, ` +
          `${siteSubdivisionInserts} site subdivision inserts`,
      );

      return {
        recordsProcessed,
        subdivisionUpdates,
        subdivisionInserts,
        siteSubdivisionInserts,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.sitesLogger.error(
        'Exception occurred in LTSAService.mergeLtoDescriptions()',
        `${errorMessage}${errorStack ? '\nStack: ' + errorStack : ''}`,
      );
      throw error;
    }
  }

  private async getChangedLtoRecords(): Promise<LtoDownload[]> {
    // Equivalent to the MINUS query in Oracle using TypeORM QueryBuilder
    // Get records that are in lto_download but not in lto_prev_download
    const subQuery = this.ltoPrevDownloadRepository
      .createQueryBuilder('lpd')
      .select('1')
      .where('lpd.pid = ld.pid')
      .andWhere(
        '(lpd.pidStatusCd = ld.pidStatusCd OR (lpd.pidStatusCd IS NULL AND ld.pidStatusCd IS NULL))',
      )
      .andWhere(
        '(lpd.legalDescription = ld.legalDescription OR (lpd.legalDescription IS NULL AND ld.legalDescription IS NULL))',
      )
      .andWhere(
        '(lpd.childPid = ld.childPid OR (lpd.childPid IS NULL AND ld.childPid IS NULL))',
      )
      .andWhere(
        '(lpd.childPidStatusCd = ld.childPidStatusCd OR (lpd.childPidStatusCd IS NULL AND ld.childPidStatusCd IS NULL))',
      )
      .andWhere(
        '(lpd.childLegalDescription = ld.childLegalDescription OR (lpd.childLegalDescription IS NULL AND ld.childLegalDescription IS NULL))',
      );

    return await this.ltoDownloadRepository
      .createQueryBuilder('ld')
      .where(`NOT EXISTS (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .getMany();
  }

  private async updateSubdivision(
    pid: string,
    status: string,
    description: string,
  ): Promise<{ updated: boolean }> {
    // Equivalent to: update subdivisions set ... where lpad(pid,9) = parentPid
    const validPid = this.calculateValidPid(status);
    const paddedPid = pid.padStart(9, '0');

    // First check if subdivision already exists
    const existingSubdivision = await this.subdivisionsRepository.findOne({
      where: { pid: paddedPid },
    });

    if (existingSubdivision) {
      // Update existing subdivision
      await this.subdivisionsRepository.update(
        { pid: paddedPid },
        {
          pid,
          pidStatusCd: status,
          legalDescription: description,
          validPid,
          whoUpdated: 'LTO-LOAD',
          whenUpdated: new Date(),
        },
      );
      return { updated: true };
    }

    // Create new subdivision if it doesn't exist
    try {
      const newSubdivision = this.subdivisionsRepository.create({
        dateNoted: new Date(),
        pid: paddedPid,
        pidStatusCd: status,
        legalDescription: description,
        validPid,
        whoCreated: 'LTO-LOAD',
        whenCreated: new Date(),
      });

      await this.subdivisionsRepository.save(newSubdivision);
      return { updated: false }; // It was an insert, not an update
    } catch (error) {
      // If we get a duplicate key error, it might be a race condition
      // Try to find the record again and update it
      if (error?.code === DB_ERROR_CODES.POSTGRESQL_UNIQUE_VIOLATION) {
        // PostgreSQL unique violation error code
        this.sitesLogger.log(
          `Subdivision PID ${pid} already exists, updating instead`,
        );
        await this.subdivisionsRepository.update(
          { pid: paddedPid },
          {
            pid,
            pidStatusCd: status,
            legalDescription: description,
            validPid,
            whoUpdated: 'LTO-LOAD',
            whenUpdated: new Date(),
          },
        );
        return { updated: true };
      }
      throw error;
    }
  }

  private shouldProcessChild(parentStatus: string, childPid: string): boolean {
    // Equivalent to: parentStatus NOT in ('X', 'E') AND childPID is not null
    return (
      !['X', 'E'].includes(parentStatus) &&
      childPid !== null &&
      childPid !== undefined
    );
  }

  private async processChildSubdivision(
    parentPid: string,
    childPid: string,
    childStatus: string,
    childDescription: string,
  ): Promise<{
    childSubdivId: string;
    wasInserted: boolean;
    wasUpdated: boolean;
  }> {
    // Step 1: Check if child subdivision exists
    const existingChild = await this.subdivisionsRepository.findOne({
      where: { pid: childPid.padStart(9, '0') },
    });

    if (existingChild) {
      // Child exists - update it
      const validPid = this.calculateValidPid(childStatus);

      await this.subdivisionsRepository.update(
        { pid: childPid.padStart(9, '0') },
        {
          pid: childPid,
          pidStatusCd: childStatus,
          legalDescription: childDescription,
          validPid,
          whoUpdated: 'LTO-LOAD',
          whenUpdated: new Date(),
        },
      );

      return {
        childSubdivId: existingChild.id,
        wasInserted: false,
        wasUpdated: true,
      };
    } else {
      // Child doesn't exist - clone from parent
      const parentRecord = await this.subdivisionsRepository.findOne({
        where: { pid: parentPid.padStart(9, '0') },
      });

      if (!parentRecord) {
        // This shouldn't happen since we just created/updated the parent, but let's be safe
        const errorMsg = `Parent subdivision still not found for PID: ${parentPid} after update/insert`;
        this.sitesLogger.error('Child processing error', errorMsg);
        throw new Error(`Parent subdivision not found for PID: ${parentPid}`);
      }

      const validPid = this.calculateValidPid(childStatus);

      const newChild = this.subdivisionsRepository.create({
        dateNoted: new Date(),
        pin: parentRecord.pin,
        pid: childPid.padStart(9, '0'),
        bcaaFolioNumber: parentRecord.bcaaFolioNumber,
        legalDescription: childDescription,
        crownLandsFileNo: parentRecord.crownLandsFileNo,
        pidStatusCd: childStatus,
        validPid,
        whoCreated: 'LTO-LOAD',
        whenCreated: new Date(),
      });

      const savedChild = await this.subdivisionsRepository.save(newChild);

      return {
        childSubdivId: savedChild.id,
        wasInserted: true,
        wasUpdated: false,
      };
    }
  }

  private async createSiteSubdivisionRelationships(
    parentPid: string,
    childSubdivId: string,
  ): Promise<number> {
    // Step 1: Get parent subdivision ID
    const parentSubdiv = await this.subdivisionsRepository.findOne({
      where: { pid: parentPid.padStart(9, '0') },
    });

    if (!parentSubdiv) {
      return 0;
    }

    // Step 2: Get all site subdivisions for the parent
    const parentSiteSubdivisions = await this.siteSubdivisionsRepository.find({
      where: { subdivId: parentSubdiv.id },
    });

    let relationshipsCreated = 0;

    // Step 3: For each parent site relationship, create child relationship if it doesn't exist
    for (const parentSiteSubdiv of parentSiteSubdivisions) {
      const existingRelationship =
        await this.siteSubdivisionsRepository.findOne({
          where: {
            siteId: parentSiteSubdiv.siteId,
            subdivId: childSubdivId,
          },
        });

      if (!existingRelationship) {
        const newSiteSubdivision = this.siteSubdivisionsRepository.create({
          siteId: parentSiteSubdiv.siteId,
          subdivId: childSubdivId,
          dateNoted: new Date(),
          initialIndicator: 'N',
          whoCreated: 'LTO-LOAD',
          whenCreated: new Date(),
          sendToSr: 'Y',
        });

        await this.siteSubdivisionsRepository.save(newSiteSubdivision);
        relationshipsCreated++;
      }
    }

    return relationshipsCreated;
  }

  private calculateValidPid(status: string): string | null {
    // Equivalent to: decode(status,'X',null,'E',null,'Y')
    return ['X', 'E'].includes(status) ? null : 'Y';
  }

  /**
   * Clean string fields to remove null bytes and other problematic characters
   * and normalize Unicode characters to ASCII equivalents
   * @param str - String to clean
   * @returns Cleaned string or null if empty
   */
  private cleanString(str: string | null): string | null {
    if (!str) return null;

    const cleaned =
      str
        .replace(CLEANING_PATTERNS.INVALID_CHARS, ' ')
        .replace(CLEANING_PATTERNS.UNICODE_QUOTES, "'")
        .replace(CLEANING_PATTERNS.UNICODE_DASHES, '-')
        .replace(CLEANING_PATTERNS.UNICODE_SPACES, ' ')
        .trim() || null;

    return cleaned;
  }
}
