# API Documentation

## Base URL
All endpoints are prefixed with the base URL of your server (e.g., `http://localhost:5000`)

## API Documentation UI
- **Swagger UI** `/api-docs` - Interactive API documentation (when enabled via `API_DOC=true` in .env)

## Authentication
Protected routes require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Test Endpoint

### Test Server
**GET** `/test`
- **Response:** `200 OK` - Returns "AHHHHHHHHHH!!!"

---

## Moderator Endpoints
**Base Path:** `/api/moderator`

### Test Route
**GET** `/api/moderator/test`
- **Response:** `200 OK` - "Moderator route works!"

### Register
**POST** `/api/moderator/register`
- **Body:** `{ "email": string, "password": string, "name": string }`
- **Response:** `201 Created` - `{ "moderator": object, "token": string }`

### Login
**POST** `/api/moderator/login`
- **Body:** `{ "email": string, "password": string }`
- **Response:** `200 OK` - `{ "token": string, "moderator": object }`

---

## Game Endpoints
**Base Path:** `/games`

### Test Route
**GET** `/games/test`
- **Response:** `200 OK` - "Game route works!"

### List All Games
**GET** `/games/`
- **Response:** `200 OK` - Array of game objects

### Create Game
**POST** `/games/`
- **Body:** `{ "game_name": string, "game_type": string }`
- **Response:** `201 Created` - Game object with generated `game_code`

### Get Rounds for Game
**GET** `/games/:id/rounds`
- **Params:** `id` - Game ID
- **Response:** `200 OK` - Array of round objects

### Add Round to Game
**POST** `/games/:id/rounds`
- **Params:** `id` - Game ID
- **Body:** `{ "roundNumber": number, "threatId": string }`
- **Response:** `201 Created` - Round object

### Delete Game
**DELETE** `/games/:id`
- **Params:** `id` - Game ID
- **Response:** `200 OK` - Deletion confirmation

---

## Game Group Endpoints
**Base Path:** `/game-group`

### Test Route
**GET** `/game-group/test`
- **Response:** `200 OK` - "Game Group route works!"

### Join Game by Code
**POST** `/game-group/join`
- **Body:** `{ "game_code": string, "group_id": number }`
- **Response:** `200 OK` - Join confirmation

### Get Groups in Game
**GET** `/game-group/:id/groups`
- **Params:** `id` - Game ID
- **Response:** `200 OK` - Array of groups in the game

---

## Game Settings Endpoints
**Base Path:** `/game-settings`

### Test Route
**GET** `/game-settings/test`
- **Response:** `200 OK` - "Game settings route works!"

### Create Game Settings
**POST** `/game-settings/`
- **Body:** `{ "game_id": number, "budget": number, "card_reuse_limit": number }`
- **Response:** `201 Created` - Settings object

### Get Game Settings
**GET** `/game-settings/:gameId`
- **Params:** `gameId` - Game ID
- **Response:** `200 OK` - Settings object

### Update Game Settings
**PUT** `/game-settings/:gameId`
- **Params:** `gameId` - Game ID
- **Body:** Partial settings object
- **Response:** `200 OK` - Updated settings

---

## Group Endpoints
**Base Path:** `/group`

### Test Route
**GET** `/group/test`
- **Response:** `200 OK` - "Group route works!"

### Create Group
**POST** `/group/`
- **Body:** `{ "group_name": string, "leader_name": string }`
- **Response:** `201 Created` - Group object

### List Groups
**GET** `/group/`
- **Response:** `200 OK` - Array of groups

### Get Group
**GET** `/group/:groupId`
- **Params:** `groupId` - Group ID
- **Response:** `200 OK` - Group object

### Update Group
**PUT** `/group/:groupId`
- **Params:** `groupId` - Group ID
- **Body:** Partial group object
- **Response:** `200 OK` - Updated group

### Delete Group
**DELETE** `/group/:groupId`
- **Params:** `groupId` - Group ID
- **Response:** `204 No Content`

### Join Game
**POST** `/group/:groupId/join-game`
- **Params:** `groupId` - Group ID
- **Body:** `{ "gameId": string }`
- **Response:** `200 OK` - Confirmation

### Submit Selections
**POST** `/group/:groupId/selections`
- **Params:** `groupId` - Group ID
- **Body:** `{ "roundId": string, "cardIds": string[] }`
- **Response:** `200 OK` - Selection confirmation

---

## Round Endpoints
**Base Path:** `/round`

### Test Route
**GET** `/round/test`
- **Response:** `200 OK` - "Round route works!"

### Create Round
**POST** `/round/`
- **Body:** `{ "round_number": number, "game_id": number, "game_threat_id": number, "duration_minutes": number, "first_submit_bonus": number }`
- **Response:** `201 Created` - Round object

### Start Round
**PUT** `/round/:id/start`
- **Params:** `id` - Round ID
- **Response:** `200 OK` - Started round

### Restart Round Timer
**PUT** `/round/:id/restart`
- **Params:** `id` - Round ID
- **Response:** `200 OK` - Round with reset timer

### Update Round Timer
**PUT** `/round/:id/timer`
- **Params:** `id` - Round ID
- **Body:** `{ "duration_minutes": number }`
- **Response:** `200 OK` - Updated round

### End Round
**PUT** `/round/:id/end`
- **Params:** `id` - Round ID
- **Response:** `200 OK` - Ended round

### Submit Answers
**POST** `/round/:id/submit`
- **Params:** `id` - Round ID
- **Body:** `{ "group_id": number }`
- **Response:** `200 OK` - Submission confirmation with score

### Finalize Round
**POST** `/round/:id/finalize`
- **Params:** `id` - Round ID
- **Response:** `200 OK` - Finalized round

---

## Game Threat Endpoints
**Base Path:** `/game-threat`

### Test Route
**GET** `/game-threat/test`
- **Response:** `200 OK` - "Game Threat route works!"

### Create Game Threat
**POST** `/game-threat/`
- **Body:** `{ "game_id": number, "threat_id": number, "order_num": number }`
- **Response:** `201 Created` - Game threat object

### Activate Threat
**PUT** `/game-threat/:id/activate`
- **Params:** `id` - Game threat ID
- **Response:** `200 OK` - Activated threat

### Deactivate Threat
**PUT** `/game-threat/:id/deactivate`
- **Params:** `id` - Game threat ID
- **Response:** `200 OK` - Deactivated threat

---

## Category Endpoints
**Base Path:** `/category`

### Test Route
**GET** `/category/test`
- **Response:** `200 OK` - "Category route works!"

### Create Category
**POST** `/category/`
- **Body:** `{ "category_name": string, "created_by": number }`
- **Response:** `201 Created` - Category object

### List Categories
**GET** `/category/`
- **Response:** `200 OK` - Array of categories

### Get Category
**GET** `/category/:id`
- **Params:** `id` - Category ID
- **Response:** `200 OK` - Category object

### Get Threats in Category
**GET** `/category/:id/threats`
- **Params:** `id` - Category ID
- **Response:** `200 OK` - Array of threats in category

### Update Category
**PUT** `/category/:id`
- **Params:** `id` - Category ID
- **Body:** `{ "category_name": string }`
- **Response:** `200 OK` - Updated category

---

## Threat Endpoints
**Base Path:** `/threat`

### Test Route
**GET** `/threat/test`
- **Response:** `200 OK` - "Threat route works!"

### Create Threat
**POST** `/threat/`
- **Body:** `{ "description": string, "created_by": number }`
- **Response:** `201 Created` - Threat object

### List Threats
**GET** `/threat/`
- **Response:** `200 OK` - Array of threats

### Get Threat
**GET** `/threat/:id`
- **Params:** `id` - Threat ID
- **Response:** `200 OK` - Threat object

### Update Threat
**PUT** `/threat/:id`
- **Params:** `id` - Threat ID
- **Body:** `{ "description": string }`
- **Response:** `200 OK` - Updated threat

### Delete Threat
**DELETE** `/threat/:id`
- **Params:** `id` - Threat ID
- **Response:** `200 OK` - Deletion confirmation

### Link Cards to Threat
**POST** `/threat/:id/cards`
- **Params:** `id` - Threat ID
- **Body:** `{ "cardIds": string[] }`
- **Response:** `200 OK` - Link confirmation

---

## Card Endpoints
**Base Path:** `/card`

### Test Route
**GET** `/card/test`
- **Response:** `200 OK` - "Card route works!"

### Create Card
**POST** `/card/`
- **Body:** `{ "card_name": string, "category": string }`
- **Response:** `201 Created` - Card object

### List Cards
**GET** `/card/`
- **Response:** `200 OK` - Array of cards

### Get Card
**GET** `/card/:id`
- **Params:** `id` - Card ID
- **Response:** `200 OK` - Card object

### Update Card
**PUT** `/card/:id`
- **Params:** `id` - Card ID
- **Body:** `{ "card_name": string, "category": string }`
- **Response:** `200 OK` - Updated card

### Delete Card
**DELETE** `/card/:id`
- **Params:** `id` - Card ID
- **Response:** `200 OK` - Deletion confirmation

### Assign Card to Threat
**POST** `/card/:id/threats`
- **Params:** `id` - Card ID
- **Body:** `{ "threatId": string }`
- **Response:** `200 OK` - Assignment confirmation

---

## Threat Category Endpoints
**Base Path:** `/threat-category`

### Test Route
**GET** `/threat-category/test`
- **Response:** `200 OK` - "Threat Category route works!"

### Assign Threat to Category
**POST** `/threat-category/`
- **Body:** `{ "threat_id": number, "category_id": number }`
- **Response:** `201 Created` - Assignment object

### Assign Threat to Category (alternate)
**POST** `/threat-category/assign`
- **Body:** `{ "threat_id": number, "category_id": number }`
- **Response:** `201 Created` - Assignment object

### Unassign Threat from Category
**DELETE** `/threat-category/unassign`
- **Body:** `{ "threat_id": number, "category_id": number }`
- **Response:** `200 OK` - Unassignment confirmation

### Get Categories for Threat
**GET** `/threat-category/threat/:threatId`
- **Params:** `threatId` - Threat ID
- **Response:** `200 OK` - Array of categories

### Get Threats for Category
**GET** `/threat-category/category/:categoryId`
- **Params:** `categoryId` - Category ID
- **Response:** `200 OK` - Array of threats

---

## Threat Answer Endpoints
**Base Path:** `/threat-answer`

### Test Route
**GET** `/threat-answer/test`
- **Response:** `200 OK` - "Threat Answer route works!"

### Add Threat Answer
**POST** `/threat-answer/`
- **Body:** `{ "threat_id": number, "card_id": number, "answer_type": string, "points": number }`
- **Response:** `201 Created` - Answer object

### Update Threat Answer
**PUT** `/threat-answer/`
- **Body:** `{ "threat_id": number, "card_id": number, "answer_type": string, "points": number }`
- **Response:** `200 OK` - Updated answer

### Validate Answer
**POST** `/threat-answer/validate`
- **Body:** `{ "threatId": string, "cardId": string }`
- **Response:** `200 OK` - `{ "isCorrect": boolean }`

### Get Threat Answers
**GET** `/threat-answer/threat/:threat_id/answers`
- **Params:** `threat_id` - Threat ID
- **Response:** `200 OK` - `{ "answers": array }`

### Delete Threat Answer
**DELETE** `/threat-answer/:threat_id/:card_id`
- **Params:** `threat_id` - Threat ID, `card_id` - Card ID
- **Response:** `200 OK` - Deletion confirmation

---

## Card Usage Endpoints
**Base Path:** `/card-usage`

### Test Route
**GET** `/card-usage/test`
- **Response:** `200 OK` - "Card Usage route works!"

### Create Usage Record
**POST** `/card-usage/`
- **Body:** `{ "cardId": string, "gameId": string, "groupId": string }`
- **Response:** `201 Created` - Usage record

### Increment Usage Count
**PUT** `/card-usage/increment`
- **Body:** `{ "cardId": string, "gameId": string }`
- **Response:** `200 OK` - Updated count

### Check Usage Limit
**POST** `/card-usage/check`
- **Body:** `{ "cardId": string, "gameId": string }`
- **Response:** `200 OK` - `{ "canUse": boolean, "currentUsage": number, "limit": number }`

---

## Round Card Selection Endpoints
**Base Path:** `/round-card-selection`

### Test Route
**GET** `/round-card-selection/test`
- **Response:** `200 OK` - "Round Card chuchu route works!"

### Place Card in Round
**POST** `/round-card-selection/`
- **Body:** `{ "round_id": number, "group_id": number, "card_id": number }`
- **Response:** `201 Created` - Selection object

### Get Round Selections
**GET** `/round-card-selection/round/:roundId`
- **Params:** `roundId` - Round ID
- **Response:** `200 OK` - Array of selections

---

## Score Endpoints
**Base Path:** `/score`

### Test Route
**GET** `/score/test`
- **Response:** `200 OK` - "Score route works!"

### Get Leaderboard
**GET** `/score/leaderboard/:gameId`
- **Params:** `gameId` - Game ID
- **Response:** `200 OK` - Array of `{ "group_id", "group_name", "total_points" }`

### Get Round Breakdown
**GET** `/score/breakdown/:gameId`
- **Params:** `gameId` - Game ID
- **Response:** `200 OK` - Array of round scores with `{ "round_number", "group_name", "base_points", "bonus_points", "total_points" }`

### Get Score
**GET** `/score/:group_id/:round_id`
- **Params:** `group_id` - Group ID, `round_id` - Round ID
- **Response:** `200 OK` - Score object

---

## Status Codes
| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

## Request Headers
- **Content-Type:** `application/json` (for POST/PUT requests)
- **Authorization:** `Bearer <token>` (for protected routes)
