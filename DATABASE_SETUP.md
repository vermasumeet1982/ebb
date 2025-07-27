# 🗄️ Database Setup Guide - Eagle Bank

This guide will help you set up PostgreSQL locally for the Eagle Bank backend application using Prisma ORM.

## 📋 Prerequisites

- macOS, Linux, or Windows
- Node.js and Yarn installed
- Terminal/Command line access

## 🐘 PostgreSQL Installation

### Option 1: Homebrew (macOS - Recommended)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to your PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
psql --version
```

### Option 2: Official Installer (All Platforms)

1. Visit the [PostgreSQL Downloads page](https://www.postgresql.org/download/)
2. Select your operating system (macOS/Linux/Windows)
3. Download the installer
4. Run the installer and follow the setup wizard
5. Remember the password you set for the `postgres` user

### Option 3: Postgres.app (macOS GUI)

1. Download from [postgresapp.com](https://postgresapp.com/)
2. Drag Postgres.app to your Applications folder
3. Open Postgres.app and click "Initialize"
4. Add to PATH:
   ```bash
   echo 'export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin' >> ~/.zshrc
   source ~/.zshrc
   ```

## ✅ Verification Steps

### 1. Check PostgreSQL Installation

```bash
# Verify PostgreSQL is installed
psql --version

# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@15
```

### 2. Test Connection

```bash
# Connect to PostgreSQL
psql postgres

# You should see a prompt like:
# postgres=#

# Test some basic commands
\l    # List databases
\q    # Quit
```

## 🚀 Quick Commands Reference

```bash
# Start PostgreSQL
brew services start postgresql@15

# Stop PostgreSQL  
brew services stop postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15

# Connect to PostgreSQL
psql postgres

# Check PostgreSQL status
brew services list | grep postgresql
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start if not running
brew services start postgresql@15
```

#### 2. Command Not Found (psql)
```bash
# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify PATH
which psql
```

#### 3. Port Already in Use
```bash
# Check what's using port 5432
lsof -i :5432

# Kill process if needed (be careful!)
sudo kill -9 <PID>
```

#### 4. Permission Issues
```bash
# Fix PostgreSQL data directory permissions
sudo chown -R $(whoami) /opt/homebrew/var/postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15
```

#### 5. Homebrew Installation Issues
```bash
# Update Homebrew
brew update

# Reinstall PostgreSQL
brew uninstall postgresql@15
brew install postgresql@15
```

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Downloads](https://www.postgresql.org/download/)
- [Homebrew PostgreSQL](https://formulae.brew.sh/formula/postgresql@15)
- [Postgres.app Documentation](https://postgresapp.com/documentation/)

## 🎯 Next Steps

1. ✅ Install PostgreSQL using one of the methods above
2. ✅ Verify installation and test connection
3. ✅ Configure your environment variables
4. 🚀 Your Eagle Bank application will handle the rest!

---

**Need help?** Check the troubleshooting section or refer to the [main project README](./README.md) for additional information. 