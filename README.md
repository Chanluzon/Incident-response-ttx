# TTX - Tabletop Exercise Game Platform

A full-stack cybersecurity tabletop exercise (TTX) simulation platform where teams compete by selecting response cards to counter security threat scenarios, with moderators facilitating the exercises.

## Features

- **Game Management**: Create, configure, and run tabletop exercise games
- **Threat Scenarios**: Define categorized security threats for exercises
- **Card System**: Response cards representing security controls and actions
- **Round-based Gameplay**: Time-bounded rounds with threat activation
- **Team Competition**: Multiple groups compete simultaneously
- **Real-time Scoring**: Track and evaluate team performance with leaderboards
- **Moderator Dashboard**: Administrative controls for game facilitators

## Tech Stack

### Backend
- **Runtime**: Node.js v14+
- **Framework**: Express.js v5
- **Database**: PostgreSQL v12+
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet.js for HTTP headers
- **API Docs**: Swagger UI (OpenAPI 3.0)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4, DaisyUI
- **Routing**: React Router 7
- **Icons**: Lucide React, FontAwesome

## Project Structure

```
TTX_FINAL/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── server.js          # Entry point
│   │   ├── app.js             # Express configuration
│   │   ├── config/            # Database & Swagger config
│   │   ├── controllers/       # Request handlers (15 modules)
│   │   ├── models/            # Data models (15 modules)
│   │   ├── routes/            # API routes (15 modules)
│   │   └── middleware/        # Auth middleware
│   ├── migrations/            # SQL migrations
│   └── scripts/               # DB provisioning scripts
│
├── TTX/                        # React Frontend
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Router configuration
│   │   ├── config/api.js      # API URL configuration
│   │   ├── pages/
│   │   │   ├── dashboard/     # Player views
│   │   │   └── moderator/     # Admin views
│   │   └── layouts/           # Reusable components
│   └── .env.example           # Environment template
│
├── API.md                      # API endpoint documentation
```

## Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DBUSER=postgres
DBHOST=localhost
DBNAME=ttxdb
DBPASS=your_password
DBPORT=5432
JWT_SECRET=your_jwt_secret
PORT=5000
API_DOC=true
```

Initialize database and start server:
```bash
npm run db:setup    # Create database and run migrations
npm run dev         # Start with auto-reload (port 5000)
```

### 2. Frontend Setup

```bash
cd TTX
npm install
```

Create `TTX/.env` (optional - defaults to current hostname:5000):
```env
VITE_API_URL=http://localhost:5000
```

> The frontend auto-detects the API URL based on how you access it. If you open `http://192.168.1.50:5173`, API calls go to `http://192.168.1.50:5000`.

Start development server:
```bash
npm run dev         # Start Vite dev server (port 5173)
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs (when API_DOC=true)

## Available Scripts

### Backend (`backend/`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with nodemon |
| `npm start` | Production server |
| `npm run db:setup` | Full database setup (provision + migrate) |
| `npm run db:provision` | Create database if not exists |
| `npm run db:migrate` | Run pending migrations |

### Frontend (`TTX/`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Application Routes

### Player Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/SetUp` | Create team/group |
| `/Dashboard` | Player dashboard |
| `/GameList` | Browse available games |
| `/TTXGame` | Active gameplay |

### Moderator Routes
| Route | Description |
|-------|-------------|
| `/moderator` | Login |
| `/moderator/register` | Registration |
| `/moderator/dashboard` | Admin control panel |

## API Overview

### Authentication
```bash
# Register
POST /api/moderator/register
{ "email": "...", "password": "...", "name": "..." }

# Login
POST /api/moderator/login
{ "email": "...", "password": "..." }
# Returns: { "token": "jwt_token" }

# Use token in header
Authorization: Bearer <token>
```

### Main Endpoints
| Endpoint | Description |
|----------|-------------|
| `/api/moderator` | Auth (register/login) and admin functions |
| `/games` | Game CRUD operations |
| `/game-group` | Join games by code, list groups in game |
| `/game-settings` | Game configuration (budget, card limits) |
| `/group` | Team/group management |
| `/round` | Round lifecycle (start, submit, end) |
| `/threat` | Threat scenarios |
| `/card` | Response cards |
| `/category` | Threat/card classification |
| `/game-threat` | Assign threats to games |
| `/threat-answer` | Map correct cards to threats with points |
| `/score` | Leaderboards and scoring |

See [API.md](./API.md) for complete endpoint documentation.

## Database

### Migrations
Add new migrations in `backend/migrations/` with sequential numbering:
```
001_initial_schema.sql
002_your_feature.sql
```

Run migrations:
```bash
cd backend
npm run db:migrate
```

### Core Tables
| Table | Description |
|-------|-------------|
| `moderator` | Game facilitators with auth |
| `game` | Game sessions with unique codes |
| `game_settings` | Budget, card reuse limits |
| `group` | Participating teams |
| `game_group` | Links groups to games |
| `rounds` | Game rounds with timer |
| `threat` | Security scenarios |
| `category` | Classification system |
| `threat_category` | Threat-category links |
| `card` | Response cards |
| `threat_answer` | Correct cards with points |
| `game_threat` | Threats assigned to games |
| `round_card_selection` | Cards played per round |
| `score` | Team scoring records |

## Game Flow

1. **Moderator Setup**
   - Register/login to moderator dashboard
   - Create a new game (generates 6-character code)
   - Add threats and configure rounds

2. **Team Join**
   - Teams create a group (name + leader)
   - Join game using the game code

3. **Gameplay**
   - Moderator starts a round with a threat
   - Teams select response cards within time limit
   - Cards are scored based on correctness
   - First submission bonus available

4. **Scoring**
   - Points awarded for correct card selections
   - Bonus points for first team to submit
   - Leaderboard tracks cumulative scores

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DBUSER` | PostgreSQL user | postgres |
| `DBHOST` | Database host | localhost |
| `DBNAME` | Database name | ttxdb |
| `DBPASS` | Database password | - |
| `DBPORT` | Database port | 5432 |
| `JWT_SECRET` | JWT signing secret | - |
| `PORT` | Server port | 5000 |
| `API_DOC` | Enable Swagger UI | false |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://{hostname}:5000` (auto-detected) |

> **Note**: If `VITE_API_URL` is not set, the frontend automatically uses the same hostname you access it with. For example, accessing `http://192.168.1.50:5173` will make API calls to `http://192.168.1.50:5000`.

## License

ISC
