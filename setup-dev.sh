#!/bin/bash

echo "🚀 Akashic Campaign Console - Development Setup"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from example..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your credentials."
fi

# Check PostgreSQL
echo -e "\n📊 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
    
    # Try to connect to PostgreSQL
    if psql -U postgres -c '\l' &> /dev/null; then
        echo "✅ PostgreSQL is running"
        
        # Create database if it doesn't exist
        if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw akashic_campaign; then
            echo "📝 Creating database 'akashic_campaign'..."
            createdb -U postgres akashic_campaign
            echo "✅ Database created"
        else
            echo "✅ Database 'akashic_campaign' already exists"
        fi
    else
        echo "❌ PostgreSQL is not running or authentication failed"
        echo "   Please start PostgreSQL and ensure you can connect as 'postgres' user"
        echo "   On Windows: Start PostgreSQL from Services"
        echo "   On Mac: brew services start postgresql"
        echo "   On Linux: sudo systemctl start postgresql"
    fi
else
    echo "❌ PostgreSQL is not installed"
    echo "   Please install PostgreSQL from https://www.postgresql.org/download/"
fi

# Check Node.js
echo -e "\n📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION is installed"
else
    echo "❌ Node.js is not installed"
    exit 1
fi

# Install dependencies
echo -e "\n📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo -e "\n🔧 Generating Prisma Client..."
npx prisma generate

# Push database schema
echo -e "\n🗄️  Setting up database schema..."
if npx prisma db push; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create database schema"
    echo "   Please check your DATABASE_URL in .env file"
    exit 1
fi

echo -e "\n✨ Setup complete! Next steps:"
echo "1. Update .env file with your API keys:"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000"
echo "4. Register a new account to get started!"