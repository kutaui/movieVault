import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const createToken = (
	payload: object,
	expiresIn: SignOptions["expiresIn"] = "14d",
) => {
	const options = { expiresIn };

	return jwt.sign(payload, SECRET_KEY, options);
};

const verifyToken = (token: string) => {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (error) {
		return null;
	}
};

export default { createToken, verifyToken };
