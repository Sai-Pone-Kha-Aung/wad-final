# How to Test the App

## Student Information

- **Student Name:** Sai Pone Kha Aung
- **Student ID:** 6611708

## Test Credentials

### Teacher Accounts (Role: `Teacher`)

| Role      | Username   | Email                  | Password      |
| --------- | ---------- | ---------------------- | ------------- |
| Teacher 1 | `teacher1` | `teacher1@example.com` | `Teacher123!` |
| Teacher 2 | `teacher2` | `teacher2@example.com` | `Teacher123!` |
| Teacher 3 | `teacher3` | `teacher3@example.com` | `Teacher123!` |

### Student Accounts (Role: `Student`)

| Role      | Username   | Email                  | Password      |
| --------- | ---------- | ---------------------- | ------------- |
| Student 1 | `student1` | `student1@example.com` | `Student123!` |
| Student 2 | `student2` | `student2@example.com` | `Student123!` |
| Student 3 | `student3` | `student3@example.com` | `Student123!` |

---

## Prerequisites

- Node.js (v18+ or v20+)
- npm
- Internet connection (for MongoDB Atlas connection)

---

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

1. Open terminal and navigate to the backend directory:
   ```bash
   cd next-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` configuration:
   ```env
   MONGODB_USER=saihunter2016_db_user
   MONGODB_PASS=qRv5n2EwQWSzKwyr
   MONGODB_URI=mongodb+srv://saihunter2016_db_user:qRv5n2EwQWSzKwyr@cluster0.cay0lih.mongodb.net/
   DB_NAME=online-course-service
   JWT_SECRET=c3eb82eaf05c2c88dcd29e9c56a96b16d7b96f1b605014efe4c5752837449649
   ```
4. Seed the database with the test users and initial courses:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:3000`.

---

### 2. Frontend Setup (`react-frontend/`)

1. In another terminal window, navigate to the frontend directory:
   ```bash
   cd react-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env` is configured (or defaults to `http://localhost:3000/api`):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will run at `http://localhost:5173`.

---

### 3. Testing Walkthrough

#### A. Authentication & Roles

1. Log in with `teacher1@example.com` / `Teacher123!`.
2. Notice that the teacher is authenticated and the Teacher Dashboard shows only Teacher 1's courses.
3. Log out and log in with `student1@example.com` / `Student123!`.
4. Notice that the student views all available courses (excluding `Cancel` status courses).

#### B. Teacher Course Operations

1. As a Teacher, create a new course with Name, Duration (days), Topics, Price, Max Students, and Status (`Open`).
2. Update course details (e.g. edit title or status to `Close`).
3. View the Course Details to see the list of enrolled students.
4. Try to delete a course that has enrolled students: the backend rejects the deletion with an error message.
5. Create a new test course with 0 enrolled students, then delete it: the course is deleted successfully.

#### C. Student Course Operations & Enrollment Rules

1. As a Student, search/filter courses in real-time by course name or teacher name.
2. Enroll in an `Open` course that has available seats.
3. Try enrolling in the same course a second time: the system rejects duplicate enrollment.
4. Try enrolling in a `Close` course: enrollment is disabled/rejected.
5. View "My Enrolled Courses" to see all courses the student is currently enrolled in.
