declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			GOOGLE_CLIENT_ID: string;
			GOOGLE_CLIENT_SECRET?: string;
			GOOGLE_CALLBACK_URL: string;
			GOOGLE_OAUTH_URL: string;
			GOOGLE_ACCESS_TOKEN_URL: string;
			GOOGLE_TOKEN_INFO_URL: string;
			JWT_SECRET: string;
			PORT: string;
			SERVER_URL: string;
		}
	}
}

export {}