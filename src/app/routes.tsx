import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { Landing } from './pages/landing/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthorLayout } from './components/layout/AuthorLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { PageSkeleton } from './components/skeletons/PageSkeleton';

// Author pages — eager (small, frequently navigated)
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { AuthorCourses } from './pages/author/AuthorCourses';
import { AuthorCourseBuilder } from './pages/author/AuthorCourseBuilder';
import { AuthorStudents } from './pages/author/AuthorStudents';
import { AuthorAnalytics } from './pages/author/AuthorAnalytics';
import { AuthorCRM } from './pages/author/AuthorCRM';
import { AuthorHomeworkReview } from './pages/author/AuthorHomeworkReview';

// Student pages — eager
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentLesson } from './pages/student/StudentLesson';
import { StudentCatalog } from './pages/student/StudentCatalog';
import { StudentHomework } from './pages/student/StudentHomework';
import { StudentProgress } from './pages/student/StudentProgress';
import { ProfilePage } from './pages/profile/ProfilePage';

// Chat — eager (used by both roles)
import { ChatPage } from './pages/chat/ChatPage';

// Curator
import { CuratorDashboard } from './pages/curator/CuratorDashboard';

// Heavy/rare — lazy load
const CourseUniverse = lazy(() => import('./pages/author/CourseUniverse').then(m => ({ default: m.CourseUniverse })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));

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

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
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
      { path: 'students', element: <AuthorStudents /> },
      { path: 'homework', element: <AuthorHomeworkReview /> },
      { path: 'analytics', element: <AuthorAnalytics /> },
      { path: 'crm', element: <AuthorCRM /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'course-universe', element: <Lazy><CourseUniverse /></Lazy> },
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
      { path: 'catalog', element: <StudentCatalog /> },
      { path: 'courses', element: <StudentCourses /> },
      { path: 'courses/:id/lesson/:lessonId', element: <StudentLesson /> },
      { path: 'homework', element: <StudentHomework /> },
      { path: 'progress', element: <StudentProgress /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'calendar', element: <Lazy><Calendar /></Lazy> },
      { path: 'payments', element: <Placeholder title="Платежи" /> },
    ],
  },

  // Curator
  {
    path: '/curator',
    element: <ProtectedRoute allowedRoles={['curator']}><CuratorDashboard /></ProtectedRoute>,
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
