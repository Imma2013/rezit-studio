declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly GEMINI_API_KEY?: string;
    readonly GEMINI_TEXT_MODEL?: string;
    readonly GEMINI_IMAGE_MODEL?: string;
    readonly GEMINI_VIDEO_MODEL?: string;
    readonly NEXT_PUBLIC_CONVEX_URL?: string;
    readonly NEXT_PUBLIC_FIREBASE_API_KEY?: string;
    readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
    readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
    readonly NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
    readonly NEXT_PUBLIC_FIREBASE_APP_ID?: string;
    readonly [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
