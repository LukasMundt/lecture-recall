import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/prisma";
import authConfig, {providers} from "./auth.config";

// export const config = {
//     runtime: "nodejs",
// };

export const pages = {
    signIn: "/auth/signin", error: "/auth/error"
}

export const {handlers, signIn, signOut, auth} = NextAuth({
        adapter: PrismaAdapter(prisma),
        pages: pages,
        session: {
            strategy: "jwt"
        },
        ...authConfig,
    })
;

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider();
            return {id: providerData.id, name: providerData.name};
        } else {
            return {id: provider.id, name: provider.name};
        }
    })
    .filter((provider) => provider.id !== "credentials");
