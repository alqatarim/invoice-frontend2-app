// Third-party Imports
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const getResponseMessage = data => data?.data?.message || data?.message || 'Authentication failed'

const parseAuthResponse = async res => {
  const data = await res.json()

  if (res.status === 200 && data.status === 'Success') {
    return data.data
  }

  throw new Error(getResponseMessage(data))
}

const normalizeAuthUser = (authData, fallbackEmail = '') => ({
  ...authData,
  id: authData.id || authData.profileDetails?.id || '',
  email: authData.email || fallbackEmail || '',
  role: authData.role || '',
  authProvider: authData.authProvider || 'credentials',
  hasPassword: authData.hasPassword ?? true
})

const exchangeGoogleToken = async account => {
  if (!account?.id_token) {
    throw new Error('Google did not return a valid ID token.')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: account.id_token
    })
  })

  return parseAuthResponse(res)
}

const googleProviders =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: 'select_account'
            }
          }
        })
      ]
    : []

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await parseAuthResponse(res)

        return normalizeAuthUser(data, credentials.email)
      },
    }),
    ...googleProviders
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 // 24 hours to match backend JWT expiration
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true
      }

      try {
        const backendAuth = await exchangeGoogleToken(account)

        user.backendAuth = normalizeAuthUser(backendAuth, user.email)

        return true
      } catch (error) {
        return `/login?error=${encodeURIComponent(error.message || 'Google sign-in failed.')}`
      }
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        const authUser = user.backendAuth || user

        // Extract data from the backend response structure
        const profileDetails = authUser.profileDetails || {};

        token.id = authUser.id || profileDetails.id || token.sub;
        token.email = authUser.email || token.email;

        // Construct full name from firstName and lastName
        const firstName = profileDetails.firstName || '';
        const lastName = profileDetails.lastName || '';
        token.name = `${firstName} ${lastName}`.trim() || 'User';

        token.image = profileDetails.image || '';
        token.firstName = firstName;
        token.lastName = lastName;
        token.gender = profileDetails.gender || '';

        token.role = authUser.role;
        token.permissionRes = authUser.permissionRes;
        token.token = authUser.token;
        token.companyDetails = authUser.companyDetails;
        token.currencySymbol = authUser.currencySymbol;
        token.authProvider = authUser.authProvider || account?.provider || token.authProvider || 'credentials';
        token.hasPassword = authUser.hasPassword ?? token.hasPassword ?? true;
        token.iat = Date.now() / 1000; // Issued at time
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() / 1000 < token.exp) {
        return token;
      }

      // Token has expired, but we'll let the backend handle validation
      // The JWT strategy will automatically use the existing token until it truly expires
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.gender = token.gender;
        session.user.role = token.role;
        session.user.permissionRes = token.permissionRes;
        session.user.token = token.token;
        session.user.companyDetails = token.companyDetails;
        session.user.currencySymbol = token.currencySymbol;
        session.user.authProvider = token.authProvider;
        session.user.hasPassword = token.hasPassword;
      }

      return session
    }
  }
}
