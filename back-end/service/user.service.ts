import { Guild } from "../model/guild";
import { User } from "../model/user";
import boardDb from "../repository/board.db";
import guildDb from "../repository/guild.db";
import roleDb from "../repository/role.db";
import userDb from "../repository/user.db";
import { CreateUserInput, DiscordPermission, KanbanPermission, UpdateUserInput } from "../types";
import jwt from 'jsonwebtoken';

const getAllUsers = async (): Promise<User[]> => {
    return await userDb.getAllUsers();
}

const getUserById = async (userId: string): Promise<User> => {
    return await userDb.getUserById(userId);
}

const addUser = async (userData: CreateUserInput): Promise<User> => {
    return await userDb.addUser(userData);
}

const updateUser = async (userId: string, userData: UpdateUserInput): Promise<User> => {
    return await userDb.updateUser(userId, userData);
}

const getUserGuilds = async (userId: string): Promise<Guild[]> => {
    const user = await userDb.getUserById(userId);
    const guildIds = user.getGuildIds();
    return await Promise.all(guildIds.map(guildId => guildDb.getGuildById(guildId)));
}

const canUserAccessGuild = async (userId: string, guildId: string): Promise<boolean> => {
    const user = await userDb.getUserById(userId);
    return user.getGuildIds().includes(guildId);
}

const getAllKanbanPermissionsForGuild = async (userId: string, guildId: string): Promise<KanbanPermission[]> => {
    const guild = await guildDb.getGuildById(guildId);
    if(guild.getGuildOwnerId() === userId) {
        return [KanbanPermission.ADMINISTRATOR];
    }
    const permissions = guild.getSettings();
    const userRoles = guild.getMembers().find(member => member.userId === userId)?.roleIds || [];
    const roles = await Promise.all(userRoles.map(async (roleId) => await roleDb.getRoleById(roleId)));
    const rolePermissions = roles.map(role => role.getPermissions());
    const allDiscordPermissions = rolePermissions.reduce((acc, val) => acc.concat(val), []);
    let kanbanPermissions: KanbanPermission[] = [];
    for (const permission of permissions) {
        if (permission.identifier === userId) {
            kanbanPermissions = kanbanPermissions.concat(permission.kanbanPermission);
        }
        for (const role of userRoles) {
            if (permission.identifier === role) {
                kanbanPermissions = kanbanPermissions.concat(permission.kanbanPermission);
            }
        }
        for (const discordPermission of allDiscordPermissions) {
            if (permission.identifier === discordPermission) {
                kanbanPermissions = kanbanPermissions.concat(permission.kanbanPermission);
            }
        }
    }
    return kanbanPermissions;
};

const getAllDiscordPermissionsForGuild = async (userId: string, guildId: string): Promise<DiscordPermission[]> => {
    const guild = await guildDb.getGuildById(guildId);
    if(guild.getGuildOwnerId() === userId) {
        return [DiscordPermission.ADMINISTRATOR];
    }
    const userRoles = guild.getMembers().find(member => member.userId === userId)?.roleIds || [];
    const roles = await Promise.all(userRoles.map(async (roleId) => await roleDb.getRoleById(roleId)));
    const rolePermissions = roles.map(role => role.getPermissions());
    const allDiscordPermissions = rolePermissions.reduce((acc, val) => acc.concat(val), []);
    return allDiscordPermissions;
}

const getAllKanbanPermissionsForBoard = async (userId: string, boardId: string): Promise<KanbanPermission[]> => {
    const board = await boardDb.getBoardById(boardId);
    if(board.getCreatedByUserId() === userId) {
        return [KanbanPermission.ADMINISTRATOR];
    }
    const permissions = board.getPermissions();
    const userDiscordPermissions = await getAllDiscordPermissionsForGuild(userId, board.getGuildId());
    let kanbanPermissions: KanbanPermission[] = [];
    for (const permission of permissions) {
        if (permission.identifier === userId) {
            kanbanPermissions = kanbanPermissions.concat(permission.kanbanPermission);
        }
        for (const discordPermission of userDiscordPermissions) {
            if (permission.identifier === discordPermission) {
                kanbanPermissions = kanbanPermissions.concat(permission.kanbanPermission);
            }
        }
    }
    return kanbanPermissions;
}


const loginWithToken = async (userId: string): Promise<{ token: string; user: { userId: string, username: string, globalName: string} }> => {
    const user = await userDb.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const token = generateJWTtoken({
        userId: user.getUserId(),
        username: user.getUsername(),
        globalName: user.getGlobalName(),
    });

    return {
        token,
        user: {
            userId: user.getUserId(),
            username: user.getUsername(),
            globalName: user.getGlobalName(),
        },
    };
};

const generateJWTtoken = ({ userId, username, globalName }: { userId: string; username: string; globalName: string }): string => {
    const options = { expiresIn: `${process.env.JWT_EXPIRES_HOURS}h`, issuer: 'kanban_cord_app' };
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jwt.sign({ userId, username, globalName }, process.env.JWT_SECRET, options);
    } catch (error) {
        console.error('Error while generating token:', error);
        throw new Error('Error while generating token');
    }
};


export default {
    getAllUsers,
    getUserById,
    addUser,
    updateUser,
    getUserGuilds,
    canUserAccessGuild,
    getAllKanbanPermissionsForGuild,
    getAllDiscordPermissionsForGuild,
    getAllKanbanPermissionsForBoard,
    loginWithToken,
}