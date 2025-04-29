import GitHub from "next-auth/providers/github";
import {NextAuthConfig} from "next-auth";
import Google from "next-auth/providers/google";
import type {Provider} from "next-auth/providers";

export const providers: Provider[] = [
    GitHub,
    Google({
        authorization: {
            params: {
                scope:
                    "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
            },
        },
    }),
];


// Notice this is only an object, not a full Auth.js instance
export default {
    providers: providers,
    callbacks: {
        jwt({token, user}) {
            if (user) { // User is available during sign-in
                token.id = user.id
            }
            return token
        },
        session({session, token}) {
            session.user.id = token.id as string;
            return session;
        }
    },
} satisfies NextAuthConfig;
