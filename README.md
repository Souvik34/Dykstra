# Dykstra

> **AI-powered technical interview preparation — practice DSA, revise intelligently, track your growth, and experience realistic technical interviews.**

Dykstra is a full-stack technical interview preparation platform designed to move beyond the traditional **"solve problems and count solved questions"** approach.

It combines:

**DSA Practice → Code Execution → Progress Tracking → Adaptive Revision → Confidence Analysis → AI Mentorship → Interview Simulation**

The platform is built with a modern React/TanStack frontend, an Express backend, PostgreSQL, Redis, BullMQ, Socket.IO, AI services, and isolated code-execution infrastructure.

---

## Table of Contents

### Product

- [Overview](#overview)
- [Why Dykstra](#why-dykstra)
- [Core Features](#core-features)
- [Platform Workflow](#platform-workflow)

### Engineering

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Layer](#data-layer)
- [Caching and Background Processing](#caching-and-background-processing)
- [AI Architecture](#ai-architecture)
- [DSA Problem Solving](#dsa-problem-solving)
- [Revision System](#revision-system)
- [Confidence Scoring](#confidence-scoring)
- [AI Mentor](#ai-mentor)
- [Technical Interview Engine](#technical-interview-engine)
- [Real-Time Communication](#real-time-communication)
- [Code Execution](#code-execution)
- [Authentication](#authentication)
- [Security](#security)

### Infrastructure

- [Performance and Scalability](#performance-and-scalability)
- [Production Architecture](#production-architecture)
- [Environment Configuration](#environment-configuration)

### Project

- [Project Structure](#project-structure)
- [API Architecture](#api-architecture)
- [Engineering Decisions](#engineering-decisions)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Author](#author)

---

# Product

## Overview

Technical interview preparation is often fragmented across multiple tools:

| Need | Typical Approach |
|---|---|
| DSA practice | Coding platforms |
| Revision | Manual notes / spreadsheets |
| Progress tracking | Separate trackers |
| Weak-topic identification | Manual analysis |
| Interview practice | Mock interviews |
| Personalized guidance | Separate AI tools |

Dykstra brings these workflows together.

The platform treats every problem attempt as a source of preparation data rather than simply marking it as **Solved**.

A problem can influence:

- revision scheduling,
- topic strength,
- difficulty exposure,
- confidence,
- mentor recommendations,
- recent activity,
- and future interview preparation.

### The Core Idea

> **Interview preparation should be an adaptive feedback loop, not a list of solved problems.**

```text
┌───────────────┐
│   Practice    │
└───────┬───────┘
        ↓
┌───────────────┐
│    Evaluate   │
└───────┬───────┘
        ↓
┌───────────────┐
│    Track      │
└───────┬───────┘
        ↓
┌───────────────┐
│    Revise     │
└───────┬───────┘
        ↓
┌───────────────┐
│ Find Weakness │
└───────┬───────┘
        ↓
┌───────────────┐
│   Recommend   │
└───────┬───────┘
        ↓
┌───────────────┐
│    Practice   │
└───────┬───────┘
        ↓
┌───────────────┐
│   Interview   │
└───────┬───────┘
        ↓
     Improve
```

---

## Why Dykstra?

Traditional problem trackers primarily answer:

> **"How many problems have I solved?"**

Dykstra is designed to answer more useful questions:

- **What should I revise today?**
- **Which topics are currently weak?**
- **How recently have I practiced a concept?**
- **Am I improving on a topic?**
- **How confidently am I solving problems?**
- **Which problems should I practice next?**
- **Am I ready to apply these skills in an interview?**
- **How do I perform when solving under interview-style conditions?**

This creates a system based on:

```text
Tracking
   +
Adaptation
   +
Revision
   +
Interview Simulation
```

rather than treating each feature as an isolated tool.

---

# Core Features

## 1. DSA Problem Practice

A structured problem-solving environment where users can:

- Browse coding problems
- Filter and organize problems
- Read detailed problem statements
- Write solutions
- Execute code
- Track solved status
- Review previous activity
- Build a long-term preparation history

### Coding Experience

Dykstra uses the **Monaco Editor** to provide a development-environment-style coding experience directly inside the platform.

---

## 2. Isolated Code Execution

Dykstra separates user-submitted code execution from the main application server.

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       ↓
┌──────────────┐
│ Monaco Editor│
└──────┬───────┘
       ↓
┌──────────────┐
│ Dykstra API  │
└──────┬───────┘
       ↓
┌──────────────┐
│    Judge0    │
└──────┬───────┘
       ↓
┌──────────────┐
│    Docker    │
└──────┬───────┘
       ↓
┌──────────────┐
│Execution Data│
└──────┬───────┘
       ↓
    Frontend
```

This separation is important because arbitrary user code has fundamentally different security and resource requirements from normal web requests.

---

## 3. Adaptive Revision

Dykstra uses spaced revision intervals to bring previously solved problems back into the user's preparation workflow.

### Current Revision Intervals

| Stage | Interval |
|---:|---:|
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 8 days |
| 5 | 16 days |
| 6 | 30 days |

The goal is simple:

> **Do not let "Solved" become "Forgotten."**

---

## 4. AI Mentor

The AI Mentor analyzes preparation data and identifies areas that need attention.

It considers signals such as:

- Solved problems
- Topic exposure
- Recency
- Difficulty
- Preparation strength
- Current focus areas

The mentor can then produce:

- A focus topic
- Recommended problems
- Personalized preparation advice
- Next-step guidance

---

## 5. Dashboard and Analytics

The dashboard turns raw activity into actionable preparation information.

### Dashboard Areas

| Area | Purpose |
|---|---|
| Problem Progress | Track overall problem-solving activity |
| Topic Distribution | Understand topic exposure |
| Difficulty Distribution | See Easy / Medium / Hard balance |
| Recent Activity | Monitor recent preparation |
| Revision | Identify problems due for revision |
| AI Mentor | Surface personalized recommendations |
| Confidence | Track solving confidence |

---

## 6. Technical Interview Simulation

Dykstra includes an interview workflow designed around the stages of a technical interview.

### Interview Lifecycle

```text
UNDERSTANDING
      ↓
APPROACH
      ↓
CODING
      ↓
DEBUGGING
      ↓
OPTIMIZATION
      ↓
FINISHED
```

The goal is to simulate more than just coding.

Candidates are expected to:

1. Understand the problem
2. Explain an approach
3. Implement the solution
4. Debug when necessary
5. Analyze and optimize
6. Complete the interview

---

## 7. Real-Time Interview Interaction

The interview experience uses **Socket.IO** for real-time communication.

This allows the frontend and backend to exchange interview events without continuous polling.

### Idle Interview Flow

```text
Candidate becomes inactive
          ↓
Backend tracks inactivity
          ↓
Idle threshold reached
          ↓
"interview-idle" event
          ↓
Frontend displays prompt
          ↓
Candidate continues working
          ↓
Interview resumes
```

---

## 8. Confidence Tracking

Dykstra tracks a confidence score associated with problem-solving performance.

The score considers:

- Problem difficulty
- Expected solving time
- Actual solving time
- Performance relative to the expected threshold

The result can:

```text
Increase
   ↓
Stay the same
   ↓
Decrease
```

This creates a more meaningful signal than simply:

```text
Solved = true
```

---

# Platform Workflow

The complete preparation loop connects the major Dykstra systems.

```text
                         ┌──────────────┐
                         │  Dashboard   │
                         └──────┬───────┘
                                │
                         Identify focus
                                │
                                ▼
                         ┌──────────────┐
                         │  AI Mentor   │
                         └──────┬───────┘
                                │
                           Recommendations
                                │
                                ▼
                         ┌──────────────┐
                         │ Solve Problem│
                         └──────┬───────┘
                                │
                        Execute + Evaluate
                                │
                                ▼
                   ┌────────────────────────┐
                   │ Progress + Confidence  │
                   └───────────┬────────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │    Revision  │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Interview  │
                       └──────┬───────┘
                              │
                              ▼
                        Improve Weakness
                              │
                              └─────────────► Practice Again
```

---

# Engineering

# System Architecture

Dykstra follows a layered full-stack architecture with separate responsibilities for the client, API, persistent storage, caching, background processing, AI, and code execution.

```text
┌─────────────────────────────────────────────────────────┐
│                         CLIENT                          │
│                                                         │
│ React 19 │ TanStack Start │ TanStack Router │ TypeScript│
│ React Query │ Zustand │ Tailwind │ Monaco │ Socket.IO   │
└────────────────────────────┬────────────────────────────┘
                             │
                    HTTPS / REST / WebSocket
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                         SERVER                          │
│                                                         │
│                     Express 5 / Node.js                 │
│                                                         │
│ Authentication │ Controllers │ Services │ Repositories │
│ AI │ Problems │ Revision │ Mentor │ Interviews │ APIs  │
└───────────────┬───────────────────┬─────────────────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌────────────────┐
       │   PostgreSQL   │   │     Redis      │
       │                │   │                │
       │ Persistent     │   │ Cache          │
       │ application    │   │ Queue backend  │
       │ state          │   │ Coordination   │
       └────────────────┘   └───────┬────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │    BullMQ    │
                             │    Workers   │
                             └──────┬───────┘
                                    │
                                    ▼
                             Background Jobs


┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL / ISOLATED SERVICES            │
│                                                         │
│       AI Providers │ Google OAuth │ Judge0 │ Docker      │
└─────────────────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TanStack Start** | React application framework |
| **TanStack Router** | Type-safe routing |
| **TanStack Query** | Server-state management |
| **TypeScript** | Static typing |
| **Vite** | Build and development tooling |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible UI primitives |
| **Monaco Editor** | Code editing |
| **Zustand** | Client-side state |
| **Axios** | HTTP communication |
| **Socket.IO Client** | Real-time communication |
| **Recharts** | Data visualization |
| **Framer Motion** | UI animation |
| **React Hook Form** | Form management |
| **Zod** | Runtime validation |
| **Sonner** | Toast notifications |

## Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | HTTP API framework |
| **PostgreSQL** | Primary relational database |
| **pg** | PostgreSQL client |
| **Redis** | Cache and queue coordination |
| **BullMQ** | Background job processing |
| **Socket.IO** | Real-time communication |
| **JWT** | Token-based authentication |
| **Passport** | Authentication middleware |
| **Google OAuth 2.0** | Social authentication |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email functionality |
| **Axios** | External API communication |
| **Zod** | Runtime validation |
| **express-rate-limit** | API rate limiting |
| **dotenv** | Environment configuration |

## AI

The backend currently includes integrations for:

| Provider / SDK | Role |
|---|---|
| Google GenAI | AI capabilities |
| Google Generative AI | Generative AI integration |
| OpenAI | AI capabilities |

AI functionality is used as part of recommendation, mentor, and interview-related workflows.

## Code Execution

| Technology | Role |
|---|---|
| **Judge0** | Code execution platform |
| **Docker** | Execution isolation |

---

# Frontend Architecture

The frontend is built around a component-driven React architecture.

### State and Data Flow

```text
                     Frontend
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   React Query       Zustand         Component State
        │               │
        │               │
        ▼               ▼
    Server State     Client State
        │
        ▼
      Axios
        │
        ▼
   Express API
```

### Main Frontend Responsibilities

- UI rendering
- Client-side routing
- Server-state management
- Authentication state
- Problem-solving interface
- Monaco code editor
- Dashboard visualizations
- Revision interface
- AI Mentor interface
- Interview interface
- Real-time Socket.IO events

---

# Backend Architecture

The backend acts as the central application layer.

### Responsibilities

- Authentication
- User management
- Problem management
- Problem-solving workflows
- Progress tracking
- Revision scheduling
- Dashboard aggregation
- AI Mentor functionality
- Interview management
- Code execution orchestration
- Real-time communication
- Caching
- Background processing
- External service integration

### Request Lifecycle

```text
┌───────────────┐
│ HTTP Request  │
└───────┬───────┘
        ↓
┌───────────────┐
│ Express       │
└───────┬───────┘
        ↓
┌───────────────┐
│ Middleware    │
│ Auth / CORS   │
│ Validation    │
└───────┬───────┘
        ↓
┌───────────────┐
│ Controller    │
└───────┬───────┘
        ↓
┌───────────────┐
│ Service       │
│ Business Logic│
└───────┬───────┘
        ↓
┌──────────────────────────┐
│ Repository / Integration │
└───────┬──────────────────┘
        ↓
┌──────────────────────────┐
│ PostgreSQL / Redis / AI  │
│ / External Services      │
└───────────┬──────────────┘
            ↓
        Response
```

This separation keeps transport-level concerns separate from business logic and persistence.

---

# Data Layer

## PostgreSQL

PostgreSQL is the primary persistent data store.

It is responsible for durable application state such as:

- Users
- Problems
- Solved problems
- Revision records
- Progress
- Mentor-related state
- Interview information
- Other application records

### Why PostgreSQL?

Dykstra contains strongly relational data and relationships between users, problems, attempts, revision records, and preparation state.

PostgreSQL provides:

- Relational integrity
- Transactions
- Indexing
- Structured querying
- Mature production tooling

---

## Redis

Redis is used for fast-access and coordination workloads.

### Current Responsibilities

- Caching
- Temporary application state
- BullMQ coordination
- Reducing repeated expensive operations
- Dashboard / Mentor related caching

### Cache Pattern

```text
                Request
                   │
                   ▼
             ┌───────────┐
             │   Redis   │
             └─────┬─────┘
                   │
             ┌─────┴─────┐
             │           │
          Cache Hit   Cache Miss
             │           │
             ▼           ▼
          Return     Compute / Fetch
                         │
                         ▼
                    Store Cache
                         │
                         ▼
                       Return
```

Redis is not treated as the source of truth for persistent application data.

---

# Caching and Background Processing

## BullMQ

Dykstra uses **BullMQ** with Redis to move suitable work away from the synchronous HTTP request path.

### Background Job Flow

```text
┌──────────────┐
│     API      │
└──────┬───────┘
       │
       │ Create Job
       ▼
┌──────────────┐
│    BullMQ    │
└──────┬───────┘
       │
       │ Redis
       ▼
┌──────────────┐
│    Worker    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Service   │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ DB / External APIs │
└────────────────────┘
```

This architecture allows asynchronous operations to be processed independently from normal API traffic.

---

# AI Architecture

Dykstra uses AI as part of the product workflow rather than as a standalone chatbot.

The AI layer receives structured context generated from application data.

```text
┌──────────────────────┐
│   User Activity      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Preparation Data     │
│                      │
│ Topic                │
│ Difficulty           │
│ Recency              │
│ Solved History       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Recommendation       │
│ Context              │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│      AI Model        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Mentor / Interview   │
│ Recommendation       │
└──────────────────────┘
```

This approach keeps important selection logic deterministic while using AI for contextual reasoning and natural-language generation.

---

# DSA Problem Solving

The problem-solving system connects the problem catalogue, editor, execution environment, and progress tracker.

### Solve Flow

```text
Select Problem
      ↓
Read Problem
      ↓
Write Solution
      ↓
Execute Code
      ↓
Receive Result
      ↓
Solved / Failed
      ↓
Record Performance
      ↓
Update Progress
      ↓
Update Confidence
      ↓
Schedule Revision
```

The code execution result is therefore only one part of the overall learning workflow.

---

# Revision System

Dykstra uses spaced revision to repeatedly expose candidates to previously solved problems.

### Current Schedule

```text
1 Day
  ↓
2 Days
  ↓
4 Days
  ↓
8 Days
  ↓
16 Days
  ↓
30 Days
```

### Goal

The system is designed to address a common problem in DSA preparation:

> **Understanding a solution today does not guarantee remembering the pattern later.**

Revision therefore becomes part of the product's core learning loop.

---

# Confidence Scoring

Dykstra calculates a confidence score from problem-solving performance.

## Expected Solving Time

| Difficulty | Expected Time |
|---|---:|
| Easy | 15 minutes |
| Medium | 30 minutes |
| Hard | 45 minutes |

## Scoring Model

The score starts at:

```text
100
```

A penalty may be applied when:

```text
Actual Time > Expected Time
```

The penalty is bounded.

A bonus may be applied when:

```text
Actual Time ≤ 40% of Expected Time
```

The final score is constrained to:

```text
0 ≤ Score ≤ 100
```

and rounded before being stored.

### Why Track Confidence?

Two candidates can both solve the same problem successfully:

```text
Candidate A
Solved in 12 minutes
        ↓
Higher confidence signal


Candidate B
Solved in 55 minutes
        ↓
Lower confidence signal
```

The binary result is identical.

The preparation signal is not.

---

# AI Mentor

The mentor system combines deterministic scoring with AI-generated guidance.

## Topic Scoring

The current topic scoring model is:

```text
Topic Score =
      Exposure × 0.40
    + Recency  × 0.30
    + Difficulty × 0.30
```

## Recency Mapping

| Last Practice | Score |
|---|---:|
| Less than 7 days | 100 |
| Less than 30 days | 70 |
| Less than 90 days | 40 |
| 90+ days | 20 |

Lower topic scores can indicate areas that deserve more attention.

## Mentor Flow

```text
┌──────────────────────────┐
│    User Problem History  │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Topic Aggregation        │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Solved / Exposure        │
│ Recency / Difficulty     │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Topic Score              │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Focus Topic              │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Recommended Problems     │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ AI Mentor Recommendation │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Dashboard                │
└──────────────────────────┘
```

This hybrid architecture prevents the AI from being solely responsible for deciding what the user should practice.

---

# Technical Interview Engine

The interview experience is structured as a state machine.

## Interview Lifecycle

```text
┌────────────────┐
│ UNDERSTANDING  │
└───────┬────────┘
        ↓
┌────────────────┐
│    APPROACH    │
└───────┬────────┘
        ↓
┌────────────────┐
│     CODING     │
└───────┬────────┘
        ↓
┌────────────────┐
│    DEBUGGING   │
└───────┬────────┘
        ↓
┌────────────────┐
│  OPTIMIZATION  │
└───────┬────────┘
        ↓
┌────────────────┐
│    FINISHED    │
└────────────────┘
```

Each phase represents a different part of a real technical interview.

### Phase Objectives

| Phase | Objective |
|---|---|
| **Understanding** | Understand requirements and clarify the problem |
| **Approach** | Explain the proposed solution |
| **Coding** | Implement the solution |
| **Debugging** | Identify and resolve issues |
| **Optimization** | Analyze complexity and improve the solution |
| **Finished** | Complete the interview lifecycle |

This makes the interview experience more representative of a real technical discussion than a simple online judge.

---

# Real-Time Communication

Socket.IO provides real-time communication between the interview client and backend.

### Why WebSockets?

A normal REST request is ideal for:

```text
Request → Response
```

An interview session can require:

```text
Server → Client
Client → Server
Server → Client
Server → Client
...
```

Socket.IO allows the server to push events immediately.

### Idle Detection

The interview supports an inactivity flow.

```text
Candidate inactive
       ↓
Inactivity tracked
       ↓
Threshold reached
       ↓
"interview-idle"
       ↓
Idle prompt shown
       ↓
Candidate resumes work
       ↓
Interview continues
```

---

# Code Execution

Code execution is treated as a separate infrastructure boundary.

The main Dykstra application server should not directly execute arbitrary user programs.

### Execution Architecture

```text
┌──────────────┐
│ Dykstra API  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Code Execution       │
│ Request              │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Judge0                │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Docker Isolation      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Program Execution     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Execution Result      │
└──────────┬───────────┘
           ↓
        Dykstra
```

### Important Resource Boundaries

A production code execution environment should enforce:

- CPU limits
- Memory limits
- Execution timeouts
- Output-size limits
- Process restrictions
- Concurrency limits
- Controlled networking

This is critical because Dykstra accepts user-generated source code.

---

# Authentication

The backend includes multiple authentication mechanisms and supporting libraries.

### Authentication Stack

| Technology | Purpose |
|---|---|
| JWT | Token-based authentication |
| bcrypt | Password hashing |
| Passport | Authentication middleware |
| Google OAuth 2.0 | Social login |
| Express Session | Session support |
| Cookie Parser | Cookie handling |

Passwords should never be stored in plaintext.

User authentication protects personalized resources such as:

- Dashboard
- Solved problems
- Revision state
- Mentor state
- Interview sessions
- Progress data

---

# Security

Dykstra combines several security-sensitive systems:

```text
Authentication
      +
Public APIs
      +
AI API Keys
      +
User-generated Code
      +
Database
      +
Production Infrastructure
```

Security therefore needs to be considered at every layer.

## API Security

The backend includes:

- CORS configuration
- Rate limiting
- Authentication middleware
- Runtime validation
- Password hashing
- Token-based authentication

## Secret Management

Sensitive values belong in environment variables.

Examples:

| Secret Category |
|---|
| Database credentials |
| JWT secrets |
| AI API keys |
| OAuth credentials |
| Redis credentials |
| SMTP credentials |
| Judge0 configuration |

**No production secrets should be committed to Git.**

## Database Security

Production databases should not be unnecessarily exposed to the public internet.

```text
Internet
   │
   ▼
HTTPS
   │
   ▼
Application Server
   │
   ▼
Private Database Connection
   │
   ▼
PostgreSQL
```

## Code Execution Security

User code should remain isolated from the application host.

Resource boundaries should include:

- CPU
- Memory
- Time
- Output
- Processes
- Network access

---

# Infrastructure

# Performance and Scalability

Dykstra separates different workload types so that expensive operations do not unnecessarily block the primary API.

| Workload | Technology |
|---|---|
| Persistent data | PostgreSQL |
| Fast temporary data | Redis |
| Background processing | BullMQ |
| Real-time communication | Socket.IO |
| Code execution | Judge0 / Docker |
| AI workloads | AI providers |
| Frontend delivery | Vercel |

### Overall Strategy

```text
                         User
                          │
                          ▼
                     Frontend
                          │
                          ▼
                       API
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
      PostgreSQL        Redis         Socket.IO
                          │
                          ▼
                       BullMQ
                          │
                          ▼
                       Workers

              External / Isolated
                  ├── AI
                  └── Judge0
```

This separation provides a foundation for scaling individual components independently as usage grows.

---

# Production Architecture

Dykstra separates frontend hosting from backend infrastructure.

## Production Request Flow

```text
                         ┌─────────────┐
                         │   Internet  │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │ dykstra.in  │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │   Vercel    │
                         │  Frontend   │
                         └──────┬──────┘
                                │
                         HTTPS API Request
                                │
                                ▼
                         ┌───────────────┐
                         │ api.dykstra.in│
                         └──────┬────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │ AWS Backend │
                         └──────┬──────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        ┌───────────┐     ┌───────────┐    ┌────────────┐
        │ PostgreSQL│     │   Redis   │    │ Judge0 /   │
        │           │     │           │    │ Docker     │
        └───────────┘     └─────┬─────┘    └────────────┘
                                │
                                ▼
                           ┌─────────┐
                           │ BullMQ  │
                           │ Workers │
                           └─────────┘
```

---

# Production Infrastructure

| Component | Infrastructure |
|---|---|
| **Frontend** | Vercel |
| **Backend** | AWS |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Background Jobs** | BullMQ |
| **Code Execution** | Judge0 / Docker |
| **Domain** | `dykstra.in` |
| **API** | `api.dykstra.in` |
| **Real-Time Layer** | Socket.IO |
| **AI** | Google GenAI / OpenAI |

---

# Environment Configuration

Dykstra uses environment variables for environment-specific configuration.

Actual secret values should never be stored in the repository.

### Configuration Categories

```text
Application
├── Server Port
├── Environment
└── Allowed Frontend Origin

Database
└── PostgreSQL Connection

Redis
└── Redis Connection

Authentication
├── JWT Secret
├── Session Secret
└── OAuth Credentials

AI
├── Google AI Credentials
└── OpenAI Credentials

Email
└── SMTP Configuration

Code Execution
└── Judge0 Configuration
```

The exact production values are intentionally kept outside the public repository.

---

# Project

# Project Structure

The repository is organized around the frontend and backend applications.

```text
Dykstra/
│
├── client/
│   ├── components/
│   ├── features/
│   ├── routes/
│   ├── services/
│   ├── lib/
│   ├── hooks/
│   ├── stores/
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middleware/
│   ├── workers/
│   ├── utils/
│   ├── config/
│   ├── index.js
│   └── ...
│
└── README.md
```

> The exact directory structure may evolve as Dykstra continues to develop.

---

# API Architecture

The backend exposes versioned REST APIs.

### API Versioning

```text
/api/v1/...
```

Versioning provides a boundary for future API evolution and allows breaking changes to be introduced without immediately invalidating an existing client.

### Major API Domains

```text
Authentication
      │
      ├── Users
      │
      ├── Problems
      │
      ├── Solving
      │
      ├── Progress
      │
      ├── Revision
      │
      ├── Dashboard
      │
      ├── Mentor
      │
      ├── Interview
      │
      └── Code Execution
```

Controllers handle transport-level concerns while services contain application and business logic.

---

# Engineering Decisions

## Why PostgreSQL?

Dykstra contains strongly relational application data.

Examples include:

- Users ↔ solved problems
- Problems ↔ topics
- Users ↔ revisions
- Users ↔ progress
- Users ↔ interviews
- Users ↔ mentor state

PostgreSQL provides:

- relational integrity,
- transactions,
- indexing,
- structured querying,
- and mature production tooling.

---

## Why Redis?

Redis provides low-latency access for data and operations that do not need to be persisted as the primary source of truth.

It is useful for:

- caching,
- temporary state,
- BullMQ coordination,
- and reducing repeated expensive operations.

---

## Why BullMQ?

Some work should not keep an HTTP request open.

BullMQ provides:

- background jobs,
- worker processing,
- retries,
- asynchronous execution,
- and separation between API traffic and background workloads.

---

## Why Socket.IO?

Technical interviews are interactive and event-driven.

REST is naturally suited for:

```text
Request → Response
```

An interview session can require:

```text
Client → Server
Server → Client
Server → Client
Client → Server
...
```

Socket.IO provides the real-time communication layer needed for this interaction.

---

## Why Monaco?

A coding platform should provide a developer-oriented editing experience.

Monaco provides:

- syntax highlighting,
- code editing,
- language-aware capabilities,
- a familiar developer experience,
- and a VS Code-style editor.

---

## Why AI?

AI is used where contextual reasoning and natural-language generation add value.

The goal is not to replace deterministic application logic.

Instead:

```text
┌─────────────────────┐
│ Deterministic Logic │
└──────────┬──────────┘
           +
┌─────────────────────┐
│ User Preparation    │
│ Data                │
└──────────┬──────────┘
           +
┌─────────────────────┐
│ AI Reasoning        │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Personalized        │
│ Preparation         │
└─────────────────────┘
```

---

# Current Status

Dykstra is being developed toward its first public product release.

### Current Product Scope

- DSA problem practice
- Monaco-based coding environment
- Code execution
- Progress tracking
- Adaptive revision
- Confidence tracking
- AI Mentor
- Dashboard analytics
- Technical interview simulation
- Real-time interview events
- Production deployment infrastructure

### Current Focus

The current stage is focused on:

```text
Product Stability
        +
Production Hardening
        +
Infrastructure
        +
Launch Readiness
```

Internal APIs and implementation details may continue to evolve as the product develops.

---

# Roadmap

## V1 — Core Interview Preparation

### Core Platform

- [x] DSA problem tracking
- [x] Code editor
- [x] Code execution infrastructure
- [x] Progress tracking
- [x] Revision workflow
- [x] Dashboard
- [x] AI Mentor
- [x] Confidence tracking
- [x] Interview workflow
- [x] Real-time interview events

### Launch Hardening

- [ ] Production hardening
- [ ] Monitoring
- [ ] Final security review
- [ ] Final UI polish
- [ ] Production launch

---

## V2 — Richer Interview Experience

Planned areas:

- Voice interaction
- Camera integration
- More realistic interviewer behavior
- Improved interview feedback
- Deeper performance analysis

---

## V3 — System Design

Planned direction:

- System design interview preparation
- Interactive architecture canvas
- System design exercises
- Component and service modeling
- AI-assisted system design feedback

---

# Product Philosophy

Dykstra is built around one core idea:

> **Interview preparation should be a continuous feedback loop, not a list of solved problems.**

A useful preparation system should understand:

```text
┌─────────────────────────┐
│ What you solved         │
└────────────┬────────────┘
             +
┌─────────────────────────┐
│ How recently you solved │
└────────────┬────────────┘
             +
┌─────────────────────────┐
│ How difficult it was    │
└────────────┬────────────┘
             +
┌─────────────────────────┐
│ How confidently you     │
│ solved it               │
└────────────┬────────────┘
             +
┌─────────────────────────┐
│ Which topics you        │
│ practice                │
└────────────┬────────────┘
             +
┌─────────────────────────┐
│ Where you struggle      │
└────────────┬────────────┘
             │
             ▼
      ┌───────────────┐
      │ What to do    │
      │ next          │
      └───────────────┘
```

Dykstra is built to turn that idea into a practical product.

---

# Author

## Souvik Sural

Full-stack developer focused on building scalable web applications, developer tools, and AI-powered products.

**GitHub:** [Souvik34](https://github.com/Souvik34)

---

<div align="center">

### Dykstra

**Practice. Revise. Interview. Improve.**

</div>
