import { PROFILE } from "@/content/profile";

/**
 * Index only when this build serves the real domain. Vercel sets VERCEL_PROJECT_PRODUCTION_URL
 * to the project's production host; previews and *.vercel.app builds stay out of search so they
 * never compete with hitarthdesai.com.
 */
export const IS_CANONICAL_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL === new URL(PROFILE.url).host && process.env.VERCEL_ENV === "production";
