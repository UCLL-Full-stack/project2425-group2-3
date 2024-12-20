import { describe, it, expect } from '@jest/globals';
import { Task } from '../../model/task';

describe('Task Model', () => {
    it('should create a Task instance with given properties', () => {
        const dueDate = new Date();
        const task = new Task('task1', 'Test Task', 'Description of test task', 1, dueDate, ['user1'], 'column1');

        expect(task).toBeDefined();
        expect(task.getTaskId()).toBe('task1');
        expect(task.getTitle()).toBe('Test Task');
        expect(task.getDescription()).toBe('Description of test task');
        expect(task.getTaskIndex()).toBe(1);
        expect(task.getDueDate()).toBe(dueDate);
        expect(task.getAssigneeIds()).toEqual(['user1']);
        expect(task.getColumnId()).toBe('column1');
    });

    it('should throw an error if required properties are missing or invalid', () => {
        const dueDate = new Date();
        expect(() => new Task('task1', '', 'Description', 1, dueDate, ['user1'], 'column1')).toThrowError('Task title cannot be empty.');
        expect(() => new Task('task1', 'Test Task', 'Description', 1, dueDate, ['user1'], '')).toThrowError('Column ID cannot be empty.');
    });
});