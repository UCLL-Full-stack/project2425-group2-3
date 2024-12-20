import {handleFetchErrors} from '../util/fetchErrors';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getUsers = async () => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return await handleFetchErrors(response);
};

const getUser = async (userId: string) => {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
};

const addUser = async (user: any) => {
    const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return await response.json();
};

const updateUser = async (userId: string, user: any) => {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return await response.json();
};

const getGuilds = async (userId: string) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/${userId}/guilds`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return await handleFetchErrors(response);
};

const getUserGuildKanbanPermissions = async (userId: string, guildId: string) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/${userId}/guilds/${guildId}/kanban-permissions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return await handleFetchErrors(response);
};

const getAllKanbanPermissionsForBoard = async (userId: string, boardId: string) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/users/${userId}/boards/${boardId}/kanban-permissions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return await handleFetchErrors(response);
};

const login = async (userId: string): Promise<{ token: string; userId: string; username: string; globalName: string }> => {
    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to login: ${response.statusText}`);
        }

        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

const UserService = {
    getUsers,
    getUser,
    addUser,
    updateUser,
    getGuilds,
    getUserGuildKanbanPermissions,
    getAllKanbanPermissionsForBoard,
    login,
};

export default UserService;