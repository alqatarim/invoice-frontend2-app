'use server'

export async function loginAction(prevState, formData) {
  return {
    success: false,
    error: 'Use the NextAuth client sign-in flow from the login page.'
  }
}
