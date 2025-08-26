# Migrations & Seeding (Prisma)

This project uses **Prisma** to manage the database schema and seed data.

To create/alter tables, run migrations **against your own local database**. Treat this like a production db, only make changes that won't lose the seed data.

## 1. Point Prisma to your own DB

Create a local database (MySQL) and set your `.env`:

```env
# .env
DATABASE_URL="mysql://root:password@localhost:3306/warden_local"
```

If the DB doesn’t exist yet, create it:

```sql
CREATE DATABASE warden_local;
```

## 2. Create and Run Migrations

Generate the Prisma client (optional if you already did):

```bash
npx prisma generate
```

Create a new migration (replace `migration_name` with a meaningful name):

```bash
npx prisma migrate dev --name migration_name
```

Apply pending migrations to the database:

```bash
npx prisma migrate deploy
```

## Seeding Data

Seed data is available in the codebase. To run the seed script:

```bash
npm run db:seed
```

This will populate your database with the initial dataset.
