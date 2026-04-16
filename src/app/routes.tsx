import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { Landing } from './pages/landing/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthorLayout } from './components/layout/AuthorLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { PageSkeleton, DashboardSkeleton, CourseListSkeleton } from './components/skeletons/PageSkeleton';

// Author pages — eager load main pages
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { AuthorCourses } from './pages/author/AuthorCourses';
import { AuthorCourseBuilder } from './pages/author/AuthorCourseBuilder';
// Heavy/secondary pages — lazy load
const AuthorStudents = lazy(() => import('./pages/author/AuthorStudents').then(m => ({ default: m.AuthorStudents })));
const AuthorAnalytics = lazy(() => import('./pages/author/AuthorAnalytics').then(m => ({ default: m.AuthorAnalytics })));
const AuthorCRM = lazy(() => import('./pages/author/AuthorCRM').then(m => ({ default: m.AuthorCRM })));
const CourseUniverse = lazy(() => import('./pages/author/CourseUniverse').then(m => ({ default: m.CourseUniverse })));
const AuthorHomeworkReview = lazy(() => import('./pages/author/AuthorHomeworkReview').then(m => ({ default: m.AuthorHomeworkReview })));

// Student pages — eager
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentLesson } from './pages/student/StudentLesson';
const StudentCatalog = lazy(() => import('./pages/student/StudentCatalog').then(m => ({ default: m.StudentCatalog })));
const StudentHomework = lazy(() => import('./pages/student/StudentHomework').then(m => ({ default: m.StudentHomework })));
const StudentProgress = lazy(() => import('./pages/student/StudentProgress').then(m => ({ default: m.StudentProgress })));

// Other
const CuratorDashboard = lazy(() => import('./pages/curator/CuratorDashboard').then(m => ({ default: m.CuratorDashboard })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const ChatPage = lazy(() => import('./pages/chat/ChatPage').then(m => ({ default: m.ChatPage })));

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#F5F4F2] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 text-center">
          <h2 className="text-[28px] font-bold text-[#1A1A2E] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h2>
          <p className="text-[13px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
            Эта страница будет реализована в следующих версиях
          </p>
        </div>
      </div>
    </div>
  );
}

const Lazy = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <Suspense fallback={fallback || <PageSkeleton />}>{children}</Suspense>
);

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Author
  {
    path: '/author',
    element: <ProtectedRoute allowedRoles={['author']}><AuthorLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AuthorDashboard /> },
      { path: 'courses', element: <AuthorCourses /> },
      { path: 'courses/new', element: <AuthorCourseBuilder /> },
      { path: 'courses/:id', element: <AuthorCourseBuilder /> },
      { path: 'students', element: <Lazy fallback={<DashboardSkeleton />}><AuthorStudents /></Lazy> },
      { path: 'homework', element: <Lazy><AuthorHomeworkReview /></Lazy> },
      { path: 'analytics', element: <Lazy fallback={<DashboardSkeleton />}><AuthorAnalytics /></Lazy> },
      { path: 'crm', element: <Lazy fallback={<DashboardSkeleton />}><AuthorCRM /></Lazy> },
      { path: 'course-universe', element: <Lazy><CourseUniverse /></Lazy> },
      { path: 'chat', element: <Lazy><ChatPage /></Lazy> },
      { path: 'calendar', element: <Lazy><Calendar /></Lazy> },
      { path: 'pages', element: <Placeholder title="Страницы школы" /> },
      { path: 'team', element: <Placeholder title="Команда" /> },
      { path: 'flows', element: <Placeholder title="Потоки и группы" /> },
      { path: 'payments', element: <Placeholder title="Платежи" /> },
      { path: 'content', element: <Placeholder title="Библиотека контента" /> },
    ],
  },

  // Student
  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'catalog', element: <Lazy fallback={<CourseListSkeleton />}><StudentCatalog /></Lazy> },
      { path: 'courses', element: <StudentCourses /> },
      { path: 'courses/:id/lesson/:lessonId', element: <StudentLesson /> },
      { path: 'homework', element: <Lazy><StudentHomework /></Lazy> },
      { path: 'progress', element: <Lazy fallback={<DashboardSkeleton />}><StudentProgress /></Lazy> },
      { path: 'chat', element: <Lazy><ChatPage /></Lazy> },
      { path: 'calendar', element: <Lazy><Calendar /></Lazy> },
      { path: 'payments', element: <Placeholder title="Платежи" /> },
      { path: 'profile', element: <Placeholder title="Профиль" /> },
    ],
  },

  // Curator
  {
    path: '/curator',
    element: <ProtectedRoute allowedRoles={['curator']}><Lazy fallback={<DashboardSkeleton />}><CuratorDashboard /></Lazy></ProtectedRoute>,
  },

  // Admin
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']}><Placeholder title="Личный кабинет администратора" /></ProtectedRoute>,
  },

  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2]">
        <div className="text-center">
          <h1 className="text-[64px] font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>404</h1>
          <p className="text-[16px] text-[#8A8A9A] mb-6" style={{ fontFamily: 'var(--font-body)' }}>Страница не найдена</p>
          <a href="/" className="text-[#7C6AF7] hover:underline font-medium" style={{ fontFamily: 'var(--font-body)' }}>← Вернуться на главную</a>
        </div>
      </div>
    ),
  },
], { basename });
