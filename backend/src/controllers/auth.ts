import type { FastifyReply, FastifyRequest } from "fastify";

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const GOOGLE_OAUTH_SCOPES = [
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
];

type Querystring = {
	code: string;
	password: string;
};

async function GoogleLogin(req: FastifyRequest, res: FastifyReply) {
	const state = "some_state";
	const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
	const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
	return res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
}

async function GoogleCallback(
	req: FastifyRequest<{ Querystring: Querystring }>,
	res: FastifyReply,
) {
	console.log(req.query, "req.query");
	const { code } = req.query;
	const data = {
		code,
		client_id: GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		redirect_uri: GOOGLE_CALLBACK_URL,
		grant_type: "authorization_code",
	};
	console.log(data, "data");
	const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
		method: "POST",
		body: JSON.stringify(data),
	});

	const access_token_data = await response.json();
	console.log(access_token_data, "access_token_data");
	const { id_token } = access_token_data;
	const token_info_response = await fetch(
		`${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`,
	);
	const { email, name } = await token_info_response.json();
	console.log(email, name, "email, name");
}

export default { GoogleLogin, GoogleCallback };
