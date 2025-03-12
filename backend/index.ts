import Fastify from "fastify";

import auth from "@/controllers/auth";

const fastify = Fastify({
	logger: true,
});

fastify.get("/auth/google", auth.GoogleLogin);

fastify.get("/google/callback", auth.GoogleCallback);

fastify.listen({ port: 3099 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});
