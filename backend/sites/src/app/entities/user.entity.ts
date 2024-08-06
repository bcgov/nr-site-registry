import { Field, ObjectType } from "@nestjs/graphql";
import { BaseAuditEntity } from "./baseAuditEntity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity('user')
export class User extends BaseAuditEntity
{
    @Field()
    @PrimaryGeneratedColumn()
    id:number;

    @Column({ unique: true })
    email: string;
  
    @Column({ unique: true })
    userId: string;

    @Column()
    firstName: string;

    @Column()
    lastName : string;

    @Column()
    idp: string;
}