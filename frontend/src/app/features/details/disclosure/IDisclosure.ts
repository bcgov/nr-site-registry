export interface IDisclosure {
  disclosureId: number;
  siteId: number;
  dateReceived: Date;
  dateComplete: Date;
  localAuthorityReceived: Date;
  dateRegistrar: Date;
  dateEntered: Date;
  disclosureSchedule: {
    scheduleId: number;
    reference: string;
    discription: string;
  }[];
  summary: string;
  statement: string;
  governmentOrder: string;
}
