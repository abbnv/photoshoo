# Coolify Deploy

## Domain

- Production URL: `https://photo.aishny.ru`
- Lava webhook URL: `https://photo.aishny.ru/api/billing/lava/webhook`

## What to create in Coolify

1. Create a new **Application** from this repo with the **Docker Compose** build pack.
2. Use base directory:
   - `/` (root)
3. Use the included [docker-compose.yml](/Users/aleksandrbubnov/Documents/DEV/ai_photoshoot_mvp/docker-compose.yml).
4. After Coolify reads the compose file, assign the custom domain to the `app` service:
   - `https://photo.aishny.ru:3000`

This stack already contains both:

- `app`
- `postgres`

## Required environment variables

Copy values from `.env.example` and set at least:

- `NEXTAUTH_URL=https://photo.aishny.ru`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAILS`
- `POSTGRES_PASSWORD`

Recommended full set:

```env
NEXTAUTH_URL=https://photo.aishny.ru
NEXTAUTH_SECRET=replace_with_long_random_secret
ADMIN_EMAILS=a.bbnv@yandex.ru
POSTGRES_USER=app
POSTGRES_PASSWORD=replace_with_strong_db_password
POSTGRES_DB=ai_photoshoot
LAVA_API_KEY=
LAVA_WEBHOOK_BASIC_LOGIN=
LAVA_WEBHOOK_BASIC_PASSWORD=
LAVA_WEBHOOK_API_KEY=
```

`DATABASE_URL` is assembled automatically inside the compose stack, so you do not need to add it manually in Coolify.

## First launch

The `app` container entrypoint automatically:

- waits for PostgreSQL
- runs `npx prisma db push --skip-generate`
- creates `/app/storage-data`
- starts `next start`

No extra migration command is required for the first boot.

## Admin access

Any user who signs up with an email from `ADMIN_EMAILS` will automatically get access to `/admin`.

Suggested first login flow:

1. Deploy the app.
2. Open `https://photo.aishny.ru`
3. Register using an email from `ADMIN_EMAILS`
4. Open `/admin`
5. Fill in Lava keys, webhook login/password, and offer IDs

## Lava setup

In Lava webhook settings use:

- URL: `https://photo.aishny.ru/api/billing/lava/webhook`
- Auth method: `Basic`
- Login: same value as `LAVA_WEBHOOK_BASIC_LOGIN` or the value stored in `/admin`
- Password: same value as `LAVA_WEBHOOK_BASIC_PASSWORD` or the value stored in `/admin`

If you use Basic Auth, leave `LAVA_WEBHOOK_API_KEY` empty.

## Backup migration

### 1. Export current local database

Custom dump:

```bash
cd /Users/aleksandrbubnov/Documents/DEV/ai_photoshoot_mvp
DATABASE_URL='postgresql://app:app@localhost:5434/ai_photoshoot?schema=public' sh scripts/export-db.sh ./backup.dump
```

Plain SQL:

```bash
cd /Users/aleksandrbubnov/Documents/DEV/ai_photoshoot_mvp
DATABASE_URL='postgresql://app:app@localhost:5434/ai_photoshoot?schema=public' sh scripts/export-db.sh ./backup.sql
```

### 2. Import into Coolify PostgreSQL

Run locally from the same project folder, replacing the target URL with the PostgreSQL credentials from the compose stack you deployed in Coolify:

```bash
cd /Users/aleksandrbubnov/Documents/DEV/ai_photoshoot_mvp
DATABASE_URL='postgresql://app:strong_password@your-coolify-server-or-tunnel-host:5432/ai_photoshoot?schema=public' sh scripts/import-db.sh ./backup.dump
```

Supported import formats:

- `.sql`
- `.sql.gz`
- `.dump`
- `.backup`

## Recommended post-deploy checks

1. Open `https://photo.aishny.ru`
2. Sign up and log in
3. Open `/admin`
4. Create or verify tariffs
5. Open `/billing`
6. Verify checkout starts correctly
7. Verify Lava webhook can reach `https://photo.aishny.ru/api/billing/lava/webhook`
