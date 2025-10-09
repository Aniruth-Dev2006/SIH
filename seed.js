const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Alumni = require('./models/Alumni');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/communityDB');

const seedData = async () => {
    try {
        // Clear existing data (optional - comment out if you don't want to clear)
        // await Admin.deleteMany({});
        // await Student.deleteMany({});
        // await Alumni.deleteMany({});
        // await Announcement.deleteMany({});
        // await Event.deleteMany({});

        console.log('Starting to seed data...');

        // Create Admin
        const adminExists = await Admin.findOne({ email: 'admin@college.edu' });
        if (!adminExists) {
            await Admin.create({
                email: 'admin@college.edu',
                password: 'admin123'
            });
            console.log('✓ Admin created');
        } else {
            console.log('✓ Admin already exists');
        }

        // Create Sample Students
        const studentExists = await Student.findOne({ email: 'student1@college.edu' });
        if (!studentExists) {
            await Student.insertMany([
                {
                    name: 'Rahul Sharma',
                    email: 'student1@college.edu',
                    password: 'student123',
                    batch: '2024',
                    role: 'Student',
                    rno: 'S001',
                    course: 'B.Tech',
                    dept: 'Computer Science'
                },
                {
                    name: 'Priya Patel',
                    email: 'student2@college.edu',
                    password: 'student123',
                    batch: '2024',
                    role: 'Student',
                    rno: 'S002',
                    course: 'B.Tech',
                    dept: 'Electronics'
                },
                {
                    name: 'Amit Kumar',
                    email: 'student3@college.edu',
                    password: 'student123',
                    batch: '2025',
                    role: 'Student',
                    rno: 'S003',
                    course: 'B.Tech',
                    dept: 'Mechanical'
                }
            ]);
            console.log('✓ Sample students created');
        } else {
            console.log('✓ Students already exist');
        }

        // Create Sample Alumni
        const alumniExists = await Alumni.findOne({ email: 'alumni1@gmail.com' });
        if (!alumniExists) {
            await Alumni.insertMany([
                {
                    name: 'Dr. Vikram Singh',
                    email: 'alumni1@gmail.com',
                    password: 'alumni123',
                    batch: '2015',
                    role: 'Alumni',
                    rno: 'A001',
                    course: 'B.Tech',
                    dept: 'Computer Science'
                },
                {
                    name: 'Meera Reddy',
                    email: 'alumni2@gmail.com',
                    password: 'alumni123',
                    batch: '2018',
                    role: 'Alumni',
                    rno: 'A002',
                    course: 'M.Tech',
                    dept: 'Information Technology'
                },
                {
                    name: 'Arjun Mehta',
                    email: 'alumni3@gmail.com',
                    password: 'alumni123',
                    batch: '2020',
                    role: 'Alumni',
                    rno: 'A003',
                    course: 'B.Tech',
                    dept: 'Civil Engineering'
                }
            ]);
            console.log('✓ Sample alumni created');
        } else {
            console.log('✓ Alumni already exist');
        }

        // Create Sample Announcements
        const announcementExists = await Announcement.findOne({ title: 'Welcome to the New Academic Year' });
        if (!announcementExists) {
            await Announcement.insertMany([
                {
                    title: 'Welcome to the New Academic Year',
                    content: 'We are excited to welcome all students and alumni to the new academic year. Stay tuned for exciting events and opportunities!'
                },
                {
                    title: 'Annual Alumni Meet 2025',
                    content: 'Join us for the Annual Alumni Meet on December 15th, 2025. Register now to reconnect with your batchmates and celebrate our college legacy.'
                },
                {
                    title: 'Job Fair Announcement',
                    content: 'A job fair will be organized on campus next month. Students are encouraged to participate and alumni are welcome to post job opportunities.'
                }
            ]);
            console.log('✓ Sample announcements created');
        } else {
            console.log('✓ Announcements already exist');
        }

        // Create Sample Events
        const eventExists = await Event.findOne({ title: 'Annual Alumni Meet 2025' });
        if (!eventExists) {
            await Event.insertMany([
                {
                    title: 'Annual Alumni Meet 2025',
                    date: '2025-12-15',
                    time: '10:00 AM',
                    venue_name: 'College Auditorium',
                    venue_link: 'https://maps.google.com',
                    description: 'A grand reunion of all alumni batches. Network, share experiences, and celebrate our legacy together.',
                    organizer_name: 'Alumni Association',
                    organizer_contact: 'alumni@college.edu',
                    category: 'Networking',
                    status: 'Upcoming'
                },
                {
                    title: 'Tech Talk: AI and Machine Learning',
                    date: '2025-11-20',
                    time: '2:00 PM',
                    venue_name: 'Virtual',
                    venue_link: 'https://meet.google.com/abc-defg-hij',
                    description: 'Join industry experts for an insightful session on the latest trends in AI and ML.',
                    organizer_name: 'Tech Club',
                    organizer_contact: 'techclub@college.edu',
                    category: 'Workshop',
                    status: 'Upcoming'
                },
                {
                    title: 'Sports Day 2025',
                    date: '2025-10-30',
                    time: '8:00 AM',
                    venue_name: 'College Sports Ground',
                    venue_link: 'https://maps.google.com',
                    description: 'Annual sports competition for students and alumni. Various games and activities planned.',
                    organizer_name: 'Sports Committee',
                    organizer_contact: 'sports@college.edu',
                    category: 'Social',
                    status: 'Upcoming'
                }
            ]);
            console.log('✓ Sample events created');
        } else {
            console.log('✓ Events already exist');
        }

        console.log('\n✓ Database seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log('Admin:');
        console.log('  Email: admin@college.edu');
        console.log('  Password: admin123\n');
        console.log('Student:');
        console.log('  Email: student1@college.edu');
        console.log('  Password: student123\n');
        console.log('Alumni:');
        console.log('  Email: alumni1@gmail.com');
        console.log('  Password: alumni123\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
