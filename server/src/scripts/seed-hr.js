const mongoose = require('mongoose');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' }); // Adjusted for server root

const mongo_uri = process.env.MONGODB_URI;

const seedHR = async () => {
    try {
        await mongoose.connect(mongo_uri);
        console.log('Connected to MongoDB...');

        // 1. Update existing users with test stats
        const users = await User.find({});
        for (const user of users) {
            user.leavesRemaining = { sick: 4, casual: 8 };
            user.tenure = 3.2;
            user.attendanceRate = 94;
            user.pendingApprovals = 2;
            user.jobTitle = 'Senior Dev';
            await user.save();
            console.log(`Updated stats for user: ${user.email}`);
        }

        // 2. Clear and seed announcements
        await Announcement.deleteMany({});
        const announcements = [
            { title: 'Q2 appraisal cycle begins April 15', indicator: 'primary', date: new Date('2026-04-07') },
            { title: 'New work-from-home policy effective May 1', indicator: 'green', date: new Date('2026-04-03') },
            { title: 'Office closed — Good Friday, April 18', indicator: 'orange', date: new Date('2026-03-28') }
        ];
        await Announcement.insertMany(announcements);
        console.log('Seeded company announcements.');

        process.exit();
    } catch (err) {
        console.error('Error seeding HR data:', err);
        process.exit(1);
    }
};

seedHR();
