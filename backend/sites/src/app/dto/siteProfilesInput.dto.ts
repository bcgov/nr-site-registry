import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class SiteProfilesInputDTO extends ChangeAuditEntityDTO {
  @Field()
  siteId: string;

  @Field()
  dateCompleted: Date;

  @Field({ nullable: true })
  localAuthDateRecd: Date | null;

  @Field({ nullable: true })
  localAuthName: string | null;

  @Field({ nullable: true })
  localAuthAgency: string | null;

  @Field({ nullable: true })
  localAuthAddress1: string | null;

  @Field({ nullable: true })
  localAuthAddress2: string | null;

  @Field({ nullable: true })
  localAuthPhoneAreaCode: string | null;

  @Field({ nullable: true })
  localAuthPhoneNo: string | null;

  @Field({ nullable: true })
  localAuthFaxAreaCode: string | null;

  @Field({ nullable: true })
  localAuthFaxNo: string | null;

  @Field({ nullable: true })
  localAuthDateSubmitted: Date | null;

  @Field({ nullable: true })
  localAuthDateForwarded: Date | null;

  @Field({ nullable: true })
  rwmDateReceived: Date | null;

  @Field({ nullable: true })
  rwmParticId: string | null;

  @Field({ nullable: true })
  rwmPhoneAreaCode: string | null;

  @Field({ nullable: true })
  rwmPhoneNo: string | null;

  @Field({ nullable: true })
  rwmFaxAreaCode: string | null;

  @Field({ nullable: true })
  rwmFaxNo: string | null;

  @Field({ nullable: true })
  investigationRequired: string | null;

  @Field({ nullable: true })
  rwmDateDecision: Date | null;

  @Field({ nullable: true })
  siteRegDateRecd: Date | null;

  @Field({ nullable: true })
  siteRegDateEntered: Date | null;

  @Field({ nullable: true })
  siteRegParticId: string | null;

  @Field({ nullable: true })
  ownerParticId: string | null;

  @Field({ nullable: true })
  siteAddress: string | null;

  @Field({ nullable: true })
  siteCity: string | null;

  @Field({ nullable: true })
  sitePostalCode: string | null;

  @Field({ nullable: true })
  numberOfPids: number | null;

  @Field({ nullable: true })
  numberOfPins: number | null;

  @Field({ nullable: true })
  latDegrees: number | null;

  @Field({ nullable: true })
  latMinutes: number | null;

  @Field({ nullable: true })
  latSeconds: string | null;

  @Field({ nullable: true })
  longDegrees: number | null;

  @Field({ nullable: true })
  longMinutes: number | null;

  @Field({ nullable: true })
  longSeconds: string | null;

  @Field({ nullable: true })
  comments: string | null;

  @Field()
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated: string | null;

  @Field()
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field({ nullable: true })
  localAuthEmail: string | null;

  @Field({ nullable: true })
  plannedActivityComment: string | null;

  @Field({ nullable: true })
  siteDisclosureComment: string | null;

  @Field({ nullable: true })
  govDocumentsComment: string | null;

  // @OneToMany(
  //   () => ProfileAnswers,
  //   (profileAnswers) => profileAnswers.siteProfiles,
  // )
  // profileAnswers: ProfileAnswers[];

  // @OneToMany(
  //   () => ProfileSubmissions,
  //   (profileSubmissions) => profileSubmissions.siteProfiles,
  // )
  // profileSubmissions: ProfileSubmissions[];

  // @OneToMany(
  //   () => SiteProfileLandUses,
  //   (siteProfileLandUses) => siteProfileLandUses.siteProfiles,
  // )
  // siteProfileLandUses: SiteProfileLandUses[];

  // @OneToMany(
  //   () => SiteProfileOwners,
  //   (siteProfileOwners) => siteProfileOwners.siteProfiles,
  // )
  // siteProfileOwners: SiteProfileOwners[];
}
