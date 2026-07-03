const User = require('../models/User');
const MemberProfile = require('../models/MemberProfile');
const Subscription = require('../models/Subscription');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

// @desc    Get dashboard metrics & analytics based on role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      // 1. Core counters
      const totalMembers = await User.countDocuments({ role: 'member' });
      const activeMembers = await MemberProfile.countDocuments({ subscriptionStatus: 'active' });
      const totalTrainers = await User.countDocuments({ role: 'trainer' });
      
      // Calculate total revenue
      const payments = await Payment.find({ status: 'succeeded' });
      const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

      // 2. Member registration growth (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const growthData = await User.aggregate([
        {
          $match: {
            role: 'member',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Format growth data into labels like "Jan", "Feb"
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedGrowth = growthData.map(item => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        members: item.count
      }));

      // 3. Class scheduling stats (capacity vs enrollment)
      const classes = await Class.find().populate('trainer', 'name');
      const classStats = classes.map(c => ({
        name: c.name,
        trainer: c.trainer?.name || 'N/A',
        enrolled: c.enrolled.length,
        capacity: c.capacity,
        fillRate: c.capacity > 0 ? Math.round((c.enrolled.length / c.capacity) * 100) : 0
      }));

      // 4. Attendance overview (Present, Late, Absent)
      const attendanceSummary = await Attendance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedAttendance = { Present: 0, Late: 0, Absent: 0 };
      attendanceSummary.forEach(item => {
        if (formattedAttendance[item._id] !== undefined) {
          formattedAttendance[item._id] = item.count;
        }
      });

      // 5. Recent subscription logs
      const recentPayments = await Payment.find()
        .populate('member', 'name email')
        .populate('plan', 'name price')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalMembers,
            activeMembers,
            totalTrainers,
            totalRevenue
          },
          growth: formattedGrowth,
          classes: classStats,
          attendance: formattedAttendance,
          recentPayments
        }
      });
    }

    if (role === 'trainer') {
      const trainerId = req.user.id;

      // 1. My Class Scheduler Details
      const classes = await Class.find({ trainer: trainerId })
        .populate('enrolled', 'name email');
      const totalClasses = classes.length;

      // 2. Count distinct members assigned to trainer
      const classMemberIds = classes.flatMap(c => c.enrolled.map(u => u._id));
      const workoutPlans = await WorkoutPlan.find({ trainer: trainerId });
      const planMemberIds = workoutPlans.map(p => p.member);
      const uniqueMemberIds = [...new Set([...classMemberIds, ...planMemberIds])];
      const totalMembers = uniqueMemberIds.length;

      // 3. Next upcoming class
      const now = new Date();
      const upcomingClass = await Class.findOne({ trainer: trainerId, startTime: { $gte: now } })
        .sort({ startTime: 1 });

      // 4. Active workout and diet plans issued by trainer
      const activeWorkoutPlans = await WorkoutPlan.countDocuments({ trainer: trainerId, status: 'active' });
      const activeDietPlans = await DietPlan.countDocuments({ trainer: trainerId, status: 'active' });

      // 5. Class performance logs (attendance rates)
      const classIds = classes.map(c => c._id);
      const classAttendanceData = await Attendance.aggregate([
        {
          $match: {
            class: { $in: classIds }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedAttendance = { Present: 0, Late: 0, Absent: 0 };
      classAttendanceData.forEach(item => {
        if (formattedAttendance[item._id] !== undefined) {
          formattedAttendance[item._id] = item.count;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalClasses,
            totalMembers,
            activeWorkoutPlans,
            activeDietPlans
          },
          upcomingClass,
          myClasses: classes.map(c => ({
            id: c._id,
            name: c.name,
            startTime: c.startTime,
            endTime: c.endTime,
            enrolledCount: c.enrolled.length,
            capacity: c.capacity
          })),
          attendance: formattedAttendance
        }
      });
    }

    if (role === 'member') {
      const memberId = req.user.id;

      // 1. Get member profile and subscription details
      const profile = await MemberProfile.findOne({ user: memberId }).populate('membershipPlan');
      const activeSubscription = await Subscription.findOne({ member: memberId, status: 'active' })
        .populate('plan');

      // 2. Fetch active plans
      const activeWorkoutPlan = await WorkoutPlan.findOne({ member: memberId, status: 'active' })
        .populate('trainer', 'name');
      const activeDietPlan = await DietPlan.findOne({ member: memberId, status: 'active' })
        .populate('trainer', 'name');

      // 3. Count attended classes
      const attendanceCount = await Attendance.countDocuments({ member: memberId, status: 'Present' });
      const lateCount = await Attendance.countDocuments({ member: memberId, status: 'Late' });

      // 4. Get upcoming booked classes
      const now = new Date();
      const bookedClasses = await Class.find({ enrolled: memberId, startTime: { $gte: now } })
        .populate('trainer', 'name')
        .sort({ startTime: 1 });

      // 5. Build recent checkins logs
      const recentCheckins = await Attendance.find({ member: memberId })
        .populate('class', 'name startTime')
        .sort({ date: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        data: {
          subscription: activeSubscription,
          profile,
          plans: {
            workout: activeWorkoutPlan,
            diet: activeDietPlan
          },
          attendanceMetrics: {
            present: attendanceCount,
            late: lateCount,
            totalCheckins: attendanceCount + lateCount
          },
          bookedClasses,
          recentCheckins
        }
      });
    }

    res.status(400).json({ success: false, error: 'Invalid user role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
