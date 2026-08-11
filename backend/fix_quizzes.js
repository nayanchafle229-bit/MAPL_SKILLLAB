const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const quizzes = await db.collection('quizzes').find({}).toArray();
  const emptyQuizzes = quizzes.filter(q => !q.questions || q.questions.length === 0);
  for (const q of emptyQuizzes) {
    const matchQ = await db.collection('questions').find({ category: q.category, level: q.level }).toArray();
    console.log('Quiz:', q.category, q.level, '-> matching questions:', matchQ.length);
  }
  process.exit(0);
});
