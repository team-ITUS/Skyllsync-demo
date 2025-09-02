import { element } from 'prop-types'
import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard.jsx'))

// login forms
const AdminLogin = React.lazy(() => import('./views/sidebarPages/Loginpages/AdminLogin'))
const AccessorLogin = React.lazy(() => import('./views/sidebarPages/Loginpages/AccessorLogin'))
const AddAccessor = React.lazy(() => import('./views/sidebarPages/MainPages/AddAccessor'))
const AccessorDetails = React.lazy(() => import('./views/sidebarPages/MainPages/AccessorDetails'))
const AddTrainer = React.lazy(() => import('./views/sidebarPages/MainPages/AddTrainer'))
const TrainerDetails = React.lazy(() => import('./views/sidebarPages/MainPages/TrainerDetails'))
const CourseDetails = React.lazy(() => import('./views/sidebarPages/MainPages/CourseDetails'))
const EnrollStudentByAdmin = React.lazy(
  () => import('./views/sidebarPages/MainPages/EnrollStudentByAdmin'),
)
const EnrolledStudentDetails = React.lazy(
  () => import('./views/sidebarPages/MainPages/EnrolledStudentsDetails'),
)
const RegisteredStudentsDetails = React.lazy(
  () => import('./views/sidebarPages/MainPages/RegisteredStudentsDetails'),
)
const AddCourse = React.lazy(() => import('./views/sidebarPages/MainPages/AddCourse'))
const AddSection = React.lazy(() => import('./views/sidebarPages/MainPages/AddSection'))
const UpdateAcessor = React.lazy(() => import('./views/sidebarPages/MainPages/UpdateAcessor'))
const UpdateTrainer = React.lazy(() => import('./views/sidebarPages/MainPages/UpdateTrainer'))
const EnrollStudentDetails = React.lazy(
  () => import('./views/sidebarPages/MainPages/EnrollStudentDetails'),
)
const CreateNewBatch = React.lazy(() => import('./views/sidebarPages/MainPages/CreateNewBatch'))
const AllBatch = React.lazy(() => import('./views/sidebarPages/MainPages/BatchDetails'))
const UpdateCourse = React.lazy(() => import('./views/sidebarPages/MainPages/UpdateCourse'))
const CertificateForm = React.lazy(() => import('./views/sidebarPages/MainPages/CertificateForm'))
const AllBranches = React.lazy(() => import('./views/sidebarPages/MainPages/AllBranches'))
const AdminProfile = React.lazy(() => import('./views/sidebarPages/Loginpages/AdminProfile'))
const AccessorProfile = React.lazy(() => import('./views/sidebarPages/Loginpages/AccessorProfile'))
const TrainerProfile = React.lazy(() => import('./views/sidebarPages/Loginpages/TrainerProfile'))
const Task = React.lazy(() => import('./views/sidebarPages/MainPages/Task'))
const AllTask = React.lazy(() => import('./views/sidebarPages/MainPages/AllTask'));
const MyTask = React.lazy(()=> import('./views/sidebarPages/MainPages/MyTask'));
const AddQuiz = React.lazy(()=> 
import('./views/sidebarPages/MainPages/AddQuiz'));
const AllQuiz = React.lazy(()=> import('./views/sidebarPages/MainPages/AllQuiz'));
const AddQuestions = React.lazy(()=> import('./views/sidebarPages/MainPages/AddQuestions'));
const Appsetting = React.lazy(() => import('./views/sidebarPages/MainPages/AppSetting'));
const AddBatchStudents = React.lazy(() => import('./views/sidebarPages/MainPages/AddBatchStudents'));
const BatchMembers = React.lazy(()=>import('./views/sidebarPages/MainPages/BatchMembers'));
const CertificateTemplate = React.lazy(() => import('./views/sidebarPages/MainPages/CertificateTemplate'));
const LicenseTemplate = React.lazy(() => import('./views/sidebarPages/MainPages/LicenseTemplate'));

const routes = [
  { path: '/', name: 'Admin', element: AdminLogin },
  { path: '/accessorlogin', name: 'AccessorLogin', element: AccessorLogin },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/add-accessor', name: 'Add Accessor', element: AddAccessor },
  { path: '/accessor-details', name: 'Accessor Details', element: AccessorDetails },
  { path: '/add-trainer', name: 'Add Trainer', element: AddTrainer },
  { path: '/trainer-details', name: 'Trainer Details', element: TrainerDetails },
  { path: '/course-details', name: 'Course Details', element: CourseDetails },
  { path: '/enroll-student', name: 'Enroll Student By Admin', element: EnrollStudentByAdmin },
  { path: '/enrolled-students', name: 'Enrolled Student Details', element: EnrolledStudentDetails },
  { path: '/registered-students', name: 'Registered Students Details', element: RegisteredStudentsDetails},
  { path: '/create-course', name: 'Add Course', element: AddCourse },
  { path: '/add-section', name: 'Add Course', element: AddSection },
  { path: '/update-accessor', name: 'Update Acessor', element: UpdateAcessor },
  { path: '/update-trainer', name: 'Update Acessor', element: UpdateTrainer },
  { path: '/enroll-student-admin', name: 'Update Acessor', element: EnrollStudentDetails },
  { path: '/create-batch', name: 'Create New Batch', element: CreateNewBatch },
  { path: '/all-batch', name: 'All Batch', element: AllBatch },
  { path: '/update-course', name: 'Update Course', element: UpdateCourse },
  // { path: '/certificate', name: 'Certificate', element: CertificateForm },
  { path: '/all-branches', name: 'All Branches', element: AllBranches },
  { path: '/admin-profile', name: 'Admin Profile', element: AdminProfile },
  { path: '/profile', name: 'Profile', element: AccessorProfile },
  { path: '/trainer-profile', name: 'TrainerProfile', element: TrainerProfile },
  { path: '/add-batch-students', name: 'Add Batch Students', element: AddBatchStudents },
  { path: '/add-task', name: 'Task', element: Task },
  { path: '/task-details', name: 'All Task ', element: AllTask },
  {path: '/mytask', name: 'My Task', element: MyTask},
  {path: '/addquiz', name: 'Add Quiz', element:AddQuiz},
  {path: '/allquiz', name: 'All Quiz ', element: AllQuiz },
  {path: '/addquestions', name: 'Add Questions ', element: AddQuestions },
  {path: '/app-setting', name: 'App Setting', element: Appsetting},
  {path: '/batchmembers', name:"Batch Members", element:BatchMembers},
  { path: '/certificate-template', name: 'Certificate Template', element: CertificateTemplate },
  { path: '/license-template', name: 'License Template', element: LicenseTemplate },
]

export default routes
