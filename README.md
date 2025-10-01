# Alumni Management System

A comprehensive web application for managing alumni and student interactions, events, job postings, and marketplace listings.

## Features

### Admin Features
- User management (Students & Alumni)
- Approve/reject alumni registration requests
- Create and manage announcements
- Create and manage events
- View statistics and analytics

### Alumni Features
- Personal dashboard
- View and RSVP to events
- Post job opportunities
- Create marketplace listings
- View announcements
- Leaderboard participation

### Student Features
- Personal dashboard
- View events and announcements
- Browse job opportunities
- Access marketplace listings
- Career hub access
- View alumni leaderboard

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Session Management**: express-session
- **Frontend**: Bootstrap 5, Custom CSS

## Project Structure

```
SIH1/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── Admin.js             # Admin model
│   ├── Alumni.js            # Alumni model
│   ├── Student.js           # Student model
│   ├── Announcement.js      # Announcement model
│   ├── Event.js             # Event model
│   ├── Job.js               # Job model
│   ├── Marketplace.js       # Marketplace model
│   ├── PendingRequest.js    # Pending request model
│   └── Rsvp.js              # RSVP model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── student.js           # Student routes
│   └── alumni.js            # Alumni routes
├── views/
│   ├── admin.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   └── ... (other views)
├── Public/
│   ├── admin.css
│   ├── login.css
│   └── ... (other CSS files)
├── app.js                   # Legacy app file (backup)
├── server.js                # New modular server file
├── package.json
└── README.md

```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SIH1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install nodemon for development (optional)**
   ```bash
   npm install --save-dev nodemon
   ```

4. **Set up MongoDB**
   - Make sure MongoDB is installed and running on your system
   - The default connection is `mongodb://localhost:27017/communityDB`

5. **Create environment file (optional)**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configurations

## Running the Application

### Production Mode
```bash
npm start
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Using Legacy app.js
```bash
npm run start-old
```

The server will start on `http://localhost:3000`

## Default Access

### Admin Login
You'll need to create an admin user manually in MongoDB:
```javascript
db.admins.insertOne({
  email: "admin@example.com",
  password: "admin123",
  createdAt: new Date()
})
```

### Student/Alumni Registration
Students and alumni can sign up through the signup page. Alumni registrations require admin approval.

## API Endpoints

### Authentication
- `GET /` - Login page
- `POST /` - Login handler
- `GET /signup` - Signup page
- `POST /signup` - Signup handler
- `GET /logout` - Logout

### Admin Routes
- `GET /admin` - Admin dashboard
- `GET /user_management` - User management page
- `GET /all_users` - View all users
- `GET /pending-requests` - View pending alumni requests
- `POST /approve-alumni` - Approve alumni request
- `POST /reject-alumni` - Reject alumni request
- `GET /create_student` - Create student page
- `POST /create_student` - Create student
- `GET /create_alumni` - Create alumni page
- `POST /create_alumni` - Create alumni
- `POST /edit-user` - Edit user
- `POST /delete-user` - Delete user
- `GET /announcements` - Manage announcements
- `POST /create-announcement` - Create announcement
- `GET /events` - Manage events
- `POST /create-event` - Create event
- `POST /edit-event` - Edit event
- `POST /delete-event` - Delete event

### Student Routes
- `GET /student-dashboard` - Student dashboard
- `GET /student-announcements` - View announcements
- `GET /student-events` - View events
- `GET /student-jobs` - View job postings
- `GET /student-marketplace` - View marketplace
- `GET /student-leaderboard` - View leaderboard
- `GET /student-career-hub` - Career hub

### Alumni Routes
- `GET /alumni-dashboard` - Alumni dashboard
- `GET /alumni-announcements` - View announcements
- `GET /alumni-events` - View events
- `POST /rsvp` - RSVP to event
- `GET /alumni-jobs` - View job postings
- `POST /post-job` - Post a job
- `GET /alumni-marketplace` - View marketplace
- `POST /post-listing` - Create marketplace listing
- `GET /leaderboard` - View leaderboard

## Database Models

### Admin
- email (unique)
- password
- createdAt

### Student
- name
- email (unique)
- password
- batch
- role
- rno (roll number, unique)
- course
- dept (department)
- createdAt

### Alumni
- name
- email (unique)
- password
- batch
- role
- rno (roll number, unique)
- course
- dept (department)
- createdAt

### Event
- title
- date
- time
- venue_name
- venue_link
- description
- organizer_name
- organizer_contact
- category
- status (Upcoming/Completed/Cancelled)
- created_at

### Job
- title
- company
- location
- description
- applicationLink
- postedBy (ref: Alumni)
- createdAt

### Marketplace
- title
- description
- category
- contactInfo
- postedBy (ref: Alumni)
- createdAt

## Security Features

- Session-based authentication
- Role-based access control
- Protected routes with middleware
- HTTP-only cookies
- Input validation

## Future Enhancements

- Password hashing (bcrypt)
- Email notifications
- File upload for profile pictures
- Advanced search and filters
- Real-time chat/messaging
- Analytics dashboard
- Mobile responsive improvements
- API rate limiting
- CSRF protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License

## Author

Aniruth

## Support

For support, email your-email@example.com or create an issue in the repository.
