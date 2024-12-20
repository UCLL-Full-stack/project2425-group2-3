import { describe, it, expect } from '@jest/globals';
import { Column } from '../../model/column';

describe('Column Model', () => {
    it('should create a Column instance with given properties', () => {
        const column = new Column('column1', 'Test Column', 0, ['task1', 'task2'], 'board1');

        expect(column).toBeDefined();
        expect(column.getColumnId()).toBe('column1');
        expect(column.getColumnName()).toBe('Test Column');
        expect(column.getColumnIndex()).toBe(0);
        expect(column.getTaskIds()).toEqual(['task1', 'task2']);
        expect(column.getBoardId()).toBe('board1');
    });

    it('should throw an error if required properties are missing or invalid', () => {
        expect(() => new Column('column1', '', 0, ['task1'], 'board1')).toThrowError('Column name cannot be empty.');
        expect(() => new Column('column1', 'Test Column', undefined as any, ['task1'], 'board1')).toThrowError('Column index cannot be empty.');
        expect(() => new Column('column1', 'Test Column', 0, ['task1'], '')).toThrowError('Board ID cannot be empty.');
    });
});