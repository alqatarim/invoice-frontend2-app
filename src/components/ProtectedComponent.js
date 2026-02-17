'use client'

/**
 * Dashboard routes are already protected by server-side AuthGuard in
 * app/(dashboard)/layout.jsx. Keeping this component as a passthrough
 * avoids client-side auth race conditions and redirect loops.
 */
const ProtectedComponent = ({ children }) => children

export default ProtectedComponent
