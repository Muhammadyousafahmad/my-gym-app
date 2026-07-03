const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const MemberProfile = require('../models/MemberProfile');
const TrainerProfile = require('../models/TrainerProfile');
const MembershipPlan = require('../models/MembershipPlan');
const Subscription = require('../models/Subscription');
const Class = require('../models/Class');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateUserQRCode } = require('./qrService');

// Stub generateUserQRCode if we run independently to prevent write errors, 
// or import the service.
const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gym-app';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await MemberProfile.deleteMany({});
    await TrainerProfile.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Subscription.deleteMany({});
    await Class.deleteMany({});
    await WorkoutPlan.deleteMany({});
    await DietPlan.deleteMany({});
    await Attendance.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared database successfully!');

    // 1. Create Membership Plans
    console.log('Creating Membership Plans...');
    const basicPlan = await MembershipPlan.create({
      name: 'Basic Gym Access',
      price: 29,
      durationInMonths: 1,
      features: ['Access to weights room', 'Locker room access', '1 Gym check-in daily'],
      stripePriceId: 'price_basic_mock'
    });

    const premiumPlan = await MembershipPlan.create({
      name: 'Premium Fitness Tier',
      price: 59,
      durationInMonths: 1,
      features: ['Weights room & Cardio deck', 'All group fitness classes (Yoga, Zumba)', 'Free sauna access', 'Unlimited check-ins'],
      stripePriceId: 'price_premium_mock'
    });

    const elitePlan = await MembershipPlan.create({
      name: 'Elite Executive Club',
      price: 99,
      durationInMonths: 1,
      features: ['Full gym access', 'All group classes included', '1-on-1 Trainer guidance (2 sessions/week)', 'Nutrition & Diet planner access', 'Complimentary recovery drink daily'],
      stripePriceId: 'price_elite_mock'
    });

    // 2. Create Admin
    console.log('Creating Admin...');
    const admin = await User.create({
      name: 'Alex Rivera (Admin)',
      email: 'admin@gym.com',
      password: 'password123',
      role: 'admin',
      phone: '+923001234567'
    });

    // 3. Create Trainers
    console.log('Creating Trainers...');
    const trainer1 = await User.create({
      name: 'Ali Ahmed',
      email: 'trainer1@gym.com',
      password: 'password123',
      role: 'trainer',
      phone: '+923001112233'
    });

    await TrainerProfile.create({
      user: trainer1._id,
      bio: 'Certified strength coach with 8+ years specializing in functional bodybuilding and athletic conditioning. Dedicated to building injury-free resilience.',
      certifications: ['NASM Certified Personal Trainer', 'FMS Level 1 Functional Movement Screening', 'Precision Nutrition Level 1 Coach'],
      specializations: ['Bodybuilding', 'Strength & Conditioning', 'Rehabilitation'],
      workingHours: { start: '06:00', end: '14:00' }
    });

    const trainer2 = await User.create({
      name: 'Sara Malik',
      email: 'trainer2@gym.com',
      password: 'password123',
      role: 'trainer',
      phone: '+923001223344'
    });

    await TrainerProfile.create({
      user: trainer2._id,
      bio: 'Yoga specialist and cardio trainer focused on mind-body alignment, high-intensity intervals, and mobility optimization.',
      certifications: ['RYT-500 Yoga Alliance Registered Teacher', 'ACE Group Fitness Instructor', 'TRX Suspension Trainer Certified'],
      specializations: ['Yoga & Flexibility', 'Cardio & Endurance', 'Weight Loss'],
      workingHours: { start: '12:00', end: '20:00' }
    });

    // 4. Create Members
    console.log('Creating Members...');
    const member1 = await User.create({
      name: 'Hassan Ali',
      email: 'member1@gym.com',
      password: 'password123',
      role: 'member',
      phone: '+923001334455'
    });

    const m1Qr = await generateUserQRCode(member1._id.toString());
    const m1SubEnd = new Date();
    m1SubEnd.setMonth(m1SubEnd.getMonth() + 1);

    await MemberProfile.create({
      user: member1._id,
      dob: new Date('1994-04-12'),
      gender: 'Male',
      emergencyContact: { name: 'Ayesha Khan', relationship: 'Spouse', phone: '+923001667788' },
      membershipPlan: premiumPlan._id,
      subscriptionStatus: 'active',
      subscriptionEnd: m1SubEnd,
      qrCodeUrl: m1Qr,
      height: 180,
      weightHistory: [{ weight: 82, date: new Date(Date.now() - 30*24*60*60*1000) }, { weight: 79.5, date: new Date() }],
      fitnessGoal: 'Lose Weight'
    });

    // Subscriptions
    await Subscription.create({
      member: member1._id,
      plan: premiumPlan._id,
      startDate: new Date(Date.now() - 5*24*60*60*1000),
      endDate: m1SubEnd,
      stripeSubscriptionId: 'sub_mock_m1_123',
      status: 'active'
    });

    await Payment.create({
      member: member1._id,
      amount: premiumPlan.price,
      currency: 'usd',
      status: 'succeeded',
      stripePaymentIntentId: 'pi_mock_m1_123',
      plan: premiumPlan._id
    });

    const member2 = await User.create({
      name: 'Fatima Zahra',
      email: 'member2@gym.com',
      password: 'password123',
      role: 'member',
      phone: '+923001445566'
    });

    const m2Qr = await generateUserQRCode(member2._id.toString());
    const m2SubEnd = new Date();
    m2SubEnd.setMonth(m2SubEnd.getMonth() + 1);

    await MemberProfile.create({
      user: member2._id,
      dob: new Date('1997-09-22'),
      gender: 'Female',
      emergencyContact: { name: 'Bilal Hussain', relationship: 'Parent', phone: '+923001778899' },
      membershipPlan: elitePlan._id,
      subscriptionStatus: 'active',
      subscriptionEnd: m2SubEnd,
      qrCodeUrl: m2Qr,
      height: 168,
      weightHistory: [{ weight: 61, date: new Date(Date.now() - 15*24*60*60*1000) }, { weight: 62.5, date: new Date() }],
      fitnessGoal: 'Build Muscle'
    });

    await Subscription.create({
      member: member2._id,
      plan: elitePlan._id,
      startDate: new Date(Date.now() - 2*24*60*60*1000),
      endDate: m2SubEnd,
      stripeSubscriptionId: 'sub_mock_m2_123',
      status: 'active'
    });

    await Payment.create({
      member: member2._id,
      amount: elitePlan.price,
      currency: 'usd',
      status: 'succeeded',
      stripePaymentIntentId: 'pi_mock_m2_123',
      plan: elitePlan._id
    });

    const member3 = await User.create({
      name: 'Imran Shah',
      email: 'member3@gym.com',
      password: 'password123',
      role: 'member',
      phone: '+923001556677'
    });

    const m3Qr = await generateUserQRCode(member3._id.toString());

    await MemberProfile.create({
      user: member3._id,
      dob: new Date('1991-01-05'),
      gender: 'Prefer not to say',
      emergencyContact: { name: 'Sadia Iqbal', relationship: 'Sibling', phone: '+923001889900' },
      membershipPlan: null,
      subscriptionStatus: 'none',
      subscriptionEnd: null,
      qrCodeUrl: m3Qr,
      height: 175,
      weightHistory: [{ weight: 75, date: new Date() }],
      fitnessGoal: 'Maintain Fitness'
    });

    // 5. Create Classes
    console.log('Creating Classes...');
    const now = new Date();
    
    // Class 1: Yoga session today evening
    const yogaTimeStart = new Date(now);
    yogaTimeStart.setHours(18, 0, 0, 0);
    const yogaTimeEnd = new Date(now);
    yogaTimeEnd.setHours(19, 30, 0, 0);

    const class1 = await Class.create({
      name: 'Vinyasa Flow Yoga',
      description: 'Find balance and flexibility with our evening vinyasa breathing and posture session.',
      trainer: trainer2._id,
      startTime: yogaTimeStart,
      endTime: yogaTimeEnd,
      capacity: 15,
      room: 'Studio B (Zen Room)',
      enrolled: [member1._id, member2._id]
    });

    // Class 2: HIIT class tomorrow morning
    const hiitTimeStart = new Date(now);
    hiitTimeStart.setDate(hiitTimeStart.getDate() + 1);
    hiitTimeStart.setHours(8, 0, 0, 0);
    const hiitTimeEnd = new Date(now);
    hiitTimeEnd.setDate(hiitTimeEnd.getDate() + 1);
    hiitTimeEnd.setHours(9, 0, 0, 0);

    const class2 = await Class.create({
      name: 'Metabolic Conditioning HIIT',
      description: 'High intensity conditioning circuit to push your anaerobic capacity and max out fat burning.',
      trainer: trainer1._id,
      startTime: hiitTimeStart,
      endTime: hiitTimeEnd,
      capacity: 2, // Small capacity to demonstrate waitlisting!
      room: 'Main Turf Area',
      enrolled: [member1._id, member2._id],
      waitlist: [member3._id]
    });

    // 6. Create Attendance logs (Past checkins)
    console.log('Creating Attendance logs...');
    
    // Member 1 check-ins
    const checkinDays = [1, 2, 3, 4, 5];
    for (let day of checkinDays) {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() - day);
      checkinDate.setHours(7, 30 + Math.floor(Math.random()*15), 0, 0);

      await Attendance.create({
        member: member1._id,
        class: null,
        date: checkinDate,
        checkInTime: checkinDate,
        method: 'QR',
        status: 'Present'
      });
    }

    // Member 2 check-ins
    for (let day of [1, 2, 3]) {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() - day);
      checkinDate.setHours(17, 10, 0, 0);

      await Attendance.create({
        member: member2._id,
        class: null,
        date: checkinDate,
        checkInTime: checkinDate,
        method: 'Manual',
        status: 'Present'
      });
    }

    // 7. Create Workout & Diet Plans
    console.log('Creating Plans...');
    await WorkoutPlan.create({
      title: 'Hypertrophy Conditioning Phase 1',
      trainer: trainer1._id,
      member: member2._id,
      exercises: [
        { name: 'Barbell Back Squats', sets: 4, reps: '8-10', weight: '70 kg', restSeconds: 90, notes: 'Focus on depth and control' },
        { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', weight: '22 kg', restSeconds: 60, notes: 'Keep elbows tucked' },
        { name: 'Lat Pulldowns', sets: 3, reps: '12', weight: '45 kg', restSeconds: 60, notes: 'Squeeze shoulder blades at bottom' },
        { name: 'Romanian Deadlifts', sets: 4, reps: '10', weight: '60 kg', restSeconds: 90, notes: 'Hinge at the hips' }
      ],
      notes: 'Complete this session 3 times a week. Log your weights and ensure rest matches targets.'
    });

    await DietPlan.create({
      title: 'Lean Bulk Muscle Plan',
      trainer: trainer1._id,
      member: member2._id,
      caloriesTarget: 2600,
      proteinTarget: 165,
      carbsTarget: 310,
      fatTarget: 75,
      meals: [
        { time: '07:30 AM', foodItems: '4 whole eggs, 2 slices whole wheat toast, 1 banana', calories: 600, protein: 32, carbs: 65, fat: 22 },
        { time: '12:30 PM', foodItems: '180g grilled chicken breast, 150g brown rice, steamed broccoli', calories: 650, protein: 48, carbs: 75, fat: 8 },
        { time: '04:00 PM (Pre-Workout)', foodItems: '1 scoop whey protein, 50g oats with water', calories: 350, protein: 30, carbs: 40, fat: 5 },
        { time: '08:30 PM (Post-Workout)', foodItems: '200g lean sirloin steak, 200g sweet potato, asparagus, olive oil drizzle', calories: 800, protein: 50, carbs: 85, fat: 28 }
      ],
      notes: 'Drink at least 3.5 liters of water daily. Feel free to swap asparagus with other green leafy vegetables.'
    });

    // 8. Create Notifications
    console.log('Creating Notifications...');
    await Notification.create({
      recipient: member1._id,
      title: 'Welcome to Elite Gym!',
      message: 'Welcome John Doe! Your membership is active. Scan your QR code at the desk to check in next time.',
      read: true
    });

    await Notification.create({
      recipient: member2._id,
      title: 'New Workout Plan Uploaded',
      message: 'Sarah Connor has assigned you the "Hypertrophy Conditioning Phase 1" plan. Let us know how it goes!',
      read: false
    });

    console.log('Database Seeding finished successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error: ', err.message);
    mongoose.connection.close();
  }
};

seedDatabase();
