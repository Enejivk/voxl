import { lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

// Public routes (no auth required)
const publicRoutes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('./pages/HomePage'))
  },
  {
    path: '/record',
    Component: lazy(() => import('./pages/RecordPage'))
  },
  {
    path: '/result',
    Component: lazy(() => import('./pages/TranscriptionResultPage'))
  },
  {
    path: '/terms',
    Component: lazy(() => import('./pages/TermsPage'))
  },
  {
    path: '*',
    Component: lazy(() => import('./pages/NotFoundPage'))
  }
];

export const router = createBrowserRouter([
  ...publicRoutes
]);
