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

        // Recursive function to log all properties of an object
        // function logObject(obj, indent = '') {
        //   for (const key in obj) {
        //     if (typeof obj[key] === 'object' && obj[key] !== null) {
        //       console.log(`${indent}${key}:`);
        //       logObject(obj[key], indent + '  ');
        //     } else {
        //       console.log(`${indent}${key}: ${obj[key]}`);
        //     }
        //   }
        // }

        // // Log the entire data object
        // logObject(data);

        if (res.status === 200 && data.status === 'Success') {
          // Log the modules array
          // console.log('Modules:', data.data.permissionRes.modules);
          // Assuming data.data contains user information including roles and permissions
          return data.data;
        } else {
          throw new Error(data.message || 'Invalid credentials');
        }
      },
    }),
    // Add other providers if needed
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 3
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissionRes = user.permissionRes; // Assuming permissionRes contains permissions
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.permissionRes = token.permissionRes;
        session.user.token = token.token;

      }

      return session
    }
  }
}
