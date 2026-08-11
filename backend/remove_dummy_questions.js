const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({
  question: String,
}, { strict: false }));

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', new mongoose.Schema({
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalQuestions: Number,
  totalMarks: Number,
  passMarks: Number
}, { strict: false }));

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find dummy questions
  const dummyQuestions = await Question.find({ question: { $regex: /What is the primary consideration for/ } });
  const dummyIds = dummyQuestions.map(q => q._id);
  
  if (dummyIds.length > 0) {
    console.log(`Found ${dummyIds.length} dummy questions. Deleting...`);
    await Question.deleteMany({ _id: { $in: dummyIds } });
    
    // Remove from quizzes
    const result = await Quiz.updateMany(
      { questions: { $in: dummyIds } },
      { $pull: { questions: { $in: dummyIds } } }
    );
    console.log(`Updated ${result.modifiedCount} quizzes to remove dummy questions.`);
    
    // Reset totals for affected quizzes
    const affectedQuizzes = await Quiz.find({ questions: { $size: 0 } });
    for (const qz of affectedQuizzes) {
      qz.totalQuestions = 0;
      qz.totalMarks = 0;
      qz.passMarks = 0;
      await qz.save();
    }
  } else {
    console.log('No dummy questions found.');
  }

  process.exit(0);
}).catch(console.error);
