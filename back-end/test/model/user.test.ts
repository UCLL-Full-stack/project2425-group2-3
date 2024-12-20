import { describe, it, expect } from '@jest/globals';
import { User } from '../../model/user';

describe('User Model', () => {
    it('should create a User instance with given properties', () => {
        const user = new User('user1', 'TestUser', 'globalName', 'avatar.png', ['guild1']);

        expect(user).toBeDefined();
        expect(user.getUserId()).toBe('user1');
        expect(user.getUsername()).toBe('TestUser');
        expect(user.getGlobalName()).toBe('globalName');
        expect(user.getUserAvatar()).toBe('avatar.png');
        expect(user.getGuildIds()).toEqual(['guild1']);
    });

    it('should throw an error if required properties are missing or invalid', () => {
        expect(() => new User('', 'TestUser', 'globalName', 'avatar.png', ['guild1'])).toThrowError('User ID cannot be empty.');
        expect(() => new User('user1', '', 'globalName', 'avatar.png', ['guild1'])).toThrowError('Username cannot be empty.');
        expect(() => new User('user1', 'TestUser', '', 'avatar.png', ['guild1'])).toThrowError('Global name cannot be empty.');
    });
});