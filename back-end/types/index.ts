export enum DiscordPermission {
    ADD_REACTIONS = "Add Reactions",
    ADMINISTRATOR = "Administrator",
    ATTACH_FILES = "Attach Files",
    BAN_MEMBERS = "Ban Members",
    CHANGE_NICKNAME = "Change Nickname",
    CONNECT = "Connect",
    CREATE_EVENTS = "Create Events",
    CREATE_EXPRESSIONS = "Create Expressions",
    CREATE_INSTANT_INVITE = "Create Instant Invite",
    CREATE_PRIVATE_THREADS = "Create Private Threads",
    CREATE_PUBLIC_THREADS = "Create Public Threads",
    DEAFEN_MEMBERS = "Deafen Members",
    EMBED_LINKS = "Embed Links",
    KICK_MEMBERS = "Kick Members",
    MANAGE_CHANNELS = "Manage Channels",
    MANAGE_EMOJIS_AND_STICKERS = "Manage Emojis and Stickers",
    MANAGE_EVENTS = "Manage Events",
    MANAGE_GUILD = "Manage Guild",
    MANAGE_EXPRESSIONS = "Manage Guild Expressions",
    MANAGE_MESSAGES = "Manage Messages",
    MANAGE_NICKNAMES = "Manage Nicknames",
    MANAGE_ROLES = "Manage Roles",
    MANAGE_THREADS = "Manage Threads",
    MANAGE_WEBHOOKS = "Manage Webhooks",
    MENTION_EVERYONE = "Mention Everyone",
    MODERATE_MEMBERS = "Moderate Members",
    MOVE_MEMBERS = "Move Members",
    MUTE_MEMBERS = "Mute Members",
    PRIORITY_SPEAKER = "Priority Speaker",
    READ_MESSAGE_HISTORY = "Read Message History",
    REQUEST_TO_SPEAK = "Request to Speak",
    SEND_MESSAGES = "Send Messages",
    SEND_MESSAGES_IN_THREADS = "Send Messages in Threads",
    SEND_POLL = "Send Polls",
    SEND_TEXT_TO_SPEECH_MESSAGES = "Send TTS Messages",
    SEND_VOICE_MESSAGES = "Send Voice Messages",
    SPEAK = "Speak",
    STREAM = "Stream",
    USE_APPLICATION_COMMANDS = "Use Application Commands",
    USE_EMBEDDED_ACTIVITIES = "Use Embedded Activities",
    USE_EXTERNAL_APPS = "Use External Apps",
    USE_EXTERNAL_EMOJIS = "Use External Emojis",
    USE_EXTERNAL_SOUNDS = "Use External Sounds",
    USE_EXTERNAL_STICKERS = "Use External Stickers",
    USE_SOUNDBOARD = "Use Soundboard",
    USE_VAD = "Use Voice Activity Detection",
    VIEW_AUDIT_LOG = "View Audit Log",
    VIEW_CHANNEL = "View Channel",
    VIEW_GUILD_INSIGHTS = "View Guild Insights",
    VIEW_CREATOR_MONETIZATION_ANALYTICS = "View Creator Monetization Analytics",
}

export enum KanbanPermission {
    VIEW_BOARD = "View Board",
    CREATE_BOARD = "Create Board",
    EDIT_BOARD = "Edit Board",
    DELETE_BOARD = "Delete Board",
    MANAGE_BOARD_PERMISSIONS = "Manage Board Permissions",
    MANAGE_GUILD_SETTINGS = "Manage Guild Settings",
    CREATE_COLUMNS = "Create Columns",
    DELETE_COLUMNS = "Delete Columns",
    EDIT_COLUMNS = "Edit Columns",
    CREATE_TASKS = "Create Tasks",
    EDIT_TASKS = "Edit Tasks",
    DELETE_TASKS = "Delete Tasks",
    ASSIGN_TASKS = "Assign Tasks",
    CHANGE_TASK_STATUS = "Change Task Status",
    MANAGE_TASK_ASSIGNEES = "Manage Task Assignees",
    VIEW_ACTIVITY_LOG = "View Activity Log",
    ADMINISTRATOR = "Administrator",
}

export interface PermissionEntry{
    identifier: string | DiscordPermission;
    kanbanPermission: KanbanPermission[];
}

export interface Member {
    userId: string;
    roleIds: string[];
}

export interface CreateUserInput {
    userId: string;
    username: string;
    globalName: string;
    userAvatar: string;
    guildIds?: string[];
    boardIds?: string[];
    taskIds?: string[];
}
  
export interface UpdateUserInput {
    username?: string;
    globalName?: string;
    userAvatar?: string;
    guildIds?: string[];
    boardIds?: string[];
    taskIds?: string[];
}

export interface CreateGuildInput {
    guildId: string;
    guildName: string;
    guildOwnerId: string;
    settings: PermissionEntry[];
    roleIds?: string[];
    userIds?: string[];
    members?: Member[];
    boardIds?: string[];
}

export interface UpdateGuildInput {
    guildName?: string;
    members?: Member[];
    roleIds?: string[];
    settings?: PermissionEntry[];
    userIds?: string[];
    boardIds?: string[];
}


export interface CreateRoleInput {
    roleId: string;
    roleName: string;
    permissions: DiscordPermission[];
    guildId: string;
}

export interface UpdateRoleInput {
    roleName?: string;
    permissions?: DiscordPermission[];
}

export interface CreateBoardInput {
    boardName: string;
    createdByUserId: string;
    guildId: string;
    columns?: string[];
    permissions?: PermissionEntry[];
}

export interface UpdateBoardInput {
    boardName?: string;
    columnIds?: string[];
    settings?: PermissionEntry[];
}

export interface CreateColumnInput {
    columnName: string;
    columnIndex: number;
    boardId: string;
    taskIds?: string[];
}

export interface UpdateColumnInput {
    columnName?: string;
    taskIds?: string[];
}

export interface CreateTaskInput {
    title: string;
    description: string;
    taskIndex: number;
    dueDate: Date;
    assigneeIds: string[];
    columnId: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    taskIndex?: number;
    dueDate?: Date;
    assigneeIds?: string[];
    columnId?: string;
}

export interface AuthenticationResponse {
    token: string;
    userId: string;
    username?: string;
    globalName?: string;
}
