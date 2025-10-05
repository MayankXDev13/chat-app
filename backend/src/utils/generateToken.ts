import jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
    jwt.sign({id}, process.env.JWT_SECRET as string, {
        expiresIn: "7d"
    });
}