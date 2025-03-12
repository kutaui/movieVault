import cookie from "@fastify/cookie";
import type { FastifyCookieOptions } from "@fastify/cookie";
import Fastify from "fastify";

import auth from "@/controllers/auth";
import jwt from "@/utils/jwt";

const fastify = Fastify({
	logger: true,
});

fastify.register(cookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
});

fastify.get("/", async (req, res) => {
	res.send({ hello: "world" });
});

fastify.get("/auth/google", auth.GoogleLogin);

fastify.get("/google/callback", auth.GoogleCallback);

fastify.listen({ port: 3099 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
