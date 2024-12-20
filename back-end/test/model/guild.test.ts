import { describe, it, expect } from '@jest/globals';
import { Guild } from '../../model/guild';
import { PermissionEntry, Member, KanbanPermission } from '../../types';

describe('Guild Model', () => {
    it('should create a Guild instance with given properties', () => {
        const mockSettings: PermissionEntry[] = [
            { identifier: 'READ', kanbanPermission: [KanbanPermission.VIEW_BOARD] }
        ];
        const mockMembers: Member[] = [
            { userId: 'user1', roleIds: ['role1'] }
        ];
        const mockRoleIds = ['role1'];
        const mockBoardIds = ['board1'];

        const guild = new Guild(
            'guild1',
            'Test Guild',
            'owner1',
            mockSettings,
            mockRoleIds,
            mockMembers,
            mockBoardIds
        );

        expect(guild).toBeDefined();
        expect(guild.getGuildId()).toBe('guild1');
        expect(guild.getGuildName()).toBe('Test Guild');
        expect(guild.getGuildOwnerId()).toBe('owner1');
        expect(guild.getSettings()).toEqual(mockSettings);
        expect(guild.getRoleIds()).toEqual(mockRoleIds);
        expect(guild.getMembers()).toEqual(mockMembers);
        expect(guild.getBoardIds()).toEqual(mockBoardIds);
    });

    it('should throw an error if required properties are missing or invalid', () => {
        const mockSettings: PermissionEntry[] = [
            { identifier: 'READ', kanbanPermission: [KanbanPermission.VIEW_BOARD] }
        ];
        const mockMembers: Member[] = [
            { userId: 'user1', roleIds: ['role1'] }
        ];
        const mockRoleIds = ['role1'];
        const mockBoardIds = ['board1'];

        expect(() => new Guild('guild1', '', 'owner1', mockSettings, mockRoleIds, mockMembers, mockBoardIds)).toThrowError('Guild name cannot be empty.');
        expect(() => new Guild('guild1', 'Test Guild', 'owner1', [], mockRoleIds, mockMembers, mockBoardIds)).toThrowError('Settings cannot be empty.');
        expect(() => new Guild('guild1', 'Test Guild', 'owner1', mockSettings, mockRoleIds, [], mockBoardIds)).toThrowError('Members cannot be empty.');
    });
});