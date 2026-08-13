// Yeh file per-test leaderboard (rank), percentile aur topper-vs-self analysis calculate karti hai
const TestAttempt = require('../models/TestAttempt');
const mongoose = require('mongoose');

// PUBLIC: Ek specific test ke top scorers dikhana + current user ka rank
exports.getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;

    // Har user ka is test ka best attempt lo (agar multiple baar diya ho to sabse acha score)
    const bestAttempts = await TestAttempt.aggregate([
      { $match: { test: new mongoose.Types.ObjectId(testId) } },
      { $sort: { score: -1, timeTakenSeconds: 1 } }, // zyada score pehle, tie mein kam time wala aage
      {
        $group: {
          _id: '$user',
          score: { $first: '$score' },
          correctCount: { $first: '$correctCount' },
          wrongCount: { $first: '$wrongCount' },
          unattemptedCount: { $first: '$unattemptedCount' },
          totalQuestions: { $first: '$totalQuestions' },
          timeTakenSeconds: { $first: '$timeTakenSeconds' },
          attemptedAt: { $first: '$attemptedAt' },
        },
      },
      { $sort: { score: -1, timeTakenSeconds: 1 } },
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
          wrongCount: 1,
          unattemptedCount: 1,
          totalQuestions: 1,
          timeTakenSeconds: 1,
          attemptedAt: 1,
        },
      },
    ]);

    const totalCandidates = bestAttempts.length;
    const ranked = bestAttempts.map((entry, index) => {
      const rank = index + 1;
      // Percentile = kitne % candidates se aap aage hain
      const percentile = totalCandidates > 1 ? Number((((totalCandidates - rank) / (totalCandidates - 1)) * 100).toFixed(2)) : 100;
      return { ...entry, rank, percentile };
    });

    let myRank = null;
    let myPercentile = null;
    if (req.user) {
      const found = ranked.find((e) => String(e.userId) === String(req.user.id));
      myRank = found ? found.rank : null;
      myPercentile = found ? found.percentile : null;
    }

    // Topper (rank 1) ke stats, "aapka vs topper ka" comparison ke liye
    const topper = ranked[0] || null;

    // Averages - sabhi candidates ka average attempted/wrong/time
    const avg = (key) =>
      totalCandidates > 0 ? Number((bestAttempts.reduce((s, a) => s + (a[key] || 0), 0) / totalCandidates).toFixed(1)) : 0;
    const averages = {
      attempted: avg('correctCount') + avg('wrongCount'),
      wrong: avg('wrongCount'),
      timeTakenSeconds: avg('timeTakenSeconds'),
      score: avg('score'),
    };

    res.json({
      leaderboard: ranked.slice(0, 50),
      myRank,
      myPercentile,
      totalCandidates,
      topper: topper
        ? {
            name: topper.name,
            score: topper.score,
            attempted: topper.correctCount + topper.wrongCount,
            wrongCount: topper.wrongCount,
            timeTakenSeconds: topper.timeTakenSeconds,
          }
        : null,
      averages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Leaderboard laane mein error aayi', error: error.message });
  }
};
