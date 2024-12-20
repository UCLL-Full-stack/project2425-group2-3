const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getColumnById = async (columnId: string) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/columns/${columnId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return await response.json();
};

const updateColumn = async (columnId: string, column: any) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/columns/${columnId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(column),
    });
    return await response.json();
};

const deleteColumn = async (columnId: string) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to delete column: ${response.statusText}`);
    }
    if (response.status !== 204) {
        await response.json();
    }};

const addTaskToColumn = async (columnId: string, task: any) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/columns/${columnId}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
    });
    return await response.json();
}

const addColumn = async (column: any) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/columns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(column),
    });
    return await response.json();
};

const ColumnService = {
    getColumnById,
    updateColumn,
    deleteColumn,
    addTaskToColumn,
    addColumn,
};

export default ColumnService;