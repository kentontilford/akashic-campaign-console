# PostgreSQL Setup for Akashic Campaign Console

## Quick Setup Options

### Option 1: Using Docker (Easiest)
If you have Docker installed, run:
```bash
docker run --name akashic-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=akashic_campaign -p 5432:5432 -d postgres
```

Then update your `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/akashic_campaign?schema=public"
```

### Option 2: Local PostgreSQL Installation

#### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the 'postgres' user
4. After installation, open pgAdmin or use psql to create the database:
   ```sql
   CREATE DATABASE akashic_campaign;
   ```

#### macOS
```bash
# Install with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb akashic_campaign
```

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb akashic_campaign
```

### Option 3: Use a Cloud Database (Free Tier)

#### Supabase (Recommended for testing)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Update your `.env`:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

#### Neon
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update your `.env`

## Verify Your Setup

After setting up PostgreSQL, run:
```bash
# Push the database schema
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check if the port 5432 is not blocked
- Verify your connection credentials

### "Authentication failed"
- Check the username and password in your DATABASE_URL
- Default username is usually 'postgres'
- Password is what you set during installation

### "Database does not exist"
- Create the database manually:
  ```bash
  createdb -U postgres akashic_campaign
  ```
  Or use psql:
  ```sql
  CREATE DATABASE akashic_campaign;
  ```