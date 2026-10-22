# Job & Internship Portal (MERN Stack)

A clean, student-friendly college lab project built using the MERN stack (MongoDB, Express.js, React.js, Node.js).

---

## 🌟 Key Features

1. **Tabbed Navigation**:
   - 💼 **Browse Opportunities**: Interactive table listing all open jobs and internships with live search filter and summary stats pills.
   - ➕ **Post a Job / Internship**: Dedicated clean page/form to post a new listing or update an existing one.
   - 📋 **Application History**: Dedicated page tracking all student applications stored in MongoDB.
2. **Interactive Job Application**:
   - Students click the green **Apply** button on any listing to enter their Name and Email in an inline drawer.
   - Saves to MongoDB's `applications` collection and shows an instant success notification banner.
3. **Full CRUD for Listings**:
   - **Create**: Via the "Post a Job" tab.
   - **Read**: Live catalog on the "Browse Opportunities" tab.
   - **Update**: Click "Edit" on any job to load it into the "Post a Job" form and save changes.
   - **Delete**: Remove listings with one click.

---

## 📂 Project Structure

```text
├── backend/
│   ├── package.json
│   └── server.js        # Express server, MongoDB schemas (Job & Application), & CRUD routes
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── index.js     # React entry point
│       ├── App.js       # Main component with 3 clean tabs (Browse, Post Job, History)
│       └── App.css      # Custom styling, badges, tabs, and table borders
└── README.md
```

---

## 🚀 How to Run

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017` (`mongodb://127.0.0.1:27017/jobPortalDB`).
```bash
# If installed as a Windows service:
net start MongoDB
```

---

### Step 2: Start the Backend Server
Open a terminal:
```bash
cd backend
npm start
```
*(Runs on `http://localhost:5000`)*

---

### Step 3: Start the Frontend React App
Open a second terminal:
```bash
cd frontend
npm start
```
*(Runs on `http://localhost:3000`)*

---

## 📡 API Endpoints

### Jobs & Internships
| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/jobs` | Fetch all jobs & internships (newest first) |
| **POST** | `/api/jobs` | Create a new job or internship |
| **PUT** | `/api/jobs/:id` | Update an existing job by ID |
| **DELETE** | `/api/jobs/:id` | Delete a job by ID |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/applications` | Fetch all submitted applications |
| **POST** | `/api/applications` | Submit a candidate application |
