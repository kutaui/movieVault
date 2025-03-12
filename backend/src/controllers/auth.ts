import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import jwt from "@/utils/jwt";

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const GOOGLE_OAUTH_SCOPES = [
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
];

type CallbackQueryString = {
	code: string;
	password: string;
};

const AccessTokenSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	id_token: z.string(),
	token_type: z.string(),
	scope: z.string(),
});

const TokenInfoSchema = z.object({
	email: z.string(),
	name: z.string(),
});

async function GoogleLogin(req: FastifyRequest, res: FastifyReply) {
	const state = "some_state";
	const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
	const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
	return res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
}

async function GoogleCallback(
	req: FastifyRequest<{ Querystring: CallbackQueryString }>,
	res: FastifyReply,
) {
	const { code } = req.query;
	const data = {
		code,
		client_id: GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		redirect_uri: GOOGLE_CALLBACK_URL,
		grant_type: "authorization_code",
	};
	const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
		method: "POST",
		body: JSON.stringify(data),
	});
	const accesTokenRaw = await response.json();
	const access_token_data = AccessTokenSchema.parse(accesTokenRaw);
	const { id_token } = access_token_data;
	const token_info_response = await fetch(
		`${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`,
	);
	const token_info = await token_info_response.json();
	const { email, name } = TokenInfoSchema.parse(token_info);
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
	});

	if (!user) {
		const [newUserData] = await db
			.insert(users)
			.values({
				email,
				name,
			})
			.returning({ id: users.id });

		if (!newUserData) {
			return res.send({ error: "Failed to login via Google" });
		}

		const token = jwt.createToken({ userId: newUserData.id });

		res.setCookie("token", token, {
			httpOnly: false,
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 14,
			path: "/",
		});
		return res.redirect("/");
	}

	const token = jwt.createToken({ userId: user.id });
	res.setCookie("token", token, {
		httpOnly: false,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 14,
		path: "/",
	});
	return res.redirect("/");
}

export default { GoogleLogin, GoogleCallback };
