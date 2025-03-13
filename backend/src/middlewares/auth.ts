import { verifyToken } from "@/utils/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function AuthMiddleware(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const token = request.cookies.token;

	if (!token) {
		return reply.code(401).send({ error: "Unauthorized" });
	}

	const verifiedToken = await verifyToken(token);

	if (!verifiedToken) {
		reply.code(401).send({ error: "Unauthorized" });
	}
}
