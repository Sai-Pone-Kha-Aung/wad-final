// next-backend/scripts/seed.js

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Load .env manually if running standalone node script
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val.trim();
    }
  });
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "online-course-service";

if (!uri) {
  console.error("Error: MONGODB_URI is not set in .env");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log(`Connected to MongoDB. Target DB: ${dbName}`);
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const coursesCollection = db.collection("courses");

    // Clean existing collections to ensure fresh test state
    await usersCollection.deleteMany({});
    await coursesCollection.deleteMany({});
    console.log("Cleared existing users and courses collections.");

    const teacherPasswordHash = await bcrypt.hash("Teacher123!", 10);
    const studentPasswordHash = await bcrypt.hash("Student123!", 10);

    const teacher1Id = new ObjectId();
    const teacher2Id = new ObjectId();
    const teacher3Id = new ObjectId();

    const student1Id = new ObjectId();
    const student2Id = new ObjectId();
    const student3Id = new ObjectId();

    const users = [
      {
        _id: teacher1Id,
        username: "teacher1",
        email: "teacher1@example.com",
        password: teacherPasswordHash,
        role: "Teacher",
        createdAt: new Date(),
      },
      {
        _id: teacher2Id,
        username: "teacher2",
        email: "teacher2@example.com",
        password: teacherPasswordHash,
        role: "Teacher",
        createdAt: new Date(),
      },
      {
        _id: teacher3Id,
        username: "teacher3",
        email: "teacher3@example.com",
        password: teacherPasswordHash,
        role: "Teacher",
        createdAt: new Date(),
      },
      {
        _id: student1Id,
        username: "student1",
        email: "student1@example.com",
        password: studentPasswordHash,
        role: "Student",
        createdAt: new Date(),
      },
      {
        _id: student2Id,
        username: "student2",
        email: "student2@example.com",
        password: studentPasswordHash,
        role: "Student",
        createdAt: new Date(),
      },
      {
        _id: student3Id,
        username: "student3",
        email: "student3@example.com",
        password: studentPasswordHash,
        role: "Student",
        createdAt: new Date(),
      },
    ];

    await usersCollection.insertMany(users);
    console.log(`Inserted ${users.length} users (3 Teachers, 3 Students).`);

    const courses = [
      {
        name: "Full-Stack Web Development with React & Next.js",
        duration: 60,
        topics: ["React", "Next.js", "MongoDB", "Node.js"],
        price: 199.99,
        maxStudents: 10,
        status: "Open",
        teacherId: teacher1Id.toString(),
        teacherName: "teacher1",
        teacherEmail: "teacher1@example.com",
        enrolledStudents: [
          {
            studentId: student1Id.toString(),
            username: "student1",
            email: "student1@example.com",
            enrolledAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Advanced Cloud Architecture & DevOps",
        duration: 45,
        topics: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        price: 249.0,
        maxStudents: 2,
        status: "Open",
        teacherId: teacher1Id.toString(),
        teacherName: "teacher1",
        teacherEmail: "teacher1@example.com",
        enrolledStudents: [
          {
            studentId: student2Id.toString(),
            username: "student2",
            email: "student2@example.com",
            enrolledAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Modern UI/UX Design Fundamentals",
        duration: 30,
        topics: ["Figma", "Design Systems", "Prototyping"],
        price: 120.0,
        maxStudents: 15,
        status: "Close",
        teacherId: teacher2Id.toString(),
        teacherName: "teacher2",
        teacherEmail: "teacher2@example.com",
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Legacy System Migration Strategies",
        duration: 14,
        topics: ["Architecture", "Refactoring", "Legacy Code"],
        price: 99.0,
        maxStudents: 5,
        status: "Cancel",
        teacherId: teacher2Id.toString(),
        teacherName: "teacher2",
        teacherEmail: "teacher2@example.com",
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Cybersecurity & Web Penetration Testing",
        duration: 40,
        topics: ["OWASP", "Penetration Testing", "Cryptography"],
        price: 299.0,
        maxStudents: 20,
        status: "Open",
        teacherId: teacher3Id.toString(),
        teacherName: "teacher3",
        teacherEmail: "teacher3@example.com",
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await coursesCollection.insertMany(courses);
    console.log(`Inserted ${courses.length} courses with diverse statuses and enrollments.`);

    console.log("\n--- TEST CREDENTIALS ---");
    console.log("Teacher 1: teacher1@example.com / Teacher123!");
    console.log("Teacher 2: teacher2@example.com / Teacher123!");
    console.log("Teacher 3: teacher3@example.com / Teacher123!");
    console.log("Student 1: student1@example.com / Student123!");
    console.log("Student 2: student2@example.com / Student123!");
    console.log("Student 3: student3@example.com / Student123!");
    console.log("-------------------------\n");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

seed();
