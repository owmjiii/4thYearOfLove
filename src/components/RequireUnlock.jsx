import { Navigate, Outlet } from 'react-router-dom'

export default function RequireUnlock() {
  return sessionStorage.getItem('unlocked')
    ? <Outlet />
    : <Navigate to="/" replace />
}