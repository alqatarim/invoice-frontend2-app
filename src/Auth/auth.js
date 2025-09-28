// Third-party Imports
import CredentialsProvider from 'next-auth/providers/credentials'

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

        const data = await res.json();

        if (res.status === 200 && data.status === 'Success') {
          // Add the email from credentials to the returned data for use in JWT callback
          return {
            ...data.data,
            email: credentials.email
          };
        } else {
          throw new Error(data.message || 'Invalid credentials');
        }
      },
    }),
    // Add other providers if needed
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
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        // Extract data from the backend response structure
        const profileDetails = user.profileDetails || {};

        token.id = user.profileDetails?.id || token.sub; // Use token.sub as fallback
        token.email = token.email || user.email; // Email comes from credentials

        // Construct full name from firstName and lastName
        const firstName = profileDetails.firstName || '';
        const lastName = profileDetails.lastName || '';
        token.name = `${firstName} ${lastName}`.trim() || 'User';

        token.image = profileDetails.image || '';
        token.firstName = firstName;
        token.lastName = lastName;
        token.gender = profileDetails.gender || '';

        token.role = user.role;
        token.permissionRes = user.permissionRes;
        token.token = user.token;
        token.companyDetails = user.companyDetails;
        token.currencySymbol = user.currencySymbol;
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
      }

      return session
    }
  }
}
