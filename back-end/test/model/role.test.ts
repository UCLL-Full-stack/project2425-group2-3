import { describe, it, expect } from '@jest/globals';
import { Role } from '../../model/role';
import { DiscordPermission } from '../../types';


describe('Role Model', () => {
    it('should create a Role instance with given properties', () => {
        const role = new Role('role1', 'Test Role', [DiscordPermission.ADMINISTRATOR, DiscordPermission.ADD_REACTIONS], 'guild1');

        expect(role).toBeDefined();
        expect(role.getRoleId()).toBe('role1');
        expect(role.getRoleName()).toBe('Test Role');
        expect(role.getPermissions()).toEqual([DiscordPermission.ADMINISTRATOR, DiscordPermission.ADD_REACTIONS]);
        expect(role.getGuildId()).toBe('guild1');
    });

    it('should throw an error if required properties are missing or invalid', () => {
        expect(() => new Role('role1', '', [DiscordPermission.ADMINISTRATOR], 'guild1')).toThrowError('Role name cannot be empty.');
        expect(() => new Role('role1', 'Test Role', [DiscordPermission.ADMINISTRATOR], '')).toThrowError('Guild ID cannot be empty.');
    });
});