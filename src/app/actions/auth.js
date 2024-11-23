'use server'

import { signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

export async function loginAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    const result = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    })

    if (result?.error) {
      return { success: false, error: result.error }
    }

    if (result?.ok) {
      // Optionally, fetch the session here
      const session = await getServerSession(authOptions);

      return { success: true };
    }


    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
}
