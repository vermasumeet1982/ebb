#!/bin/bash

# 🏦 Eagle Bank Database Setup Script
# This script creates the PostgreSQL database and user for the Eagle Bank application

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="eaglebank"
DB_USER="eagle_bank_user"

echo -e "${GREEN}🏦 Eagle Bank Database Setup${NC}"
echo "=================================="

# Prompt for password
echo -e "${YELLOW}🔐 Please enter a password for the database user '${DB_USER}':${NC}"
while true; do
    read -s -p "Password: " DB_PASSWORD
    echo
    read -s -p "Confirm password: " DB_PASSWORD_CONFIRM
    echo
    
    if [ "$DB_PASSWORD" = "$DB_PASSWORD_CONFIRM" ]; then
        if [ ${#DB_PASSWORD} -lt 8 ]; then
            echo -e "${RED}❌ Password must be at least 8 characters long. Please try again.${NC}"
            continue
        fi
        echo -e "${GREEN}✅ Password confirmed${NC}"
        break
    else
        echo -e "${RED}❌ Passwords do not match. Please try again.${NC}"
    fi
done

# Check if PostgreSQL is running
echo -e "${YELLOW}📋 Checking PostgreSQL status...${NC}"
if ! brew services list | grep postgresql@15 | grep started > /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting it now...${NC}"
    brew services start postgresql@15
    sleep 3
else
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
fi

# Check if psql command is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql command not found. Please ensure PostgreSQL is installed and in your PATH.${NC}"
    exit 1
fi

echo -e "${YELLOW}🗄️  Creating database and user...${NC}"

# Create database and user
psql postgres << EOF
-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- Create user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Create database
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to the database and grant schema privileges
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${DB_USER};

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ${DB_USER};

EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '${DB_NAME}' created successfully${NC}"
    echo -e "${GREEN}✅ User '${DB_USER}' created successfully${NC}"
else
    echo -e "${RED}❌ Error creating database or user${NC}"
    exit 1
fi

# Test connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if PGPASSWORD=${DB_PASSWORD} psql -h localhost -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection test successful${NC}"
else
    echo -e "${RED}❌ Database connection test failed${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

# Application Configuration
ENVIRONMENT=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Connection Pool (Optional)
DATABASE_CONNECTION_LIMIT=20
DATABASE_CONNECTION_TIMEOUT=30000
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists - skipping creation${NC}"
    echo -e "${YELLOW}📋 Make sure your DATABASE_URL is set to:${NC}"
    echo "DATABASE_URL=\"postgresql://${DB_USER}:[YOUR_PASSWORD]@localhost:5432/${DB_NAME}\""
fi

# Set up Prisma schema and generate client
echo -e "${YELLOW}🔧 Setting up Prisma schema...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Please run 'yarn install' first.${NC}"
    echo -e "${YELLOW}🚀 Next steps:${NC}"
    echo "1. Run: yarn install"
    echo "2. Run: npx prisma db push"
    echo "3. Run: yarn prisma:generate"
    echo "4. Run: yarn dev"
    echo ""
    echo -e "${GREEN}Happy coding! 🏦${NC}"
    exit 0
fi

# Push Prisma schema to database
echo -e "${YELLOW}📊 Pushing Prisma schema to database...${NC}"
if npx prisma db push; then
    echo -e "${GREEN}✅ Prisma schema pushed successfully${NC}"
else
    echo -e "${RED}❌ Error pushing Prisma schema${NC}"
    exit 1
fi

# Generate Prisma client
echo -e "${YELLOW}🔨 Generating Prisma client...${NC}"
if yarn prisma:generate; then
    echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
else
    echo -e "${RED}❌ Error generating Prisma client${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================================="
echo -e "Database: ${GREEN}${DB_NAME}${NC}"
echo -e "User: ${GREEN}${DB_USER}${NC}"
echo -e "Connection URL: ${GREEN}postgresql://${DB_USER}:[PASSWORD_HIDDEN]@localhost:5432/${DB_NAME}${NC}"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "1. Run: yarn dev"
echo ""
echo -e "${GREEN}Happy coding! 🏦${NC}" 