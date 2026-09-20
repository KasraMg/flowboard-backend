import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarFileIdToUser1789911850505 implements MigrationInterface {
    name = 'AddAvatarFileIdToUser1789911850505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarFileId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarFileId"`);
    }

}
