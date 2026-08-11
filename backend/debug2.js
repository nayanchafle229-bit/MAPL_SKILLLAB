const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const quizzes = await db.collection('quizzes').find({}).toArray();
  console.log('Sample quiz questions field:', quizzes[0].questions);
  process.exit(0);
});
