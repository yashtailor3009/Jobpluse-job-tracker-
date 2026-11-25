# Job Tracker & Career Analytics Dashboard ⭐⭐⭐⭐⭐

A full-stack, production-grade application designed for job seekers and career professionals to manage job applications, schedule interview rounds, store resumes and cover letters, set deadline reminders, and monitor conversion metrics through analytics.

---

## 🌟 Key Features

### 🖥️ Modern React Dashboard
- **Responsive glassmorphic UI** built with React 18, Vite, and Tailwind CSS.
- **Dual Pipeline Views**:
  - **Kanban Board**: Drag/click cards across status stages (`Applied` → `Assessment` → `Interview` → `Offer` / `Rejected`).
  - **Interactive Data Table**: Sortable columns, search bar, and inline stage transitions.
- **Search & Multi-Filters**: Instant filtering by keywords (company, title, location), status, priority, and work type (Remote, Hybrid, Onsite).
- **Application Deadline Reminders**: Automated visual badges and notifications for closing deadlines (Overdue, Today, Urgent, Upcoming).
- **Interview Scheduler**: Track rounds (Screening, Technical, System Design, Behavioral, Final) with date/time, interviewer details, meeting links, and prep notes.
- **Resume & Cover Letter Upload**: Attach versioned resumes and tailored cover letters to applications with one-click download/preview.

### 📊 Career Analytics & Conversion Funnel
- **Applications Per Month**: Area chart tracking monthly application volume.
- **Status Distribution**: Donut chart visualizing active stages.
- **Pipeline Conversion Funnel**: Stage-by-stage conversion metrics (Applied → Assessment → Interview → Offer).
- **Top Companies Applied To**: Horizontal bar chart of target employers.
- **Core KPIs**:
  - **Interview Conversion Rate %**
  - **Offer Rate %**
  - **Rejection Rate %**
  - **Active Pipeline Count**

### 🔒 Enterprise Security & Backend
- **Spring Boot 3.3 REST API** with Java.
- **Stateless JWT Authentication** with BCrypt password hashing.
- **Multi-Tenant User Isolation**: Every application, interview, document, and analytic metric is strictly isolated to the authenticated user.
- **Interactive OpenAPI / Swagger Documentation**: Available at `/swagger-ui.html`.
- **MySQL 8.0 & H2 Dual Profiles**:
  - Production / Docker profile (`mysql`): Connects to MySQL with persistent volume and schema DDL.
  - Zero-setup development profile (`local`): Boots with in-memory H2 database and sample demo data automatically.

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for Full Stack)
Run the entire stack (MySQL 8 + Spring Boot + React + Nginx) with a single command:

```bash
docker compose up --build
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option 2: Local Development

#### 1. Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
*(By default in `local` profile, the app uses H2 in-memory DB and pre-seeds realistic demo data so you can test immediately without any MySQL setup!)*

#### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-seeded Demo Credentials

To test the application immediately with realistic data:
- **Email**: `demo@jobtracker.com`
- **Password**: `password123`
*(Or click the **Quick Demo Login** button on the sign-in page!)*

---

## 🔌 REST API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated profile |

### Job Applications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/applications` | List applications (with search & filters) |
| `POST` | `/api/applications` | Create new application |
| `GET` | `/api/applications/{id}` | Get application details |
| `PUT` | `/api/applications/{id}` | Update application |
| `PATCH`| `/api/applications/{id}/status` | Update stage (`APPLIED` → `ASSESSMENT` → `INTERVIEW` → `OFFER`/`REJECTED`) |
| `DELETE`| `/api/applications/{id}` | Delete application |

### Interviews & Schedule
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/interviews` | List all scheduled interviews |
| `GET` | `/api/interviews/upcoming`| List future interview rounds |
| `POST` | `/api/interviews` | Schedule an interview round |
| `PUT` | `/api/interviews/{id}` | Update round notes, time, outcome |
| `DELETE`| `/api/interviews/{id}` | Delete interview |

### Documents & Attachments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/applications/{id}/documents` | Upload resume or cover letter (`multipart/form-data`) |
| `GET` | `/api/applications/{id}/documents` | List attached documents |
| `GET` | `/api/documents/{id}/download` | Download attachment file |
| `DELETE`| `/api/documents/{id}` | Remove document |

### Career Analytics & Reminders
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/summary` | Overall KPIs (interview rate, offer rate, rejection rate) |
| `GET` | `/api/analytics/monthly` | Application volume per month |
| `GET` | `/api/analytics/status-breakdown` | Applications count per stage |
| `GET` | `/api/analytics/top-companies` | Most applied-to companies |
| `GET` | `/api/reminders/deadlines` | Upcoming and overdue deadline alerts |

---

## 📂 Project Directory Structure

```
job-tracker/
├── backend/
│   ├── src/main/java/com/jobtracker/
│   │   ├── config/             # Security, CORS, Swagger, DataInitializer
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/                # Request & Response DTOs
│   │   ├── entity/             # JPA Entities (User, JobApplication, Interview, Document)
│   │   ├── exception/          # Global exception handler & error DTOs
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Token Provider & Auth Filter
│   │   └── service/            # Core Services & File Storage
│   ├── src/main/resources/
│   │   ├── application.yml     # Base configuration
│   │   ├── application-local.yml # H2 profile
│   │   ├── application-mysql.yml # MySQL profile
│   │   └── schema.sql          # MySQL DDL
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API client
│   │   ├── components/         # Navbar, Sidebar, Modals, Badges
│   │   ├── context/            # JWT Auth Context
│   │   ├── pages/              # Dashboard, Applications, Interviews, Analytics, Deadlines, Auth
│   │   ├── App.jsx             # React Router setup
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml          # MySQL + Backend + Frontend
├── run-local.sh                # Local launcher script
└── README.md
```
