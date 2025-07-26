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

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other configuration.

4. Set up the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## API Endpoints

### User Service
- `POST /v1/users` - Create user
- `POST /v1/auth/login` - Authenticate user
- `GET /v1/users/{userId}` - Get user details
- `PATCH /v1/users/{userId}` - Update user
- `DELETE /v1/users/{userId}` - Delete user

### Account Service
- `POST /v1/accounts` - Create bank account
- `GET /v1/accounts` - List user's accounts
- `GET /v1/accounts/{accountId}` - Get account details
- `PATCH /v1/accounts/{accountId}` - Update account
- `DELETE /v1/accounts/{accountId}` - Delete account
- `POST /v1/accounts/{accountId}/transactions` - Create transaction
- `GET /v1/accounts/{accountId}/transactions` - List transactions
- `GET /v1/accounts/{accountId}/transactions/{transactionId}` - Get transaction

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

See `.env.example` for required environment variables.

## Database Schema

The application uses a single PostgreSQL database with separate tables for different services:
- Users (User service)
- Accounts and Transactions (Account service)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT 