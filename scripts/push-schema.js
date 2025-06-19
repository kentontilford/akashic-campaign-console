const { execSync } = require('child_process');

// Get the pooler URL from command line or env
const poolerUrl = process.env.DATABASE_URL || process.argv[2];

if (!poolerUrl) {
  console.error('Please provide DATABASE_URL');
  process.exit(1);
}

// Extract connection details from URL
const urlPattern = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)\?(.+)/;
const match = poolerUrl.match(urlPattern);

if (!match) {
  console.error('Invalid database URL format');
  process.exit(1);
}

const [, user, password, host, port, database, params] = match;

// For Supabase, we need to construct the direct URL
// The pattern is: pooler host "aws-0-us-east-1.pooler.supabase.com" -> "db.{project-ref}.supabase.co"
let directHost = host;
let directPort = port;

if (host.includes('pooler.supabase.com')) {
  // Extract project ref from user (postgres.{project-ref})
  const projectRef = user.split('.')[1];
  if (projectRef) {
    directHost = `db.${projectRef}.supabase.co`;
    directPort = '5432';
  }
}

const directUrl = `postgres://${user}:${password}@${directHost}:${directPort}/${database}?sslmode=require`;

console.log('Using direct connection for schema push...');
console.log(`Host: ${directHost}:${directPort}`);

try {
  // Run prisma db push with the direct URL
  execSync(`DATABASE_URL="${directUrl}" npx prisma db push --skip-generate`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: directUrl }
  });
  
  console.log('\n✅ Schema pushed successfully!');
  console.log('\nNow run: npm run create:admin');
} catch (error) {
  console.error('\n❌ Failed to push schema');
  console.error('If the direct URL failed, you may need to:');
  console.error('1. Go to your Supabase dashboard');
  console.error('2. Find the direct connection string (not pooler)');
  console.error('3. Run: DATABASE_URL="direct-url" npm run prisma:push');
}