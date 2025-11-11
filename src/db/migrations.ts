import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_create_driver_dashboard": {
    async up(db) {
      return [
        await db.schema
          .createTable("driver_dashboard")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("payload", "text", (col) => col.notNull())
          .addColumn("updated_at", "integer", (col) => col.notNull())
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("driver_dashboard").ifExists().execute();
    },
  },
} satisfies Migrations;

