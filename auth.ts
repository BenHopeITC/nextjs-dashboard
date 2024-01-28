import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getUser } from '@/app/lib/data';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
 
// https://authjs.dev/getting-started/providers
// https://authjs.dev/getting-started/providers/oauth-tutorial use this instead

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;

            const user = await getUser(email);
            if (!user) return null;

            // console.log(`${bcrypt.hashSync(password, 10)} and ${user.password}`);
            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch) return user;
          }

          console.log('Invalid credentials');
          return null;
        },
    }),
  ],
});