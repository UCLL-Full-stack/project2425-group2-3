import {handleFetchErrors} from '../util/fetchErrors';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getRoles = async () => {
    const response = await fetch(`${API_URL}/api/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await handleFetchErrors(response);
};

const getRole = async (roleId: string) => {
    const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await handleFetchErrors(response);
};

const addRole = async (role: any) => {
    const response = await fetch(`${API_URL}/api/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(role),
    });
    return await handleFetchErrors(response);
};

const updateRole = async (roleId: string, role: any) => {
    const response = await fetch(`${API_URL}/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(role),
    });
    return await handleFetchErrors(response);
};

const RoleService = {
    getRoles,
    getRole,
    addRole,
    updateRole,
};

export default RoleService;