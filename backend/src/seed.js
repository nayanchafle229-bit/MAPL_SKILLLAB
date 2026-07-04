require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Course = require('./models/Course');

const sampleQuestions = [
  // JavaScript
  { question: 'Which keyword declares a block-scoped variable in JavaScript?', options: { A: 'var', B: 'let', C: 'def', D: 'dim' }, correctAnswer: 'B', category: 'JavaScript', difficulty: 'easy' },
  { question: 'What does DOM stand for?', options: { A: 'Document Object Model', B: 'Data Output Module', C: 'Display Object Manager', D: 'Dynamic Object Method' }, correctAnswer: 'A', category: 'JavaScript', difficulty: 'easy' },
  { question: 'Which method adds an element to the end of an array?', options: { A: 'push()', B: 'pop()', C: 'shift()', D: 'unshift()' }, correctAnswer: 'A', category: 'JavaScript', difficulty: 'easy' },
  { question: 'What is the output of typeof null in JavaScript?', options: { A: '"null"', B: '"undefined"', C: '"object"', D: '"string"' }, correctAnswer: 'C', category: 'JavaScript', difficulty: 'medium' },
  { question: 'Which of these is NOT a JavaScript data type?', options: { A: 'Boolean', B: 'Float', C: 'String', D: 'Symbol' }, correctAnswer: 'B', category: 'JavaScript', difficulty: 'medium' },
  { question: 'What does the spread operator (...) do in JS?', options: { A: 'Declares a rest param', B: 'Expands an iterable into individual elements', C: 'Creates a deep copy', D: 'Merges two objects always' }, correctAnswer: 'B', category: 'JavaScript', difficulty: 'medium' },
  { question: 'What is a closure in JavaScript?', options: { A: 'A function with no return value', B: 'A function that retains access to its outer scope after the outer function has returned', C: 'A sealed object', D: 'An IIFE' }, correctAnswer: 'B', category: 'JavaScript', difficulty: 'hard' },
  { question: 'What does Promise.all() do when one promise rejects?', options: { A: 'Ignores the rejection', B: 'Waits for all to finish', C: 'Immediately rejects with that reason', D: 'Returns undefined' }, correctAnswer: 'C', category: 'JavaScript', difficulty: 'hard' },
  // React
  { question: 'Which hook is used for side effects in React?', options: { A: 'useState', B: 'useEffect', C: 'useContext', D: 'useRef' }, correctAnswer: 'B', category: 'React', difficulty: 'easy' },
  { question: 'What is the virtual DOM?', options: { A: 'A browser API', B: 'A lightweight in-memory copy of the real DOM', C: 'A CSS engine', D: 'A testing tool' }, correctAnswer: 'B', category: 'React', difficulty: 'easy' },
  { question: 'In React, what triggers a re-render?', options: { A: 'Any function call', B: 'State or prop change', C: 'A new import', D: 'DOM mutation' }, correctAnswer: 'B', category: 'React', difficulty: 'easy' },
  { question: 'What is the purpose of useCallback?', options: { A: 'Memoize a value', B: 'Memoize a function reference', C: 'Create a side effect', D: 'Fetch data' }, correctAnswer: 'B', category: 'React', difficulty: 'medium' },
  { question: 'What prop must each list item have in React?', options: { A: 'id', B: 'name', C: 'key', D: 'index' }, correctAnswer: 'C', category: 'React', difficulty: 'easy' },
  { question: 'What does React.memo do?', options: { A: 'Caches API responses', B: 'Prevents re-render if props unchanged', C: 'Memoizes state', D: 'Replaces Redux' }, correctAnswer: 'B', category: 'React', difficulty: 'medium' },
  { question: 'Which hook replaces componentDidMount and componentDidUpdate?', options: { A: 'useState', B: 'useLayoutEffect', C: 'useEffect', D: 'useMemo' }, correctAnswer: 'C', category: 'React', difficulty: 'medium' },
  { question: 'What is the Context API used for?', options: { A: 'Routing', B: 'Global state without prop drilling', C: 'Animations', D: 'Fetching data' }, correctAnswer: 'B', category: 'React', difficulty: 'medium' },
  // Node.js
  { question: 'What is Node.js built on?', options: { A: 'SpiderMonkey', B: 'Chakra', C: 'V8 engine', D: 'Rhino' }, correctAnswer: 'C', category: 'Node.js', difficulty: 'easy' },
  { question: 'Which module is used for file operations in Node.js?', options: { A: 'path', B: 'fs', C: 'os', D: 'http' }, correctAnswer: 'B', category: 'Node.js', difficulty: 'easy' },
  { question: 'What is npm?', options: { A: 'Node Program Manager', B: 'Node Package Manager', C: 'Network Protocol Manager', D: 'New Project Module' }, correctAnswer: 'B', category: 'Node.js', difficulty: 'easy' },
  { question: 'What is the event loop in Node.js responsible for?', options: { A: 'Memory management', B: 'Handling async operations non-blockingly', C: 'Parsing JSON', D: 'DNS resolution only' }, correctAnswer: 'B', category: 'Node.js', difficulty: 'medium' },
  { question: 'What does require() do in Node.js?', options: { A: 'Imports an ES module', B: 'Loads a CommonJS module', C: 'Creates a server', D: 'Reads a file' }, correctAnswer: 'B', category: 'Node.js', difficulty: 'easy' },
  { question: 'How do you export a function in CommonJS?', options: { A: 'export default fn', B: 'module.exports = fn', C: 'exports default fn', D: 'export fn' }, correctAnswer: 'B', category: 'Node.js', difficulty: 'easy' },
  // MongoDB
  { question: 'What type of database is MongoDB?', options: { A: 'Relational', B: 'Graph', C: 'Document-oriented NoSQL', D: 'Key-value' }, correctAnswer: 'C', category: 'MongoDB', difficulty: 'easy' },
  { question: 'What is a Mongoose schema?', options: { A: 'A SQL table definition', B: 'A blueprint defining document structure', C: 'A database connection', D: 'A query method' }, correctAnswer: 'B', category: 'MongoDB', difficulty: 'easy' },
  { question: 'Which method finds one document by its _id?', options: { A: 'findOne', B: 'findById', C: 'getById', D: 'selectOne' }, correctAnswer: 'B', category: 'MongoDB', difficulty: 'easy' },
  { question: 'What does the $set operator do in MongoDB?', options: { A: 'Replaces the whole document', B: 'Updates specific fields', C: 'Deletes fields', D: 'Increments a number' }, correctAnswer: 'B', category: 'MongoDB', difficulty: 'medium' },
  { question: 'What is an index in MongoDB?', options: { A: 'A document ID', B: 'A data structure improving query speed', C: 'A collection name', D: 'A backup copy' }, correctAnswer: 'B', category: 'MongoDB', difficulty: 'medium' },
  { question: 'What is the aggregation pipeline used for?', options: { A: 'Schema creation', B: 'Sequence of data transformation stages', C: 'Authentication', D: 'Indexing' }, correctAnswer: 'B', category: 'MongoDB', difficulty: 'hard' },
  // General CS
  { question: 'What does API stand for?', options: { A: 'Application Programming Interface', B: 'Automated Program Instruction', C: 'Application Protocol Integration', D: 'Advanced Programming Index' }, correctAnswer: 'A', category: 'General', difficulty: 'easy' },
  { question: 'What is REST?', options: { A: 'A database query language', B: 'An architectural style for distributed systems using HTTP', C: 'A JavaScript framework', D: 'A testing protocol' }, correctAnswer: 'B', category: 'General', difficulty: 'easy' },
  { question: 'What HTTP method is used to update a resource?', options: { A: 'GET', B: 'POST', C: 'PUT', D: 'DELETE' }, correctAnswer: 'C', category: 'General', difficulty: 'easy' },
  { question: 'What is JWT?', options: { A: 'JavaScript Web Template', B: 'JSON Web Token for stateless auth', C: 'Java Web Toolkit', D: 'JavaScript Worker Thread' }, correctAnswer: 'B', category: 'General', difficulty: 'medium' },
  { question: 'What does CORS stand for?', options: { A: 'Cross-Origin Resource Sharing', B: 'Cached Object Response System', C: 'Client-Origin Request Service', D: 'Cross-Object Routing Standard' }, correctAnswer: 'A', category: 'General', difficulty: 'medium' },
  { question: 'Which HTTP status code means "Not Found"?', options: { A: '200', B: '401', C: '500', D: '404' }, correctAnswer: 'D', category: 'General', difficulty: 'easy' },
  { question: 'What is bcrypt used for?', options: { A: 'Encrypting network traffic', B: 'Hashing passwords securely', C: 'Compressing files', D: 'Encoding JSON' }, correctAnswer: 'B', category: 'General', difficulty: 'medium' },
  { question: 'What is middleware in Express.js?', options: { A: 'A database driver', B: 'Functions with access to req/res in the request-response cycle', C: 'A routing engine', D: 'A template engine' }, correctAnswer: 'B', category: 'General', difficulty: 'medium' },
  { question: 'What does "async/await" simplify?', options: { A: 'Class declarations', B: 'Working with Promises in a synchronous style', C: 'Module imports', D: 'Array methods' }, correctAnswer: 'B', category: 'General', difficulty: 'medium' },
  { question: 'Which data structure is LIFO?', options: { A: 'Queue', B: 'Linked List', C: 'Stack', D: 'Tree' }, correctAnswer: 'C', category: 'General', difficulty: 'easy' },
  { question: 'What is Big O notation used for?', options: { A: 'Database indexing', B: 'Describing algorithm time/space complexity', C: 'Network latency', D: 'CSS specificity' }, correctAnswer: 'B', category: 'General', difficulty: 'medium' },
  { question: 'What is a binary search tree?', options: { A: 'A tree where left < root < right', B: 'A tree with exactly 2 children each', C: 'A hashed array', D: 'A graph with no cycles' }, correctAnswer: 'A', category: 'General', difficulty: 'hard' },
  // CSS / Web
  { question: 'What does CSS Flexbox primarily help with?', options: { A: 'Animations', B: 'One-dimensional layout', C: 'Color management', D: 'Font loading' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'What is the CSS Grid system?', options: { A: 'A flexbox extension', B: 'A two-dimensional layout system', C: 'A Bootstrap class', D: 'A media query' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'What does the z-index property control?', options: { A: 'Zoom level', B: 'Stacking order of elements', C: 'Horizontal position', D: 'Element opacity' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'What is Tailwind CSS?', options: { A: 'A component library', B: 'A utility-first CSS framework', C: 'A CSS preprocessor', D: 'A JavaScript animation library' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'Which HTML element is used for navigation links?', options: { A: '<section>', B: '<aside>', C: '<nav>', D: '<header>' }, correctAnswer: 'C', category: 'Web', difficulty: 'easy' },
  { question: 'What is semantic HTML?', options: { A: 'HTML with inline styles', B: 'HTML that conveys meaning about its content', C: 'HTML minified for production', D: 'HTML with data attributes' }, correctAnswer: 'B', category: 'Web', difficulty: 'medium' },
  { question: 'What does localStorage.setItem do?', options: { A: 'Stores data in a cookie', B: 'Saves data persistently in browser storage', C: 'Sends data to server', D: 'Stores data for one session only' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'What is a media query in CSS?', options: { A: 'A video embed tag', B: 'A rule applying styles based on device conditions', C: 'A font loading strategy', D: 'An image optimization tool' }, correctAnswer: 'B', category: 'Web', difficulty: 'easy' },
  { question: 'What is the box model in CSS?', options: { A: 'A 3D transform method', B: 'content + padding + border + margin', C: 'A flexbox container', D: 'A grid layout' }, correctAnswer: 'B', category: 'Web', difficulty: 'medium' },
  { question: 'What is a PWA?', options: { A: 'Progressive Web App built with web technologies', B: 'PHP Web Application', C: 'Private Web API', D: 'Parallel Worker Architecture' }, correctAnswer: 'A', category: 'Web', difficulty: 'medium' },
  { question: 'Which tag is used to link an external CSS file?', options: { A: '<style>', B: '<script>', C: '<link>', D: '<css>' }, correctAnswer: 'C', category: 'Web', difficulty: 'easy' },
];

const sampleCourses = [
  { title: 'JavaScript Fundamentals', description: 'Master the core concepts of JavaScript including variables, functions, closures, async/await and the DOM.', videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', category: 'JavaScript' },
  { title: 'React.js Complete Guide', description: 'Build modern UIs with React hooks, context API, React Router and best practices for production apps.', videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8', category: 'React' },
  { title: 'Node.js & Express Backend', description: 'Build scalable REST APIs with Node.js, Express, middleware, authentication and MongoDB integration.', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', category: 'Node.js' },
  { title: 'MongoDB & Mongoose', description: 'Learn NoSQL database design, CRUD operations, aggregation pipelines and Mongoose schemas with real projects.', videoUrl: 'https://www.youtube.com/watch?v=ExcRbA7fy_A', category: 'MongoDB' },
  { title: 'Full Stack MERN Project', description: 'End-to-end project building a full stack app with MongoDB, Express, React and Node.js from scratch.', videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', category: 'General' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'smartquiz' });
  console.log('Connected to MongoDB');

  await Question.deleteMany({});
  await Course.deleteMany({});

  await Question.insertMany(sampleQuestions);
  console.log(`✅ Seeded ${sampleQuestions.length} questions`);

  await Course.insertMany(sampleCourses);
  console.log(`✅ Seeded ${sampleCourses.length} courses`);

  await mongoose.disconnect();
  console.log('Done! You can now start the server.');
}

seed().catch(err => { console.error(err); process.exit(1); });
