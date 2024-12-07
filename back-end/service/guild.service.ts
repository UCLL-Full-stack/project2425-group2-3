import { Guild } from "../model/guild";
import guildDb from "../repository/guild.db";
import { CreateGuildInput, DiscordPermission, KanbanPermission, Member, PermissionEntry, UpdateGuildInput } from "../types";


const getAllGuilds = async (): Promise<Guild[]> => {
    return await guildDb.getAllGuilds();
}

const getGuildById = async (guildId: string): Promise<Guild> => {
    return await guildDb.getGuildById(guildId);
}

const addGuild = async (guildData: CreateGuildInput): Promise<Guild> => {
    const { guildId, guildName, guildOwnerId, settings = [], roleIds = [], members = [], userIds = [], boardIds = [] } = guildData;
    let updatedSettings = settings;

    if (settings.length === 0) {
        updatedSettings = [
            { identifier: DiscordPermission.ADMINISTRATOR, kanbanPermission: [KanbanPermission.ADMINISTRATOR] },
        ];
    } else {
        const adminPermission = settings.find(permission => permission.identifier === DiscordPermission.ADMINISTRATOR);
        if (!adminPermission) {
            updatedSettings = [
                ...settings,
                { identifier: DiscordPermission.ADMINISTRATOR, kanbanPermission: [KanbanPermission.ADMINISTRATOR] },
            ];
        }
    }
    const updatedGuildData = {
        ...guildData,
        settings: updatedSettings,
    };
    return await guildDb.addGuild(updatedGuildData);
}

const updateGuild = async (guildId: string, guildData: UpdateGuildInput): Promise<Guild> => {
    const guild = await guildDb.getGuildById(guildId);
    if( !guild ) {
        throw new Error("Guild not found");
    }
    return await guildDb.updateGuild(guildId, guildData);
}

const getGuildPermissions = async (guildId: string): Promise<PermissionEntry[]> => {
    const guild = await guildDb.getGuildById(guildId);
    if( !guild ) {
        throw new Error("Guild not found");
    }
    return guild.getSettings();
}

export default {
    getAllGuilds,
    getGuildById,
    addGuild,
    updateGuild,
    getGuildPermissions
}