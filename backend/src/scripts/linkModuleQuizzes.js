const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
  const catMap = new Map(categories.map(c => [c._id.toString(), c.name]));
  const modules = await mongoose.connection.db.collection('modules').find({}).toArray();
  let updated = 0;
  for (const m of modules) {
    const catName = catMap.get(m.categoryId.toString());
    const quiz = await mongoose.connection.db.collection('quizzes').findOne({ category: catName, level: m.level });
    if (quiz) {
      await mongoose.connection.db.collection('modules').updateOne(
        { _id: m._id },
        { $set: { quizId: quiz._id } }
      );
      updated++;
    }
  }
  console.log(`Successfully updated quizId on ${updated} modules out of ${modules.length}!`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
