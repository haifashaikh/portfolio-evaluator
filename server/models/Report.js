const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
  name: String,
  stars: Number,
  forks: Number,
  language: String,
  description: String,
  url: String,
  topics: [String],
  updatedAt: String,
});

const LanguageSchema = new mongoose.Schema({
  name: String,
  percent: Number,
  color: String,
});

const ReportSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    avatarUrl: String,
    name: String,
    bio: String,
    company: String,
    location: String,
    blog: String,
    email: String,
    twitterUsername: String,
    followers: Number,
    following: Number,
    publicRepos: Number,
    publicGists: Number,
    createdAt_gh: String, // GitHub account creation date

    scores: {
      activity: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      diversity: { type: Number, default: 0 },
      community: { type: Number, default: 0 },
      hiringReady: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },

    topRepos: [RepoSchema],
    languages: [LanguageSchema],

    // Contribution heatmap: { 'YYYY-MM-DD': count }
    heatmapData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Weekly contribution data for the heatmap chart
    weeklyContributions: [Number],

    // Activity details
    activityDetails: {
      commitsLast90Days: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      activeDaysLast90: { type: Number, default: 0 },
      totalEventsLast90: { type: Number, default: 0 },
    },

    shareUrl: String,
    cachedAt: { type: Date, default: Date.now },
    // TTL index: MongoDB will auto-delete documents when expiresAt is reached
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// TTL index for cached reports
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', ReportSchema);
