import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795024509842 implements MigrationInterface {
    name = 'InitialSchema1795024509842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('PASSENGER', 'STAFF', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "full_name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "phone" character varying(20) NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'PASSENGER', "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying(100) NOT NULL, "entity_name" character varying(100) NOT NULL, "entity_id" uuid NOT NULL, "old_value" jsonb, "new_value" jsonb, "ip_address" character varying(45), "user_agent" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "actor_user_id" uuid, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_88b385fb344dc44577a3f9e6a76" UNIQUE ("name"), CONSTRAINT "PK_db3359595abacbe15cf2f89c07e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lost_item_status_enum" AS ENUM('OPEN', 'MATCHED', 'CLAIM_PENDING', 'RESOLVED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "lost_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "passenger_id" uuid NOT NULL, "category_id" uuid NOT NULL, "route_id" uuid, "vehicle_id" uuid, "station_id" uuid, "item_title" character varying(150) NOT NULL, "item_color" character varying(50), "brand" character varying(100), "description" text NOT NULL, "lost_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."lost_item_status_enum" NOT NULL DEFAULT 'OPEN', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_15014e26aa0fcf7ceee6028a049" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."match_status_enum" AS ENUM('SUGGESTED', 'VIEWED', 'CLAIMED', 'DISMISSED')`);
        await queryRunner.query(`CREATE TABLE "item_matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lost_item_id" uuid NOT NULL, "found_item_id" uuid NOT NULL, "category_score" numeric(5,2) NOT NULL DEFAULT '0', "route_score" numeric(5,2) NOT NULL DEFAULT '0', "time_score" numeric(5,2) NOT NULL DEFAULT '0', "location_score" numeric(5,2) NOT NULL DEFAULT '0', "description_score" numeric(5,2) NOT NULL DEFAULT '0', "total_score" numeric(5,2) NOT NULL DEFAULT '0', "status" "public"."match_status_enum" NOT NULL DEFAULT 'SUGGESTED', "algorithm_version" character varying(20) NOT NULL DEFAULT 'v1.0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_56b5a8685f1728bacf35d11aed2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum" AS ENUM('SUBMITTED', 'VERIFICATION_PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."verification_status_enum" AS ENUM('NOT_STARTED', 'PENDING', 'PASSED', 'FAILED', 'MANUAL_REVIEW')`);
        await queryRunner.query(`CREATE TABLE "ownership_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" uuid NOT NULL, "passenger_id" uuid NOT NULL, "claim_status" "public"."claim_status_enum" NOT NULL DEFAULT 'SUBMITTED', "verification_status" "public"."verification_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "claim_note" text, "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reviewed_by_admin_id" uuid, "reviewed_at" TIMESTAMP WITH TIME ZONE, "review_note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_173125f79d51e2b485bc9f400fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "claim_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "claim_id" uuid NOT NULL, "private_attribute_id" uuid NOT NULL, "is_correct" boolean NOT NULL, "attempt_number" integer NOT NULL DEFAULT '1', "answered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bec409aad073c160f96ccbef596" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fraud_flag_type_enum" AS ENUM('SUSPICIOUS_CLAIM', 'REPEATED_FAILED_VERIFICATION', 'SUSPICIOUS_STAFF_ACTIVITY', 'DUPLICATE_REPORT', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."fraud_severity_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "public"."fraud_flag_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'CONFIRMED', 'DISMISSED')`);
        await queryRunner.query(`CREATE TABLE "fraud_flags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "claim_id" uuid, "found_item_id" uuid, "flag_type" "public"."fraud_flag_type_enum" NOT NULL, "severity" "public"."fraud_severity_enum" NOT NULL, "status" "public"."fraud_flag_status_enum" NOT NULL DEFAULT 'OPEN', "description" text NOT NULL, "reviewed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, "reviewed_by_admin_id" uuid, CONSTRAINT "PK_00fccadb758d1624e0831fe026a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transport_routes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "route_code" character varying(20) NOT NULL, "route_name" character varying(100) NOT NULL, "start_point" character varying(100) NOT NULL, "end_point" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_791767cf2550302e1d2daa45a8d" UNIQUE ("route_code"), CONSTRAINT "PK_e4eb047cf1dd4133a5fe314ddf7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "station_code" character varying(20) NOT NULL, "station_name" character varying(100) NOT NULL, "location_description" character varying(255), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_9ff067d5f309a58c43928551182" UNIQUE ("station_code"), CONSTRAINT "PK_f047974bd453c85b08bab349367" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "vehicle_number" character varying(30) NOT NULL, "vehicle_type" character varying(50) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "route_id" uuid NOT NULL, CONSTRAINT "UQ_97a57b7389989efc352bef8af3a" UNIQUE ("vehicle_number"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."found_items_status_enum" AS ENUM('REGISTERED', 'STORED', 'TRANSFER_PENDING', 'READY_FOR_HANDOVER', 'RETURNED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "found_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(150) NOT NULL, "description" text, "category" character varying(100) NOT NULL, "found_location" character varying(100) NOT NULL, "found_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."found_items_status_enum" NOT NULL DEFAULT 'REGISTERED', "storage_location" character varying(100), "registered_by_staff_id" uuid NOT NULL, CONSTRAINT "PK_23f3cc89445e7ca49f3b57a1e08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."found_item_evidence_type_enum" AS ENUM('PHOTO', 'RECEIPT', 'SERIAL_NUMBER', 'DESCRIPTION_NOTE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "found_item_evidence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "found_item_id" uuid NOT NULL, "type" "public"."found_item_evidence_type_enum" NOT NULL DEFAULT 'PHOTO', "file_url" text NOT NULL, "notes" text, CONSTRAINT "PK_5318b210465f10c9ef1071cbf2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."item_handovers_status_enum" AS ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "item_handovers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "found_item_id" uuid NOT NULL, "passenger_name" character varying(150) NOT NULL, "passenger_email" character varying(150) NOT NULL, "passenger_phone" character varying(50) NOT NULL, "verification_code" character varying(100) NOT NULL, "processed_by_staff_id" uuid NOT NULL, "status" "public"."item_handovers_status_enum" NOT NULL DEFAULT 'PENDING', "signature_url" text, "notes" text, CONSTRAINT "PK_bf62d8d913c51361eec90ed6896" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."item_transfers_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "item_transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "found_item_id" uuid NOT NULL, "from_station" character varying(100) NOT NULL, "to_station" character varying(100) NOT NULL, "initiated_by_staff_id" uuid NOT NULL, "received_by_staff_id" uuid, "status" "public"."item_transfers_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, CONSTRAINT "PK_29c343cc8a585c9943e3c846231" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_f160d97a931844109de9d04228f" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_matches" ADD CONSTRAINT "FK_e464f4db6b5a040da27eb6e0f3e" FOREIGN KEY ("lost_item_id") REFERENCES "lost_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ownership_claims" ADD CONSTRAINT "FK_cf2c285f0f3e8bc3289f0f3c177" FOREIGN KEY ("match_id") REFERENCES "item_matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim_verifications" ADD CONSTRAINT "FK_bd7cb3d2ec9a13cf020d0954965" FOREIGN KEY ("claim_id") REFERENCES "ownership_claims"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" ADD CONSTRAINT "FK_3c0871fc7358244f7fac1ea11dd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" ADD CONSTRAINT "FK_3bb65cd8c45ce81848ecc1e1f27" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_7e0bb6ee15c8ca251fd96fe79b0" FOREIGN KEY ("route_id") REFERENCES "transport_routes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "found_item_evidence" ADD CONSTRAINT "FK_a4d56ddf3a68aff48057104c22f" FOREIGN KEY ("found_item_id") REFERENCES "found_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "found_item_evidence" DROP CONSTRAINT "FK_a4d56ddf3a68aff48057104c22f"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_7e0bb6ee15c8ca251fd96fe79b0"`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" DROP CONSTRAINT "FK_3bb65cd8c45ce81848ecc1e1f27"`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" DROP CONSTRAINT "FK_3c0871fc7358244f7fac1ea11dd"`);
        await queryRunner.query(`ALTER TABLE "claim_verifications" DROP CONSTRAINT "FK_bd7cb3d2ec9a13cf020d0954965"`);
        await queryRunner.query(`ALTER TABLE "ownership_claims" DROP CONSTRAINT "FK_cf2c285f0f3e8bc3289f0f3c177"`);
        await queryRunner.query(`ALTER TABLE "item_matches" DROP CONSTRAINT "FK_e464f4db6b5a040da27eb6e0f3e"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_f160d97a931844109de9d04228f"`);
        await queryRunner.query(`DROP TABLE "item_transfers"`);
        await queryRunner.query(`DROP TYPE "public"."item_transfers_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_handovers"`);
        await queryRunner.query(`DROP TYPE "public"."item_handovers_status_enum"`);
        await queryRunner.query(`DROP TABLE "found_item_evidence"`);
        await queryRunner.query(`DROP TYPE "public"."found_item_evidence_type_enum"`);
        await queryRunner.query(`DROP TABLE "found_items"`);
        await queryRunner.query(`DROP TYPE "public"."found_items_status_enum"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TABLE "stations"`);
        await queryRunner.query(`DROP TABLE "transport_routes"`);
        await queryRunner.query(`DROP TABLE "fraud_flags"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_flag_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_severity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_flag_type_enum"`);
        await queryRunner.query(`DROP TABLE "claim_verifications"`);
        await queryRunner.query(`DROP TABLE "ownership_claims"`);
        await queryRunner.query(`DROP TYPE "public"."verification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_matches"`);
        await queryRunner.query(`DROP TYPE "public"."match_status_enum"`);
        await queryRunner.query(`DROP TABLE "lost_items"`);
        await queryRunner.query(`DROP TYPE "public"."lost_item_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_categories"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
