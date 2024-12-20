import { Board } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CreateBoardParams {
    boardName: string;
    createdByUserId: string;
    guildId: string;
    columns: string[];
    permissions: any[];
}

interface UpdateBoardParams {
    boardName?: string;
    columnIds?: string[];
    permissions?: any[];
}

const getBoard = async (boardId: string): Promise<Board> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch board');
    }
    return await response.json();
};

const getBoardsByGuild = async (guildId: string): Promise<Board[]> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards/guild/${guildId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch guild boards');
    }
    return await response.json();
};

const createBoard = async (board: CreateBoardParams): Promise<Board> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(board),
    });
    if (!response.ok) {
        throw new Error('Failed to create board');
    }
    return await response.json();
};

const deleteBoard = async (boardId: string): Promise<void> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete board');
    }
};

const updateBoard = async (boardId: string, board: UpdateBoardParams): Promise<Board> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(board),
    });
    if (!response.ok) {
        throw new Error('Failed to update board');
    }
    return await response.json();
};

const reorderColumns = async (boardId: string, columnIds: string[]): Promise<Board> => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/boards/${boardId}/columns/reorder`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ columnIds }),
    });
    if (!response.ok) {
        throw new Error('Failed to reorder columns');
    }
    return await response.json();
};

const BoardService = {
    getBoard,
    getBoardsByGuild,
    createBoard,
    deleteBoard,
    updateBoard,
    reorderColumns,
};

export default BoardService;