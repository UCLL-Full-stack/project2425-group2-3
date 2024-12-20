import { describe, it, expect, jest } from '@jest/globals';
import UserService from '../../service/user.service';
import { User } from '../../model/user';
import { Board } from '../../model/board';
import { Guild } from '../../model/guild';
import userDb from '../../repository/user.db';
import boardDb from '../../repository/board.db';
import guildDb from '../../repository/guild.db';
import roleDb from '../../repository/role.db';
import { KanbanPermission, DiscordPermission } from '../../types';

describe('User Service', () => {
    const mockUsers: User[] = [
        new User('user1', 'TestUser1', 'globalName1', 'avatar1.png', ['guild1']),
        new User('user2', 'TestUser2', 'globalName2', 'avatar2.png', ['guild2'])
    ];

    // Mocking the database methods
    jest.spyOn(userDb, 'getAllUsers').mockResolvedValue(mockUsers);
    jest.spyOn(userDb, 'getUserById').mockImplementation(async (id: string) => {
        const user = mockUsers.find(user => user.getUserId() === id);
        if (user) {
            return user;
        }
        throw new Error('User not found');
    });

    it('should retrieve all users', async () => {
        const users = await UserService.getAllUsers();
        expect(users).toEqual(mockUsers);
    });

    it('should retrieve a user by ID', async () => {
        const user = await UserService.getUserById('user1');
        expect(user).toBeDefined();
        expect(user?.getUserId()).toBe('user1');
    });

    it('should return null if user is not found', async () => {
        jest.spyOn(userDb, 'getUserById').mockImplementation(async (id: string) => {
            const user = mockUsers.find(user => user.getUserId() === id);
            if (user) {
                return user;
            }
            throw new Error('User not found');
        });
        try {
            await UserService.getUserById('nonexistent');
        } catch (error) {
            expect(error).toEqual(new Error('User not found'));
        }
    });

    it('should retrieve all Kanban permissions for a board', async () => {
        const mockBoard = new Board(
            'board1',
            'Test Board',
            "user1",
            ["column1"],
            "guild1",
            [
                { identifier: 'user1', kanbanPermission: [KanbanPermission.VIEW_BOARD] },
                { identifier: DiscordPermission.ADMINISTRATOR, kanbanPermission: [KanbanPermission.EDIT_BOARD] }
            ]
        );

        jest.spyOn(boardDb, 'getBoardById').mockResolvedValue(mockBoard);
        jest.spyOn(UserService, 'getAllDiscordPermissionsForGuild').mockResolvedValue([DiscordPermission.ADMINISTRATOR]);

        const permissions = await UserService.getAllKanbanPermissionsForBoard('user1', 'board1');
        expect(permissions).toEqual([KanbanPermission.ADMINISTRATOR]);
    });
});