const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getTask = async (taskId: string) => {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}

const updateTask = async (taskId: string, task: any) => {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    return await response.json();
};

const deleteTask = async (taskId: string) => {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to delete column: ${response.statusText}`);
    }
    if (response.status !== 204) {
        await response.json();
    }
};

const addTask = async (task: any) => {
    const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    });
    return await response.json();
};

const TaskService = {
    getTask,
    updateTask,
    deleteTask,
    addTask,
};

export default TaskService;