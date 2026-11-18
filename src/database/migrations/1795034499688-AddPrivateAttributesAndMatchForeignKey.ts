
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrivateAttributesAndMatchForeignKey1795034499688
  implements MigrationInterface
{
  name = 'AddPrivateAttributesAndMatchForeignKey1795034499688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "found_item_private_attributes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "found_item_id" uuid NOT NULL,
        "question_number" smallint NOT NULL,
        "question" character varying(250) NOT NULL,
        "answer_hash" character varying(64) NOT NULL,
        CONSTRAINT "PK_7afd0c2ff1cfc53e3182b804717"
        PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_found_item_private_question_number"
      ON "found_item_private_attributes"
      ("found_item_id", "question_number")
    `);

    await queryRunner.query(`
      ALTER TABLE "found_item_private_attributes"
      ADD CONSTRAINT "FK_907647b6f804d4795e473107e84"
      FOREIGN KEY ("found_item_id")
      REFERENCES "found_items"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "item_matches"
      ADD CONSTRAINT "FK_a7aed2dece0b73e396a4d59005b"
      FOREIGN KEY ("found_item_id")
      REFERENCES "found_items"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_matches"
      DROP CONSTRAINT "FK_a7aed2dece0b73e396a4d59005b"
    `);

    await queryRunner.query(`
      ALTER TABLE "found_item_private_attributes"
      DROP CONSTRAINT "FK_907647b6f804d4795e473107e84"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."UQ_found_item_private_question_number"
    `);

    await queryRunner.query(`
      DROP TABLE "found_item_private_attributes"
    `);
  }
}
