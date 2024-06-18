import { Field, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sites } from "./sites.entity";

@ObjectType()
@Entity('snapshots')
export class Snapshots {
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('character varying', { name: 'user_id', length: 30})
    userId: string;

    @Field()
    @Column('character varying', { name: 'site_id'})
    siteId: string;

    @Field()
    @Column('character varying', { name: 'transaction_id'})
    transactionId:string;

    @Field(() => JSON, {nullable: true})
    @Column('jsonb', {name: 'snapshot_data', nullable: true})
    snapshotData:JSON

    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated: Date;

    @ManyToOne(() => Sites, (site) => site.snapshots)
    @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
    site: Sites;
}