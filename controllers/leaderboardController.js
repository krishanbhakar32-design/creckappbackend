// Yeh file per-test leaderboard (rank) calculate karti hai
const TestAttempt = require('../models/TestAttempt');

// PUBLIC: Ek specific test ke top scorers dikhana + current user ka rank
exports.getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    // Har user ka is test ka best attempt lo (agar multiple baar diya ho to sabse acha score)
    const bestAttempts = await TestAttempt.aggregate([
      { $match: { test: new (require('mongoose').Types.ObjectId)(testId) } },
      { $sort: { score: -1, timeTakenSeconds: 1 } }, // zyada score pehle, tie mein kam time wala aage
      {
        $group: {
          _id: '$user',
          score: { $first: '$score' },
          correctCount: { $first: '$correctCount' },
          timeTakenSeconds: { $first: '$timeTakenSeconds' },
          attemptedAt: { $first: '$attemptedAt' },
        },
      },
      { $sort: { score: -1, timeTakenSeconds: 1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          score: 1,
          correctCount: 1,
          timeTakenSeconds: 1,
          attemptedAt: 1,
        },
      },
    ]);

    const leaderboard = bestAttempts.map((entry, index) => ({ ...entry, rank: index + 1 }));

    let myRank = null;
    if (req.user) {
      const found = leaderboard.find((e) => String(e.userId) === String(req.user.id));
      myRank = found ? found.rank : null;
    }

    res.json({ leaderboard, myRank });
  } catch (error) {
    res.status(500).json({ message: 'Leaderboard laane mein error aayi', error: error.message });
  }
};
