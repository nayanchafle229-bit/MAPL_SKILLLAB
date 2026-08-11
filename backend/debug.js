const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const quizzes = await db.collection('quizzes').find({}).toArray();
  const questions = await db.collection('questions').find({}).toArray();
  console.log('Quizzes count:', quizzes.length);
  console.log('Questions count:', questions.length);
  console.log('Sample quiz category:', quizzes[0]?.category, 'level:', quizzes[0]?.level);
  console.log('Sample question category:', questions[0]?.category, 'level:', questions[0]?.level);
  process.exit(0);
});
