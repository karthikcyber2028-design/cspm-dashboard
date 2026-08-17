# CSPM Dashboard - Cloud Security Posture Management

A full-stack Cloud Security Posture Management (CSPM) platform for monitoring and securing AWS cloud infrastructure.

## Features

- **Security Dashboard** - Real-time security score, findings overview, compliance trends
- **AWS Resource Discovery** - Auto-discover EC2, S3, IAM, RDS, Security Groups
- **Misconfiguration Detection** - Public S3 buckets, open security groups, unencrypted resources, MFA disabled
- **Compliance Scoring** - CIS Benchmark & AWS Foundational Security Best Practices
- **Risk Assessment** - Severity-based risk scoring (Critical/High/Medium/Low)
- **Remediation Guidance** - Fix recommendations for each security finding
- **Alert System** - Real-time security alerts with filtering
- **Multi-Account Support** - Manage multiple AWS accounts from one dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL with Prisma ORM |
| Cloud | AWS SDK v3 |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
cspm-dashboard/
├── backend/              # Express + Prisma API
│   ├── prisma/           # Database schema
│   ├── src/
│   │   ├── config/       # Environment, database
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/       # Prisma client
│   │   ├── routes/       # API routes
│   │   └── services/     # AWS SDK integration
│   └── server.js         # Entry point
├── frontend/             # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (auth)
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client
│   │   └── utils/        # Helpers
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS account with read-only IAM user

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Configure your environment
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/cspm
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Railway (Backend + Database)

1. Create a new Railway project
2. Add a PostgreSQL database service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Add environment variables
6. Railway auto-deploys on push

### Vercel (Frontend)

1. Import repository on Vercel
2. Set root directory to `frontend`
3. Set `VITE_API_URL` to your Railway backend URL
4. Deploy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/aws/credentials | List AWS credentials |
| POST | /api/aws/credentials | Add AWS credential |
| DELETE | /api/aws/credentials/:id | Remove credential |
| POST | /api/scans/run | Start new scan |
| GET | /api/scans | List all scans |
| GET | /api/scans/:id | Get scan details |
| GET | /api/scans/:id/findings | Get scan findings |
| GET | /api/dashboard/overview | Dashboard overview |
| GET | /api/dashboard/resources | List resources |
| GET | /api/alerts | List alerts |
| PUT | /api/alerts/:id/read | Mark alert read |

## Security

- AWS credentials are encrypted at rest
- Read-only IAM permissions required
- JWT authentication for all API endpoints
- Rate limiting enabled
- CORS configured for frontend origin

## License

MIT
