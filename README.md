# Eagle Bank Backend API

A REST API for Eagle Bank built with Node.js, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Framework**: Express.js

## Project Structure

```
src/
├── services/
│   ├── user/          # User microservice
│   └── account/       # Account microservice
├── shared/            # Shared utilities and middleware
└── index.ts          # Application entry point
```

## Getting Started

### 📖 Documentation

- **[Database Setup Guide](./DATABASE_SETUP.md)** - Complete PostgreSQL setup instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (see [Database Setup Guide](./DATABASE_SETUP.md) for installation)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   ```

3. Set up the database and schema:
   ```bash
   # Using npm
   npm run db:setup
   
   # Using yarn
   yarn db:setup
   ```
   This will:
   - Create the PostgreSQL database and user
   - Generate your `.env` file
   - Push the Prisma schema to create database tables
   - Generate the Prisma client
   
   **Note:** If you get a permission error, make the script executable:
   ```bash
   chmod +x scripts/setup-database.sh
   ```

### Development

Start the development server:
```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The API will be available at `http://localhost:3000`

### Testing with Postman

A Postman collection is provided in the `postman` directory for testing the API endpoints. The collection includes:

- Environment variables for sensitive data (auth tokens, user IDs, account numbers)
- All available API endpoints with example request bodies
- Proper authentication headers set up

To use the collection:

1. Import `postman/Eagle Bank.postman_collection.json` into Postman
2. Create a new environment and set up the following variables:
   - `auth_token` - JWT token received from login
   - `user_id` - User ID received after creating a user
   - `account_number` - Account number received after creating a bank account
   - `transaction_id` - Transaction ID received after creating a transaction

Recommended testing flow:
1. Create User → Get auth token from response
2. Authenticate User → Set auth_token variable
3. Create Bank Account → Set account_number variable
4. Test other endpoints using the stored variables

### Available Scripts

- `npm run dev` / `yarn dev` - Start development server with hot reload
- `npm run build` / `yarn build` - Build the project for production
- `npm run start` / `yarn start` - Start production server
- `npm run db:setup` / `yarn db:setup` - Set up PostgreSQL database, schema, and create .env file
- `npm run prisma:generate` / `yarn prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` / `yarn prisma:migrate` - Run database migrations
- `npm run prisma:studio` / `yarn prisma:studio` - Open Prisma Studio
- `npm run test` / `yarn test` - Run tests
- `npm run lint` / `yarn lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Authenticate user and get JWT token

### User Service
- `POST /v1/users` - Create user
- `GET /v1/users/{userId}` - Get user details (requires authentication)
- `PATCH /v1/users/{userId}` - Update user (requires authentication)

### Account Service
- `POST /v1/accounts` - Create bank account (requires authentication)
- `GET /v1/accounts` - List user's accounts (requires authentication)
- `GET /v1/accounts/{accountId}` - Get account details (requires authentication)
- `PATCH /v1/accounts/{accountId}` - Update account (requires authentication)
- `POST /v1/accounts/{accountId}/transactions` - Create transaction (requires authentication)
- `GET /v1/accounts/{accountId}/transactions` - List transactions (requires authentication)
- `GET /v1/accounts/{accountId}/transactions/{transactionId}` - Get transaction (requires authentication)

## Features

- JWT-based authentication
- Role-based access control
- Input validation with Zod
- Database transactions for financial operations
- Rate limiting
- Security headers with Helmet
- CORS support
- Comprehensive error handling

## Environment Variables

The following environment variables are required:

- `ENVIRONMENT` - Application environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - CORS origin (default: *)
- `JWT_SECRET` - Secret key for JWT token signing (required for authentication)

**Important:** Set a strong, unique JWT_SECRET in production. You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Database Schema

The application uses a single PostgreSQL database with separate tables for different services:
- Users (User service)
- Accounts and Transactions (Account service)

For detailed database setup and schema information, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT 