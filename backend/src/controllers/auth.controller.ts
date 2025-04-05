import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { db } from '@/db/index'
import { users } from '@/db/schema/user'
import { createToken } from '@/utils/jwt'
import { REGEX } from 'src/constants/regex'

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL
const GOOGLE_OAUTH_SCOPES = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
]

type CallbackQueryString = {
	code: string
	password: string
}

const AccessTokenSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	id_token: z.string(),
	token_type: z.string(),
	scope: z.string(),
})

const TokenInfoSchema = z.object({
	email: z.string(),
	name: z.string(),
})

const RegisterSchema = z.object({
	email: z.string().email().min(1, 'Email is required'),
	name: z.string().min(1, 'Name is required'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters long')
		.regex(
			REGEX.PASSWORD,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
		),
})

const LoginSchema = z.object({
	email: z.string().email().min(1, 'Email is required'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters long')
		.regex(
			REGEX.PASSWORD,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
		),
})

export async function GoogleLogin(req: FastifyRequest, res: FastifyReply) {
	const state = 'some_state'
	const scopes = GOOGLE_OAUTH_SCOPES.join(' ')
	const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`
	return res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL)
}

export async function GoogleCallback(
	req: FastifyRequest<{ Querystring: CallbackQueryString }>,
	res: FastifyReply
) {
	const { code } = req.query
	const data = {
		code,
		client_id: GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		redirect_uri: GOOGLE_CALLBACK_URL,
		grant_type: 'authorization_code',
	}
	const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
		method: 'POST',
		body: JSON.stringify(data),
	})
	const accesTokenRaw = await response.json()
	const access_token_data = AccessTokenSchema.parse(accesTokenRaw)
	const { id_token } = access_token_data
	const token_info_response = await fetch(
		`${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
	)
	const token_info = await token_info_response.json()
	const { email, name } = TokenInfoSchema.parse(token_info)
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
	})

	if (!user) {
		const [newUserData] = await db
			.insert(users)
			.values({
				email,
				name,
			})
			.returning({ id: users.id })

		if (!newUserData) {
			return res.send({ error: 'Failed to login via Google' })
		}

		const token = createToken({ userId: newUserData.id })

		res.setCookie('token', token, {
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 14,
			path: '/',
		})
		return res.redirect('/')
	}

	const token = createToken({ userId: user.id })
	res.setCookie('token', token, {
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 14,
		path: '/',
	})
	return res.redirect('/')
}

export async function Register(req: FastifyRequest, res: FastifyReply) {
	const { email, name, password } = RegisterSchema.parse(req.body)
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
	})

	if (user) {
		console.log('User already exists')
		res.code(400)
		return res.send({ error: 'User already exists' })
	}

	const hashedPassword = await Bun.password.hash(password)

	const [newUserData] = await db
		.insert(users)
		.values({
			email,
			name,
			password: hashedPassword,
		})
		.returning({ id: users.id })

	if (!newUserData) {
		res.code(500)
		return res.send({ error: 'Failed to register' })
	}

	const token = createToken({ userId: newUserData.id })

	res.setCookie('token', token, {
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 14,
		path: '/',
	})

	res.code(201)
	return res.send({ message: 'Registered successfully' })
}

export async function Login(req: FastifyRequest, res: FastifyReply) {
	const { email, password } = LoginSchema.parse(req.body)
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
	})

	if (!user) {
		res.code(401)
		return res.send({ error: 'User not found' })
	}

	if (!user.password) {
		res.code(401)
		return res.send({ error: 'Wrong credentials' })
	}

	const isPasswordValid = await Bun.password.verify(password, user.password)

	if (!isPasswordValid) {
		res.code(401)
		return res.send({ error: 'Invalid password' })
	}

	const token = createToken({ userId: user.id })

	res.setCookie('token', token, {
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 14,
		path: '/',
	})

	res.code(200)
	return res.send({ message: 'Logged in successfully' })
}
