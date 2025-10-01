# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All authenticated routes require a valid session cookie. Sessions are created upon successful login.

---

## Authentication Endpoints

### Login
**POST** `/`

Login to the system.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
- Redirects to appropriate dashboard based on role
- Sets session cookie

---

### Signup
**POST** `/signup`

Register a new alumni account (requires admin approval).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "batch": "2020",
  "rno": "A123",
  "course": "B.Tech",
  "dept": "Computer Science"
}
```

**Response:**
- Redirects to login page with success message
- Creates pending request for admin approval

---

### Logout
**GET** `/logout`

Logout from the system.

**Response:**
- Destroys session
- Redirects to login page

---

## Admin Endpoints

### Get All Users
**GET** `/all_users`

Get list of all students and alumni.

**Auth Required:** Admin

**Response:**
Renders page with all users

---

### Search Users
**GET** `/api/search-users`

Search for users by name, role, and batch.

**Auth Required:** Admin

**Query Parameters:**
- `name` (optional): User name to search
- `role` (optional): "Student" or "Alumni"
- `batch` (optional): Batch year

**Response:**
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "batch": "2020",
    "role": "Alumni",
    "rno": "A123",
    "course": "B.Tech",
    "dept": "Computer Science"
  }
]
```

---

### Get User by ID
**GET** `/api/user/:role/:id`

Get specific user details.

**Auth Required:** Admin

**Parameters:**
- `role`: "Student" or "Alumni"
- `id`: User ID

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "batch": "2020",
  "role": "Alumni",
  "rno": "A123",
  "course": "B.Tech",
  "dept": "Computer Science"
}
```

---

### Edit User
**POST** `/edit-user`

Edit user details.

**Auth Required:** Admin

**Request Body:**
```json
{
  "userId": "...",
  "originalRole": "Student",
  "name": "Updated Name",
  "rno": "S123",
  "batch": "2024",
  "course": "B.Tech",
  "dept": "CS",
  "password": "newpassword",
  "role": "Alumni"
}
```

---

### Delete User
**POST** `/delete-user`

Delete a user.

**Auth Required:** Admin

**Request Body:**
```json
{
  "userId": "...",
  "userRole": "Student"
}
```

---

### Approve Alumni Request
**POST** `/approve-alumni`

Approve pending alumni registration.

**Auth Required:** Admin

**Request Body:**
```json
{
  "requestId": "..."
}
```

---

### Reject Alumni Request
**POST** `/reject-alumni`

Reject pending alumni registration.

**Auth Required:** Admin

**Request Body:**
```json
{
  "requestId": "..."
}
```

---

### Create Announcement
**POST** `/create-announcement`

Create new announcement.

**Auth Required:** Admin

**Request Body:**
```json
{
  "title": "Important Announcement",
  "content": "Announcement details here..."
}
```

---

### Get Event by ID
**GET** `/api/event/:id`

Get specific event details.

**Auth Required:** Admin

**Parameters:**
- `id`: Event ID

**Response:**
```json
{
  "_id": "...",
  "title": "Annual Meet",
  "date": "2025-12-15",
  "time": "10:00 AM",
  "venue_name": "Auditorium",
  "venue_link": "https://...",
  "description": "Event description",
  "organizer_name": "Admin",
  "organizer_contact": "admin@college.edu",
  "category": "Networking",
  "status": "Upcoming"
}
```

---

### Create Event
**POST** `/create-event`

Create new event.

**Auth Required:** Admin

**Request Body:**
```json
{
  "title": "Annual Meet",
  "date": "2025-12-15",
  "time": "10:00 AM",
  "venue_name": "Auditorium",
  "venue_link": "https://...",
  "description": "Event description",
  "organizer_name": "Admin",
  "organizer_contact": "admin@college.edu",
  "category": "Networking",
  "status": "Upcoming"
}
```

---

### Edit Event
**POST** `/edit-event`

Edit existing event.

**Auth Required:** Admin

**Request Body:**
```json
{
  "id": "...",
  "title": "Updated Title",
  "date": "2025-12-15",
  ...
}
```

---

### Delete Event
**POST** `/delete-event`

Delete an event.

**Auth Required:** Admin

**Request Body:**
```json
{
  "eventId": "..."
}
```

---

## Alumni Endpoints

### RSVP to Event
**POST** `/rsvp`

Register for an event.

**Auth Required:** Alumni

**Request Body:**
```json
{
  "eventId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the event!"
}
```

---

### Post Job
**POST** `/post-job`

Post a job opportunity.

**Auth Required:** Alumni

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Bangalore",
  "description": "Job description here...",
  "applicationLink": "https://apply.techcorp.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted successfully!"
}
```

---

### Post Marketplace Listing
**POST** `/post-listing`

Create a marketplace listing.

**Auth Required:** Alumni

**Request Body:**
```json
{
  "title": "Used Textbooks",
  "category": "Books",
  "description": "Selling engineering textbooks",
  "contactInfo": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing posted successfully!"
}
```

---

## Common Response Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All POST requests require proper form data or JSON body
2. Sessions expire after 24 hours of inactivity
3. File uploads are not yet implemented
4. Passwords are currently stored in plain text (should be hashed in production)
