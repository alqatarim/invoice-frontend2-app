'use client';

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{error ? `Error: ${error}` : 'An unknown error occurred.'}</p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div><h1>Authentication Error</h1><p>Loading...</p><Link href="/">Go back to Home</Link></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
