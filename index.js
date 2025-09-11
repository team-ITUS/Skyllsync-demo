const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');
const { seedDefaultRoles, seedStaffAdmin } = require('./services/seedRoles');

dotenv.config();

//import router
const {adminRouter} = require('./routes/adminRouter');
const {accessorRouter} = require('./routes/accessorRouter');
const {trainerRouter} = require('./routes/trainerRouter')
const {studentRouter} = require('./routes/resisterStudentRouter');
const {categoryRouter} = require('./routes/categoryRouter');
const {courseRouter} = require('./routes/courseRouter');
const {sessionRouter} = require('./routes/sessionRouter');
const { lessonRouter } = require('./routes/lessonRouter');
const {enrollStudentRouter} = require('./routes/enrolledStudentRouter');
const {batchRouter} = require('./routes/batchRouter');
const {certificateRouter} = require('./routes/certificateRouter');
const {branchRouter} = require('./routes/branchRouter');
const {taskRouter} = require('./routes/taskRouter');
const { quizRouter } = require('./routes/quizRouter');
const {issuedCertificateRouter} = require('./routes/issuedCertificateRouter');
const {profileRouter} = require('./routes/profileRouter');
const {questionRouter} = require('./routes/questionRouter');
const {otpRouter} = require('./routes/otpRouter');
const {waCredRouter} = require('./routes/waCredRouter');
const {licenseRouter} = require('./routes/licenseRouter');
//set env configuration
connectDB().then(async () => {
  try { await seedDefaultRoles(); await seedStaffAdmin(); } catch (e) { console.warn('Seeding roles/restricted admin failed:', e?.message); }
});


//set middleware
const app = express();
app.use(express.json());
// const allowedOrigins = ['https://skyllsync.com', 'https://www.skyllsync.com'];
// Include common local dev ports (3000 React CRA, 3001 alt, 5173 Vite default, 5174 alt)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you're using cookies or Authorization headers
}));


// Increase payload limits for JSON and URL‑encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads/images', express.static('uploads/images'));
app.use('/uploads/videos', express.static('uploads/videos'));
app.use('/uploads/pdfs', express.static('uploads/pdfs'));


//add router here
app.use("/admin",adminRouter);
app.use("/accessor",accessorRouter);
app.use("/trainer",trainerRouter);
app.use('/student', studentRouter);
app.use('/category',categoryRouter);
app.use('/course',courseRouter);
app.use('/session',sessionRouter);
app.use('/lesson',lessonRouter);
app.use('/enroll',enrollStudentRouter);
app.use('/batch',batchRouter);
app.use('/certificate', certificateRouter);
app.use('/branch',branchRouter);
app.use('/task',taskRouter);
app.use('/quiz', quizRouter);
app.use('/issuedCert',issuedCertificateRouter);
app.use('/profile', profileRouter);
app.use('/question',questionRouter);
app.use('/otp',otpRouter);
app.use('/wacred', waCredRouter);
app.use('/license', licenseRouter);



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});