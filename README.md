# ⚡ JobPulse PRO — AI Job Tracker & Career Analytics Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot 3.3" />
  <img src="https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <strong>An AI-powered, full-stack career operating system designed to automate your entire job search workflow — featuring cross-platform 1-click clipping (LinkedIn/Indeed), recruiter email ingestion (Google Meet/Zoom links), AI Resume ATS matching, multi-round interview prep copilot, and 2-minute OTP security.</strong>
</p>

<p align="center">
  <a href="#-live-demo--github-pages">Live Demo</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-1-click-chrome-extension">Chrome Extension</a> •
  <a href="#-email-automation-engine">Email Ingestion</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-github-pages-deployment">GitHub Pages Deploy</a>
</p>

---

## 🌐 Live Demo & GitHub Pages

* **Live Frontend on GitHub Pages**: `https://<YOUR-GITHUB-USERNAME>.github.io/<YOUR-REPO-NAME>/`
* **Zero-Setup Standalone Mode**: The frontend includes a built-in Offline Mock & LocalStorage Engine, enabling 100% of the UI, Kanban pipeline, AI tools, and analytics to run directly in the browser on GitHub Pages without requiring a cloud backend server!

---

### 📊 Career Analytics Dashboard


## 🌟 Key Features

### 1. 🧩 1-Click Cross-Platform Chrome Extension (`extension/`)
- **Auto-Clipper for Job Boards**: Works seamlessly on **LinkedIn**, **Indeed**, **Greenhouse**, **Lever**, and **Naukri**.
- **Floating Action Badge**: Automatically injects a glowing `✨ Save to JobPulse` badge on any job description page.
- **Zero Manual Typing**: Scrapes Job Title, Company, Location, Salary Range, and Job URL, then transmits them directly into your database pipeline with 1 click.
- **Toolbar Quick-Clip Popup**: Clip any open tab or jump to your dashboard from the Chrome toolbar.

### 2. ⚡ Automated Recruiter Email Ingestion Engine (`/email-sync`)
- **Video Call Meeting Extraction**: Automatically parses recruiter emails and detects **Google Meet** (`meet.google.com`), **Zoom** (`zoom.us`), **MS Teams**, and **Webex** invite links.
- **Automatic Interview Booking**: Detects round types (HR, Technical, System Design, Behavioral), schedules interview rounds, and transitions stages in your Kanban pipeline.
- **Job Offer & Salary Detection**: Detects formal offer letters, extracts compensation figures (e.g. `$185,000`, `₹24 LPA`), and upgrades application status to `OFFER`.
- **OA Deadline Alerts**: Flags HackerRank / Codility take-home test deadlines (e.g. 48 hours) and feeds them into the urgency countdown tracker.
- **Interactive Recruiter Simulator**: Test live email ingestion in 1-click using built-in presets (Google Meet Screen, Datadog $185k Offer, Amazon 48h OA).

### 3. 🤖 AI Resume ATS Scanner & Keyword Matcher (`/resume-scanner`)
- **Client-Side NLP ATS Engine**: Compares your resume against any target job description.
- **Instant Match Score (0–100%)**: Visual gauge rating ATS compatibility.
- **Missing Keyword Detection**: Identifies critical technical skills, libraries, and frameworks present in the job posting but missing from your resume.
- **Actionable Bullet Point Suggestions**: Real-time recommendations to improve readability and keyword density.

### 4. 🧠 AI Interview Prep Copilot (`/interview-copilot`)
- **Multi-Round Question Generator**: Tailored questions for HR Screening, Coding/Algorithms, System Design, and Behavioral rounds.
- **STAR Method Simulator**: Interactive answer grader evaluating Situation, Task, Action, and Result structure with actionable improvement feedback.
- **Reverse Interview Question Bank**: Generates strategic, role-specific questions for candidates to ask interviewers.

### 5. 📅 1-Click Calendar Sync (Google Calendar + .ics)
- **Google Calendar Direct Sync**: Generates one-click calendar events with company name, round title, notes, and direct Google Meet / Zoom meeting links pre-filled.
- **RFC-5545 `.ics` Export**: Compatible with Apple Calendar, Microsoft Outlook, and mobile calendar apps.

### 6. 🔐 Bank-Grade Email OTP Security (2-Minute Expiry)
- **Zero On-Screen Code Leaks**: OTP codes are strictly dispatched via email and never exposed on-screen or in JSON API responses.
- **Strict 2-Minute Expiry**: Enforced by backend database timestamps and animated frontend countdown clock (`02:00` down to `00:00`).
- **Real SMTP Integration**: Built with `spring-boot-starter-mail` (JavaMailSender) for delivery to Gmail, Outlook, and corporate inboxes.
- **Brute-Force Rate Limiting**: Code permanently invalidates after 5 incorrect attempts.
- **Dev Mailbox Inspector**: In-app email preview drawer for testing during local development.

### 7. 📊 Career Analytics & Conversion Funnel (`/analytics`)
- **Conversion Metrics**: Real-time KPI cards for Interview Rate %, Offer Rate %, and Rejection Rate %.
- **Visual Funnel Breakdown**: Interactive charts tracking monthly application volume, stage distribution, and top target employers powered by Recharts.
- **Deadline Reminders**: Highlighting Overdue, Urgent, and Upcoming deadlines with smart urgency color coding.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide Icons, Recharts, React Router 6 (HashRouter) |
| **Backend** | Spring Boot 3.3.4, Java 17, Spring Security 6, JWT, Spring Data JPA, Spring Mail |
| **Database** | MySQL 8.0 (Production / Docker) & H2 In-Memory (Zero-Setup Local Profile) |
| **Extension**| Chrome Extension Manifest V3 (Vanilla JS, CSS3, Chrome Storage & Tabs APIs) |
| **DevOps & CI/CD**| GitHub Actions (`.github/workflows/deploy.yml`), Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start Guide

### Option 1: Run Full-Stack Locally (Without Docker)

#### 1. Backend (Spring Boot):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
> Boots on `http://localhost:8080`. Automatically pre-seeds demo data into in-memory H2 database.

#### 2. Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
> Opens on `http://localhost:5173`.

#### 3. Pre-seeded Demo Account:
* **Email**: `demo@jobtracker.com`
* **Password**: `password123`
*(Or click the **Demo Login** button on the sign-in page!)*

---

### Option 2: Run with Docker Compose

Run the entire stack (MySQL 8 + Spring Boot API + React + Nginx) with a single command:

```bash
docker compose up --build
```

* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8080/api`
* **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

---

## 🧩 Installing the Chrome Extension

1. Open **Google Chrome** and navigate to: `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner).
3. Click **Load unpacked** (button in top-left corner).
4. Select the `extension/` folder in this repository:
   ```text
   /path/to/job-tracker/extension
   ```
5. Pin the **JobPulse ⚡** extension to your toolbar.
6. Open any job posting on **LinkedIn**, **Indeed**, or **Greenhouse** — click the floating **"✨ Save to JobPulse"** button!

---

## 📬 Configuring Real Gmail for OTP Sending

To send real OTP verification emails to `@gmail.com` inboxes, add your Gmail sender email and Google 16-digit App Password to `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_email@gmail.com
    password: abcd efgh ijkl mnop   # 16-digit App Password from myaccount.google.com/apppasswords
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

---

## 🚢 Deploying Frontend to GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose: **GitHub Actions**.
4. GitHub Actions will automatically build and deploy your site in ~60 seconds to:
   ```text
   https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
   ```

---

## 📂 Project Directory Structure

```text
job-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── backend/
│   ├── src/main/java/com/jobtracker/
│   │   ├── config/             # Security, CORS, Swagger, DataInitializer
│   │   ├── controller/         # Auth, Applications, Interviews, EmailSync, Analytics
│   │   ├── dto/                # Request & Response Data Transfer Objects
│   │   ├── entity/             # JPA Entities (User, JobApplication, Interview, Document)
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Token Provider, Auth Filter & Principal
│   │   └── service/            # Core Services, EmailService, EmailIngestionService
│   ├── src/main/resources/
│   │   ├── application.yml     # Base configuration & SMTP
│   │   ├── application-local.yml # H2 in-memory dev profile
│   │   └── application-mysql.yml # MySQL production profile
│   ├── Dockerfile
│   └── pom.xml
├── extension/                  # 1-Click Chrome Extension (Manifest V3)
│   ├── manifest.json           # Extension permissions & content script definitions
│   ├── content.js              # Injected clipper on LinkedIn, Indeed, Greenhouse, etc.
│   ├── popup.html & popup.js   # Toolbar quick-save popup
│   └── styles.css              # Floating badge & toast notification styling
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/client.js       # Axios client with built-in offline mock fallback
│   │   ├── components/         # Navbar, Sidebar, Modals, Badges
│   │   ├── context/            # AuthContext (JWT + Session State)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Overview & Pipeline status
│   │   │   ├── ApplicationsList.jsx    # Kanban & Sortable Table views
│   │   │   ├── Interviews.jsx          # Rounds schedule & Calendar Sync
│   │   │   ├── Analytics.jsx           # Charts & Conversion KPIs
│   │   │   ├── Deadlines.jsx           # Application deadline tracker
│   │   │   ├── EmailSyncHub.jsx        # Inbound email feeds & simulator
│   │   │   ├── AiResumeScanner.jsx     # ATS resume matcher
│   │   │   ├── InterviewPrepCopilot.jsx# STAR simulator & question generator
│   │   │   ├── Login.jsx & Register.jsx# 2-step registration & OTP flow
│   │   ├── utils/calendar.js   # Google Calendar URL & .ics generator
│   │   └── main.jsx            # HashRouter entry point
│   ├── public/404.html         # GitHub Pages SPA redirect fallback
│   ├── vite.config.js          # Vite config with relative base path (./)
│   ├── Dockerfile & nginx.conf
│   └── package.json
├── docker-compose.yml          # Production stack orchestration
├── run-local.sh                # Local one-click runner script
├── .gitignore
└── README.md
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
