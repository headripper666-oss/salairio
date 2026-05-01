import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { LoginPage } from '@/components/auth/LoginPage'
import { HomePage } from '@/components/home/HomePage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { MonthlySummaryPage } from '@/components/summary/MonthlySummaryPage'
import { BonusesPage } from '@/components/bonuses/BonusesPage'
import { CounterHistoryPage } from '@/components/counter/CounterHistoryPage'
import { AnnualPage } from '@/components/annual/AnnualPage'
import { AppointmentsPage } from '@/components/appointments/AppointmentsPage'
import { PayslipAnalyzerPage } from '@/components/payslip/PayslipAnalyzerPage'

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home',     element: <HomePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'summary', element: <MonthlySummaryPage /> },
      { path: 'counter', element: <CounterHistoryPage /> },
      { path: 'bonuses', element: <BonusesPage /> },
      { path: 'annual', element: <AnnualPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'analyze',     element: <PayslipAnalyzerPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
])
