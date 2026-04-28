# TTX Backend - Tabletop Exercise Game Management System

## Overview
TTX Backend is a REST API server for managing cybersecurity tabletop exercises (TTX). It provides a comprehensive system for creating and running security incident response simulation games where teams select cards to respond to various security threats and scenarios.

## Features

### Core Functionality
- **Game Management**: Create, start, and manage tabletop exercise games
- **Threat Scenarios**: Define and categorize security threats for exercises
- **Card System**: Manage response cards that teams can play against threats
- **Round-based Gameplay**: Organize games into rounds with threat activation
- **Group Management**: Support multiple teams/groups participating in exercises
- **Scoring System**: Track and evaluate team performance
- **Moderator Controls**: Administrative features for game facilitators

### Key Components
- **Games**: Main game sessions with configurable settings
- **Threats**: Security scenarios that teams must respond to
- **Cards**: Response options representing security controls or actions
- **Groups**: Teams participating in the exercise
- **Rounds**: Time-bounded game segments
- **Categories**: Threat and card classification system
- **Scoring**: Performance tracking and evaluation

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing, Helmet.js for security headers
- **API Documentation**: Swagger UI with OpenAPI 3.0
- **Development**: Nodemon, ESLint

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Setup Steps

1. Clone the repository:
```bash
git clone [repository-url]
cd ttx-backend
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory with:
```env
DBUSER=postgres
DBHOST=localhost
DBNAME=ttxdb
DBPASS=your_password
DBPORT=5432
JWT_SECRET=your_jwt_secret
PORT=5000
API_DOC=true  # Enable Swagger UI documentation (optional)
```

4. Set up the database:
```bash
# Option 1: Complete setup (provision + migrate)
npm run db:setup

# Option 2: Run steps individually
npm run db:provision  # Creates the database if it doesn't exist
npm run db:migrate    # Runs pending migrations
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Project Structure
```
ttx-backend/
├── API.md                  # API documentation
├── README.md              # This file
├── .gitignore             # Git ignore file
├── backend/
│   ├── package.json       # Node.js dependencies
│   ├── migrations/        # SQL migration files
│   │   └── 001_initial_schema.sql
│   ├── scripts/           # Database scripts
│   │   ├── provision.js  # Database provisioning script
│   │   └── migrate.js    # Migration runner script
│   └── src/
│       ├── app.js         # Express app configuration
│       ├── server.js      # Server entry point
│       ├── config/
│       │   ├── db.js      # Database configuration
│       │   └── swagger.js # Swagger/OpenAPI configuration
│       ├── controllers/   # Request handlers
│       ├── models/        # Data models
│       ├── routes/        # API route definitions with Swagger annotations
│       └── middleware/    # Express middleware
```

## API Documentation
See [API.md](./API.md) for complete API endpoint documentation.

### Interactive Documentation
When `API_DOC=true` is set in the environment variables, you can access the interactive Swagger UI documentation at:
```
http://localhost:3000/api-docs
```

### Main API Routes
- `/games` - Game management
- `/moderator` - Moderator authentication and controls
- `/group` - Team/group management
- `/round` - Round operations
- `/threat` - Threat scenario management
- `/card` - Response card management
- `/score` - Scoring and evaluation

## Authentication
Protected routes require JWT authentication. Moderators must:
1. Register via `/moderator/register`
2. Login via `/moderator/login` to receive a JWT token
3. Include the token in the Authorization header: `Bearer <token>`

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses Nodemon to automatically restart the server on file changes.

### Database Management

#### Running Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Add new migrations
# Create a new file in migrations/ folder with sequential numbering
# Example: migrations/002_add_new_feature.sql
```

#### Database Scripts
- **`npm run db:provision`** - Creates the database if it doesn't exist
- **`npm run db:migrate`** - Runs all pending SQL migrations
- **`npm run db:setup`** - Runs both provision and migrate (for initial setup)

#### Migration System Features
- Tracks executed migrations in a `migrations` table
- Only runs new migrations that haven't been executed
- Supports transactional migrations with automatic rollback on failure
- Sequential execution based on filename sorting

### Testing the API
Test if the server is running:
```bash
curl http://localhost:5000/test
# Response: "AHHHHHHHHHH!!!"
```

## Database Schema

### Core Tables (from initial migration)
- `users` - User accounts with authentication
- `cards` - Card information with user association
- `transactions` - Transaction records with status tracking
- `migrations` - Tracks executed database migrations

### Game Tables (to be added in future migrations)
- `game` - Game sessions
- `moderator` - Game facilitators
- `game_settings` - Configurable game parameters
- `group` - Participating teams
- `rounds` - Game rounds
- `threat` - Security scenarios
- `category` - Classification system
- `threat_category` - Threat categorization
- `threat_answer` - Correct responses to threats
- `card_usage` - Track card usage limits
- `round_card_selection` - Cards played per round
- `score` - Team scoring

## Security Considerations
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- Environment variables for sensitive configuration
- Input validation on all endpoints

## License
ISC

## Support
For issues or questions, please open an issue in the repository.