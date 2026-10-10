# 🌱 ECOLOOP — E-Waste Management & Recycling Platform

ECOLOOP is a full-stack e-waste management platform designed to connect households, waste collectors, authorized recyclers, and municipalities through a digital recycling ecosystem.

The platform helps users manage electronic waste collections, estimate material values, match collectors with recyclers, track recycling transactions, and monitor environmental impact.

## ✨ Key Features

### ♻️ E-Waste Collection Management
- Create and manage electronic waste collection lots.
- Record material types, quantities, weights, and conditions.
- Estimate collection value using material price ranges.
- Validate submitted collection data before storing it.

### 💰 Fair Value Estimation
- Calculate estimated minimum and maximum values for collected materials.
- Apply condition-based pricing adjustments.
- Maintain material pricing information by category.
- Store daily material price history in the database when the history endpoint is accessed.

### 🤝 Recycler Matching
- Retrieve recycler matches from the backend API.
- Match recyclers according to accepted material types.
- Calculate consistent recycler offers using material values, recycler ratings, and matching scores.
- Display recycler information and offer details.

### 🔄 Offline Collection Synchronization
- Support saving collection data for offline use.
- Synchronize queued collections with the backend when connectivity returns.
- Remove successfully synchronized entries from the offline queue.
- Retain failed entries for retry instead of discarding them.

### 🔐 Authentication and Security
- Use JSON Web Tokens (JWT) for authentication.
- Require a configured `JWT_SECRET` instead of relying on a hardcoded fallback.
- Protect lot creation, status updates, deletion, and transaction mutations with authentication middleware.
- Generate SHA-256 hashes for traceability data.

### 📊 Analytics and Reporting
- Calculate municipality summary metrics from database records.
- Generate monthly collection and earnings trends from available dated records.
- Calculate collector-level earnings, weights, and transaction statistics from stored data.
- Present material breakdowns and environmental-impact indicators.

*Note: Some platform-wide impact and geographic-zone values may still be demonstration data.*

### 🔎 Traceability
- Maintain traceability events associated with collection lots.
- Track important stages of the collection and transaction lifecycle.
- Provide lot and transaction information through backend endpoints.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| State management | Zustand |
| API communication | Axios |
| Backend | Node.js, Express.js |
| Database | SQLite using sql.js |
| Authentication | JSON Web Token (JWT), bcrypt |
| Offline storage | IndexedDB |
| Charts and analytics | Recharts |
| Maps | Leaflet |
| Image recognition | TensorFlow.js, COCO-SSD, MobileNet |
| Other utilities | QR generation, jsPDF, Web Speech API |

## 📁 Project Structure

```text
ECOLOOP/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── hooks/
│   │   │   └── useOfflineSync.js
│   │   ├── pages/
│   │   │   └── RecyclerMatch.jsx
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── db/
│   │   └── setup.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── lots.js
│   │   ├── prices.js
│   │   ├── recyclers.js
│   │   └── transactions.js
│   ├── utils/
│   │   └── fairValue.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*The tree highlights the main files involved in the project improvements; additional files and directories may exist.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- A terminal or code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your actual GitHub repository URL and project folder name.

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create or update `server/.env` with the environment variables required by your server.

At minimum, configure a strong JWT secret:

```env
JWT_SECRET=replace_with_a_long_random_secret
```

If your server requires other environment variables, retain those as well.

**Important:** Never commit your real `.env` file or expose your JWT secret publicly.

### 4. Start the backend

From the `server` directory, run:

```bash
npm start
```

If the project does not define a `start` script, use the development command specified in `server/package.json`.

The API is expected to use the default address:

```text
http://localhost:5000/api
```

Change this address if your backend is configured to run elsewhere.

### 5. Configure the frontend

Open a second terminal and navigate to the client directory:

```bash
cd client
npm install
```

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

The project also includes `client/.env.example` as a template.

### 6. Start the frontend

From the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser, commonly:

```text
http://localhost:5173
```

Keep both the backend and frontend terminals running during development.

## 🔌 API Overview

The backend exposes REST API endpoints for the platform's core functionality.

| Endpoint | Purpose |
|---|---|
| `GET /api/lots` | Retrieve collection lots |
| `GET /api/lots/:id` | Retrieve a lot and its traceability events |
| `POST /api/lots` | Create a collection lot; authentication required |
| `PUT /api/lots/:id/status` | Update lot status; authentication required |
| `DELETE /api/lots/:id` | Delete a lot; authentication required |
| `GET /api/recyclers` | Retrieve recycler listings |
| `GET /api/prices` | Retrieve material prices |
| `GET /api/prices/:materialType` | Retrieve a material's price |
| `GET /api/prices/history/:materialType` | Retrieve stored price history |
| `POST /api/prices/estimate` | Estimate the value of a collection |
| `POST /api/transactions` | Create a transaction; authentication required |
| `PUT /api/transactions/:id` | Update transaction payment status; authentication required |
| `GET /api/analytics/municipality` | Retrieve municipality analytics |
| `GET /api/analytics/collector/:id` | Retrieve collector analytics |
| `GET /api/analytics/impact` | Retrieve platform impact indicators |

Protected endpoints require a valid JWT in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Refer to the route files under `server/routes/` for request formats and response details.

## 🗄️ Database

ECOLOOP uses SQLite through `sql.js`.

The database setup includes tables for core platform entities, including:

- Users and collectors
- Recyclers
- Collection lots
- Transactions
- Material prices
- Traceability events
- Material price history

The database setup also seeds initial material prices and recycler records for demonstration purposes.

The material price history endpoint records the current price for the requested material and date if a record does not already exist. It does not fabricate 30 days of historical prices.

## 🔒 Security Notes

- Keep environment variables and credentials out of source control.
- Use a strong, private `JWT_SECRET`.
- Protected routes reject requests without valid authentication.
- Validate collection data before inserting it into the database.
- Review user permissions and ownership checks before deploying publicly.
- Use HTTPS and appropriate production configuration for deployment.

## 🧪 Testing and Verification

Before demonstrating or deploying the project, verify:

1. The backend starts successfully.
2. The frontend builds successfully.
3. Login and JWT authentication work with the configured secret.
4. Invalid collection payloads are rejected.
5. Authenticated lot and transaction operations work.
6. Recycler matching returns backend data.
7. Offline collections synchronize and failed items remain queued.
8. Price history and analytics endpoints return valid responses.
9. The application works without exposing credentials or secrets.

Run the available project test and build scripts defined in the respective `package.json` files.

## 📈 Development Improvements

The project has been improved through 13 meaningful Git commits:

1. `chore: add project gitignore`
2. `refactor: centralize frontend API configuration`
3. `fix: generate secure traceability hashes`
4. `fix: make recycler offers deterministic`
5. `feat: connect recycler matching to backend`
6. `feat: implement offline collection synchronization`
7. `feat: add retry handling for offline sync`
8. `feat: calculate municipality analytics from database`
9. `feat: calculate collector analytics from database`
10. `feat: persist material price history`
11. `security: require configured JWT secret`
12. `security: protect lot and transaction mutations`
13. `feat: validate collection lot data`

These changes focus on backend integration, data consistency, offline reliability, database-backed calculations, security, and input validation.

## 🚀 Future Enhancements

Potential next improvements include:

- Automated backend and frontend tests
- Role-based authorization and resource ownership checks
- Persistent historical price collection on a scheduled basis
- Database-backed geographic and environmental-impact analytics
- Improved loading, empty, and error states
- Production deployment and monitoring
- API documentation with Swagger/OpenAPI

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit using clear, meaningful commit messages.
5. Submit a pull request.

## 📄 License

Add your chosen open-source license before distributing the project. Until a license is specified, all rights remain with the copyright holder.

---

**ECOLOOP — Making e-waste recycling more transparent, accessible, and accountable.**
