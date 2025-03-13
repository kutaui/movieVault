import { GoogleCallback, GoogleLogin } from "@/controllers/auth";
import { AuthMiddleware } from "@/middlewares/auth";
import cookie from "@fastify/cookie";
import FastifyMiddleware from "@fastify/middie";
import Fastify from "fastify";

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

fastify.get("/auth/google", GoogleLogin);

fastify.get("/google/callback", GoogleCallback);

fastify.get("/movies", { preHandler: AuthMiddleware }, async (req, res) => {
	return res.send({ movies: [] });
});

fastify.listen({ port: 3099 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
