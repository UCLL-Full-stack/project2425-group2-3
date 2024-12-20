import { Router } from 'express';
import taskService from '../service/task.service';
import { requireAuth } from '../util/helperFunctions';

const taskRouter = Router();

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
 *           description: Description of the task
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date of the task
 *         assignees:
 *           type: array
 *           items:
 *             type: string
 *             description: List of user IDs assigned to the task
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRouter.put('/:taskId', requireAuth, async (req, res, next) => {
    const { taskId } = req.params;
    const updatedTask = req.body;
    try {
        const task = await taskService.updateTask(taskId, updatedTask);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRouter.delete('/:taskId', requireAuth, async (req, res, next) => {
    const { taskId } = req.params;
    try {
        await taskService.deleteTask(taskId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRouter.post('/', requireAuth, async (req, res, next) => {
    const task = req.body;
    try {
        const createdTask = await taskService.addTask(task);
        res.status(201).json(createdTask);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve a specific task by ID
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRouter.get('/:taskId', requireAuth, async (req, res, next) => {
    const { taskId } = req.params;
    try {
        const task = await taskService.getTaskById(taskId);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

export default taskRouter;
