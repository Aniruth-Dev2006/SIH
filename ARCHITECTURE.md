# Project Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │  Admin   │  │ Student  │  │  Alumni  │       │
│  │   Page   │  │Dashboard │ │Dashboard │ │Dashboard │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (server.js)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │Body Parser │  │  Session   │  │   Static   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  AUTHENTICATION LAYER                    │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         middleware/auth.js                       │  │   │
│  │  │  • isAuthenticated                               │  │   │
│  │  │  • isAdmin                                       │  │   │
│  │  │  • isStudent                                     │  │   │
│  │  │  • isAlumni                                      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     ROUTING LAYER                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │  Auth    │  │  Admin   │  │ Student  │  │Alumni  │ │   │
│  │  │ Routes   │  │  Routes  │  │  Routes  │  │Routes  │ │   │
│  │  │          │  │          │  │          │  │        │ │   │
│  │  │ /login   │  │ /admin   │  │/student- │  │/alumni-│ │   │
│  │  │ /signup  │  │ /users   │  │dashboard │  │dashboard│ │   │
│  │  │ /logout  │  │ /events  │  │/student- │  │/alumni-│ │   │
│  │  │          │  │ /announce│  │jobs      │  │jobs    │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BUSINESS LOGIC                        │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Controllers (Route Handlers)                    │  │   │
│  │  │  • Validation                                    │  │   │
│  │  │  • Business Rules                                │  │   │
│  │  │  • Data Processing                               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      MODEL LAYER                         │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │   │
│  │  │ Admin  │ │Student │ │ Alumni │ │  Event │ │ Job  │ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────┘ │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │   │
│  │  │Announce│ │Market- │ │Pending │ │  RSVP  │          │   │
│  │  │ment    │ │place   │ │Request │ │        │          │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   UTILITY LAYER                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │  Validation  │  │    Logger    │  │  Responses   │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  ERROR HANDLING LAYER                    │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │         middleware/errorHandler.js               │  │   │
│  │  │  • Validation Errors                             │  │   │
│  │  │  • Duplicate Key Errors                          │  │   │
│  │  │  • 404 Not Found                                 │  │   │
│  │  │  • 500 Server Errors                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              config/database.js                          │   │
│  │  • Connection Management                                 │   │
│  │  • Error Handling                                        │   │
│  │  • Reconnection Logic                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MongoDB Database (communityDB)              │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Collections:                                     │  │   │
│  │  │  • admins                                        │  │   │
│  │  │  • students                                      │  │   │
│  │  │  • aluminis                                      │  │   │
│  │  │  • announcements                                 │  │   │
│  │  │  • events                                        │  │   │
│  │  │  • jobs                                          │  │   │
│  │  │  • marketplaces                                  │  │   │
│  │  │  • pendingrequests                               │  │   │
│  │  │  • rsvps                                         │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Example: Student Views Jobs

```
1. Student clicks "Jobs" in dashboard
   ↓
2. Browser sends GET /student-jobs
   ↓
3. Express receives request
   ↓
4. Body Parser & Session middleware process request
   ↓
5. isStudent middleware checks authentication
   ↓
6. routes/student.js handles request
   ↓
7. Query parameters extracted (title, location)
   ↓
8. models/Job.js queries database
   ↓
9. Database returns job listings
   ↓
10. Data populated with alumni info
   ↓
11. views/student_jobs.ejs renders page
   ↓
12. HTML sent to browser
   ↓
13. Student sees job listings
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      REQUEST LIFECYCLE                        │
└──────────────────────────────────────────────────────────────┘

HTTP Request
     │
     ▼
┌─────────────────┐
│  Middleware     │ → Body Parser, Session, Static Files
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authentication  │ → Check if logged in, Check role
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Handler  │ → Match URL to handler function
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │ → Validate input data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database Query │ → Mongoose queries MongoDB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Transform │ → Format, populate, process
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render/JSON    │ → EJS template or JSON response
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Error Handler  │ → Catch and format errors
└────────┬────────┘
         │
         ▼
HTTP Response
```

## Folder Structure Flow

```
PROJECT ROOT
│
├── server.js ──────────────────────────► Entry Point
│   │
│   ├─► config/
│   │   └── database.js ───────────────► MongoDB Connection
│   │
│   ├─► middleware/
│   │   ├── auth.js ───────────────────► Authentication Guards
│   │   └── errorHandler.js ───────────► Error Management
│   │
│   ├─► routes/
│   │   ├── auth.js ───────────────────► Login/Signup/Logout
│   │   ├── admin.js ──────────────────► Admin Operations
│   │   ├── student.js ────────────────► Student Features
│   │   └── alumni.js ─────────────────► Alumni Features
│   │
│   └─► models/
│       ├── Admin.js ──────────────────► Admin Schema
│       ├── Student.js ────────────────► Student Schema
│       ├── Alumni.js ─────────────────► Alumni Schema
│       ├── Announcement.js ───────────► Announcement Schema
│       ├── Event.js ──────────────────► Event Schema
│       ├── Job.js ────────────────────► Job Schema
│       ├── Marketplace.js ────────────► Marketplace Schema
│       ├── PendingRequest.js ─────────► Pending Request Schema
│       └── Rsvp.js ───────────────────► RSVP Schema
│
├── views/ ─────────────────────────────► EJS Templates
│   ├── login.ejs
│   ├── admin.ejs
│   ├── student_dashboard.ejs
│   └── alumni_dashboard.ejs
│
├── Public/ ────────────────────────────► Static Files
│   ├── admin.css
│   ├── login.css
│   └── ...
│
├── utils/ ─────────────────────────────► Helper Functions
│   ├── validation.js
│   ├── logger.js
│   └── responses.js
│
└── seed.js ────────────────────────────► Database Seeding
```

## Authentication Flow

```
Login Request
     │
     ▼
┌─────────────────┐
│ POST / (login)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Check credentials in database       │
│ • Admin collection                  │
│ • Student collection                │
│ • Alumni collection                 │
│ • PendingRequest collection         │
└────────┬────────────────────────────┘
         │
         ├─► Admin Found
         │   └─► Create Session
         │       ├── userEmail
         │       ├── userRole = 'admin'
         │       └─► Redirect to /admin
         │
         ├─► Student Found
         │   └─► Create Session
         │       ├── userEmail
         │       ├── userId
         │       ├── userRole = 'Student'
         │       └─► Redirect to /student-dashboard
         │
         ├─► Alumni Found
         │   └─► Create Session
         │       ├── userEmail
         │       ├── userId
         │       ├── userRole = 'Alumni'
         │       └─► Redirect to /alumni-dashboard
         │
         ├─► Pending Request Found
         │   └─► Redirect to /?status=pending_approval
         │
         └─► Not Found
             └─► Redirect to /?status=login_failed
```

## Session Management

```
Session Cookie (connect.sid)
     │
     ├─► Stored in Browser (HTTP-Only)
     │
     └─► Contains Session ID
         │
         ▼
┌─────────────────────────────────┐
│  Express Session Store          │
│  (Memory - Default)              │
│                                  │
│  Session Data:                   │
│  ├── userEmail: "user@email.com"│
│  ├── userId: "ObjectId(...)"    │
│  ├── userRole: "Student"        │
│  ├── cookie: { maxAge: 86400000}│
│  └── createdAt: Date            │
└─────────────────────────────────┘
```

## Role-Based Access Control

```
                Request to Protected Route
                          │
                          ▼
                ┌───────────────────┐
                │ Middleware Check  │
                └─────────┬─────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    isAuthenticated   isAdmin         isStudent      isAlumni
          │               │               │               │
          │               │               │               │
    Check Session   Check Role      Check Role      Check Role
          │               │               │               │
          │               │               │               │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │           │   │           │   │           │   │           │
    ▼           ▼   ▼           ▼   ▼           ▼   ▼           ▼
  Valid    Invalid Admin   Other Student  Other Alumni   Other
    │           │   │           │   │           │   │           │
    ▼           ▼   ▼           ▼   ▼           ▼   ▼           ▼
  Allow    Redirect Allow   Redirect Allow  Redirect Allow   Redirect
  Access    to /    Access   to /    Access  to /    Access   to /
                    Route           Route           Route
```

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  EJS   │  │  CSS   │  │Bootstrap│  │   JS   │       │
│  │  3.1   │  │ Custom │  │   5.x   │  │ Vanilla│       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│  ┌────────────────┐  ┌────────────────┐                │
│  │   Express.js   │  │  Body Parser   │                │
│  │     v5.1       │  │     v2.2       │                │
│  └────────────────┘  └────────────────┘                │
│  ┌────────────────┐  ┌────────────────┐                │
│  │express-session │  │   Middleware   │                │
│  │     v1.18      │  │     Custom     │                │
│  └────────────────┘  └────────────────┘                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                     │
│  ┌────────────────┐  ┌────────────────┐                │
│  │   Mongoose     │  │    Models      │                │
│  │     v8.18      │  │   (Schemas)    │                │
│  └────────────────┘  └────────────────┘                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  ┌────────────────┐                                     │
│  │    MongoDB     │                                     │
│  │   (Community   │                                     │
│  │      DB)       │                                     │
│  └────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
✅ **Separation of Concerns**
✅ **Scalability**
✅ **Maintainability**
✅ **Security**
✅ **Testability**
