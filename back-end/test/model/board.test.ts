import { describe, it, expect } from '@jest/globals';
import { Board } from '../../model/board';
import { User } from '../../model/user';
import { Guild } from '../../model/guild';
import { Column } from '../../model/column';
import { PermissionEntry, KanbanPermission, DiscordPermission } from '../../types';

describe('Board Model', () => {
    it('should create a Board instance with given properties', () => {
        const mockUser = new User(
            'user1',
            'TestUser',
            'TestGlobalName',
            'avatar.png',
            ['guild1']
        );

        const mockPermissionSettings: PermissionEntry[] = [{
            identifier: DiscordPermission.ADMINISTRATOR,
            kanbanPermission: [KanbanPermission.VIEW_BOARD],
            
        }];

        const mockGuild = new Guild(
            'guild1',
            'Test Guild', 
            'owner1',
            mockPermissionSettings,
            ['role1'],
            [{ userId: 'user1', roleIds: ['role1'] }],
            ['board1']
        );

        const mockColumns = [
            new Column('column1', 'Column 1', 0, [], 'board1')
        ];

        const mockPermissions: PermissionEntry[] = [
            {
                identifier: 'permission1',
                kanbanPermission: [
                    KanbanPermission.VIEW_BOARD,
                    KanbanPermission.EDIT_BOARD
                ]
            }
        ];

        const board = new Board(
            'board1',
            'Test Board',
            mockUser.getUserId(),
            mockColumns.map(column => column.getColumnId()),
            mockGuild.getGuildId(),
            mockPermissions
        );

        expect(board).toBeDefined();
        expect(board.getBoardId()).toBe('board1');
        expect(board.getBoardName()).toBe('Test Board');
        expect(board.getCreatedByUserId()).toBe(mockUser.getUserId());
        expect(board.getGuildId()).toBe(mockGuild.getGuildId());
        expect(board.getColumnIds()).toEqual(mockColumns.map(column => column.getColumnId()));
        expect(board.getPermissions()).toEqual(mockPermissions);
    });

    it('should throw an error if required properties are missing', () => {
        const mockUser = new User(
            'user1',
            'TestUser',
            'TestGlobalName',
            'avatar.png',
            ['guild1']
        );

        const mockPermissionSettings: PermissionEntry[] = [{
            identifier: DiscordPermission.ADMINISTRATOR,
            kanbanPermission: [KanbanPermission.VIEW_BOARD]
        }];

        const mockGuild = new Guild(
            'guild1',
            'Test Guild',
            'owner1',
            mockPermissionSettings,
            ['role1'],
            [{ userId: 'user1', roleIds: ['role1'] }],
            ['board1']
        );

        const mockColumns = [
            new Column('column1', 'Column 1', 0, [], 'board1')
        ];

        const mockPermissions: PermissionEntry[] = [
            {
                identifier: 'permission1',
                kanbanPermission: [KanbanPermission.VIEW_BOARD]
            }
        ];

        expect(() => new Board('board1', '', mockUser.getUserId(), mockColumns.map(column => column.getColumnId()), mockGuild.getGuildId(), mockPermissions)).toThrowError('Board name cannot be empty.');
        expect(() => new Board('board1', 'Test Board', "", mockColumns.map(column => column.getColumnId()), mockGuild.getGuildId(), mockPermissions)).toThrowError('Created by user ID cannot be empty.');
        expect(() => new Board('board1', 'Test Board', mockUser.getUserId(), mockColumns.map(column => column.getColumnId()), "", mockPermissions)).toThrowError('Guild ID cannot be empty.');
        expect(() => new Board('board1', 'Test Board', mockUser.getUserId(), mockColumns.map(column => column.getColumnId()), mockGuild.getGuildId(), [])).toThrowError('Permissions cannot be empty.');
    });
});