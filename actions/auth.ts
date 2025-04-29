"use server";

import {signOut} from "@/auth";

/**
 * This action will log out the current user.
 */
export async function logout() {
    await signOut();
}