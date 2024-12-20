import { DiscordPermission } from "../types";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
    auth?: any;
}
import { expressjwt } from "express-jwt";

export function convertToDiscordPermissions(discordPermissions: string[]): DiscordPermission[] {
    return discordPermissions
        .map((perm) => DiscordPermission[perm as keyof typeof DiscordPermission])
        .filter((perm): perm is DiscordPermission => perm !== undefined);
}

const authorizationMiddleware = expressjwt({
    secret: process.env.JWT_SECRET || "default_secret",
    algorithms: ["HS256"],
    credentialsRequired: false,
});

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

export default authorizationMiddleware;
