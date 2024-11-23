// // pages/auth/error.js
'use client';

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
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
