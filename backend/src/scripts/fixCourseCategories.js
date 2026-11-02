const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function fixCourses() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Fixing miscategorized courses...');

  // 1. C10L2.2 -> Category 10
  const res1 = await mongoose.connection.db.collection('courses').updateOne(
    { title: /^C10L2\.2/i },
    { $set: { category: 'Industrial Data, Historians & OT Cybersecurity' } }
  );
  console.log('Fixed C10L2.2 category:', res1.modifiedCount);

  // 2. C2L3.1 -> Category 2
  const res2 = await mongoose.connection.db.collection('courses').updateOne(
    { title: /^C2L3\.1/i },
    { $set: { category: 'Field Instrumentation, Final Control Elements & Loop Engineering' } }
  );
  console.log('Fixed C2L3.1 category:', res2.modifiedCount);

  // 3. C2L4.1 -> Category 2
  const res3 = await mongoose.connection.db.collection('courses').updateOne(
    { title: /^C2L4\.1/i },
    { $set: { category: 'Field Instrumentation, Final Control Elements & Loop Engineering' } }
  );
  console.log('Fixed C2L4.1 category:', res3.modifiedCount);

  // 4. C3L3.3 -> Category 3
  const res4 = await mongoose.connection.db.collection('courses').updateOne(
    { title: /^C3L3\.3/i },
    { $set: { category: 'Control System Hardware, Panel & Architecture Design' } }
  );
  console.log('Fixed C3L3.3 category:', res4.modifiedCount);

  // 5. C2L2.4 in Category 1 -> rename title to C1L2.4
  const res5 = await mongoose.connection.db.collection('courses').updateOne(
    { title: /^C2L2\.4.*Analysing controller action/i, category: 'Industrial Automation Concepts & Process Control' },
    { $set: { title: 'C1L2.4-Analysing controller action in a strategy' } }
  );
  console.log('Fixed C1L2.4 title:', res5.modifiedCount);

  // Check remaining in Cat 1 Adept
  const cat1Adept = await mongoose.connection.db.collection('courses').find({
    category: 'Industrial Automation Concepts & Process Control',
    level: 'adept'
  }).toArray();
  console.log('\nRemaining courses in Cat 1 Adept:');
  cat1Adept.forEach(c => console.log(' -', c.title, c.videoUrl));

  process.exit(0);
}

fixCourses().catch(console.error);
