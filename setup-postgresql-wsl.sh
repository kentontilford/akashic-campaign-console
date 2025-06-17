#!/bin/bash

echo "🐘 PostgreSQL Setup for WSL Ubuntu"
echo "=================================="
echo ""
echo "This script will help you install PostgreSQL on WSL Ubuntu."
echo "You'll need to enter your sudo password when prompted."
echo ""
read -p "Press Enter to continue..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL..."
sudo service postgresql start

# Check if PostgreSQL is running
if sudo service postgresql status | grep -q "online"; then
    echo "✅ PostgreSQL is running!"
else
    echo "⚠️  PostgreSQL might not be running. Trying to start it..."
    sudo service postgresql restart
fi

# Set password for postgres user
echo ""
echo "🔐 Setting up PostgreSQL user..."
echo "You'll be prompted to set a password for the 'postgres' database user."
echo "Remember this password - you'll need it for the DATABASE_URL!"
echo ""
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Create the database
echo "📊 Creating akashic_campaign database..."
sudo -u postgres createdb akashic_campaign

# Test connection
echo ""
echo "🧪 Testing database connection..."
if PGPASSWORD=postgres psql -U postgres -d akashic_campaign -c '\l' &> /dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Could not connect to database. You may need to configure PostgreSQL."
fi

# Update .env file
echo ""
echo "📝 Your DATABASE_URL should be:"
echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/akashic_campaign?schema=public\""
echo ""
echo "✨ Setup complete! Next steps:"
echo "1. Make sure PostgreSQL starts automatically:"
echo "   echo 'sudo service postgresql start' >> ~/.bashrc"
echo "2. Run: npx prisma db push"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:3000"

# Add PostgreSQL to WSL startup (optional)
echo ""
read -p "Would you like PostgreSQL to start automatically when you open WSL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "sudo service postgresql start 2>/dev/null" >> ~/.bashrc
    echo "✅ PostgreSQL will start automatically with WSL"
fi