import { Router } from 'express';
import columnService from '../service/column.service';
import { requireAuth } from '../util/helperFunctions';

const columnRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         taskId:
 *           type: string
 *           description: Unique identifier for the task
 *         title:
 *           type: string
 *           description: Title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the task
 *         assignees:
 *           type: array
 *           items:
 *             type: string
 *           description: User IDs of the assignees
 * 
 *     Column:
 *       type: object
 *       properties:
 *         columnId:
 *           type: string
 *           description: Unique identifier for the column
 *         columnName:
 *           type: string
 *           description: Name of the column
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 * 
 *     UpdateColumn:
 *       type: object
 *       properties:
 *         columnName:
 *           type: string
 *           description: Name of the column
 *         tasks:
 *           type: array
 *           items:
 *             type: string
 *           description: List of task IDs
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/columns:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new column
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Column'
 *     responses:
 *       201:
 *         description: Column created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
columnRouter.post('/', requireAuth, async (req, res) => {
    const column = req.body;
    try {
        const createdColumn = await columnService.addColumn(column);
        res.status(201).json(createdColumn);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/columns/{columnId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve a specific column by ID
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Column retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
columnRouter.get('/:columnId', requireAuth, async (req, res) => {
    const { columnId } = req.params;
    try {
        const column = await columnService.getColumnById(columnId);
        res.status(200).json(column);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/columns/{columnId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a specific column by ID
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Column deleted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
columnRouter.delete('/:columnId', requireAuth, async (req, res) => {
    const { columnId } = req.params;
    try {
        await columnService.deleteColumn(columnId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/columns/{columnId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a specific column by ID
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateColumn'
 *     responses:
 *       200:
 *         description: Column updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
columnRouter.put('/:columnId', requireAuth, async (req, res) => {
    const { columnId } = req.params;
    const updatedColumn = req.body;
    try {
        const newColumn = await columnService.updateColumn(columnId, updatedColumn);
        res.status(200).json(newColumn);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/columns/{columnId}/tasks:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Add a task to a column
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         description: The ID of the column to add the task to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task added successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
columnRouter.post('/:columnId/tasks', requireAuth, async (req, res) => {
    const { columnId } = req.params;
    const task = req.body;
    try {
        await columnService.addTaskToColumn(columnId, task);
        res.status(201).json({ message: 'Task added successfully' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

export default columnRouter;
