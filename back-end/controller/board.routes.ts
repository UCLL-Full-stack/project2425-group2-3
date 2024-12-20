import { Router } from 'express';
import boardService from '../service/board.service';
import { requireAuth } from '../util/helperFunctions';

const boardRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     DiscordPermission:
 *       type: string
 *       enum: [
 *         "Add Reactions",
 *         "Administrator",
 *         "Attach Files",
 *         "Ban Members",
 *         "Change Nickname",
 *         "Connect",
 *         "Create Events",
 *         "Create Expressions",
 *         "Create Instant Invite",
 *         "Create Private Threads",
 *         "Create Public Threads",
 *         "Deafen Members",
 *         "Embed Links",
 *         "Kick Members",
 *         "Manage Channels",
 *         "Manage Emojis and Stickers",
 *         "Manage Events",
 *         "Manage Guild",
 *         "Manage Guild Expressions",
 *         "Manage Messages",
 *         "Manage Nicknames",
 *         "Manage Roles",
 *         "Manage Threads",
 *         "Manage Webhooks",
 *         "Mention Everyone",
 *         "Moderate Members",
 *         "Move Members",
 *         "Mute Members",
 *         "Priority Speaker",
 *         "Read Message History",
 *         "Request to Speak",
 *         "Send Messages",
 *         "Send Messages in Threads",
 *         "Send Polls",
 *         "Send TTS Messages",
 *         "Send Voice Messages",
 *         "Speak",
 *         "Stream",
 *         "Use Application Commands",
 *         "Use Embedded Activities",
 *         "Use External Apps",
 *         "Use External Emojis",
 *         "Use External Sounds",
 *         "Use External Stickers",
 *         "Use Soundboard",
 *         "Use Voice Activity Detection",
 *         "View Audit Log",
 *         "View Channel",
 *         "View Guild Insights",
 *         "View Creator Monetization Analytics"
 *       ]
 *     KanbanPermission:
 *       type: string
 *       enum: [
 *         "View Board",
 *         "Create Board",
 *         "Edit Board",
 *         "Delete Board",
 *         "Manage Board Permissions",
 *         "Manage Guild Settings",
 *         "Create Columns",
 *         "Delete Columns",
 *         "Edit Columns",
 *         "Create Tasks",
 *         "Edit Tasks",
 *         "Delete Tasks",
 *         "Assign Tasks",
 *         "Change Task Status",
 *         "Manage Task Assignees",
 *         "View Activity Log",
 *         "Administrator"
 *       ]
 *     Board:
 *       type: object
 *       properties:
 *         boardId:
 *           type: string
 *           description: Unique identifier for the board
 *         boardName:
 *           type: string
 *           description: Name of the board
 *         columnIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of column IDs associated with the board
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionEntry'
 *           description: List of permission entries for the board
 *     PermissionEntry:
 *       type: object
 *       properties:
 *         identifier:
 *           type: string
 *           description: ID or type of the permission entry (DiscordPermission or string)
 *         kanbanPermission:
 *           type: array
 *           items:
 *             type: string
 *           description: List of Kanban permissions associated with the identifier
 */

/**
 * @swagger
 * /api/boards/guild/{guildId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all boards in a guild
 *     parameters:
 *       - in: path
 *         name: guildId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       400:
 *         description: Error getting boards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error getting boards
 */
boardRouter.get('/guild/:guildId', requireAuth, async (req, res) => {
    const { guildId } = req.params;
    try {
        const boards = await boardService.getBoardsOfGuild(guildId);
        res.status(200).json(boards);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/boards/{boardId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a board by ID
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Error getting board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error getting board
 */
boardRouter.get('/:boardId', requireAuth, async (req, res) => {
    const { boardId } = req.params;
    try {
        const board = await boardService.getBoardById(boardId);
        res.status(200).json(board);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/boards:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Error creating board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error creating board
 */
boardRouter.post('/', requireAuth, async (req, res) => {
    const board = req.body;
    try {
        const createdBoard = await boardService.addBoard(board);
        res.status(201).json(createdBoard);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/boards/{boardId}/columns/reorder:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Reorder columns in a board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               columnIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Columns reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Columns reordered successfully
 *       400:
 *         description: Error reordering columns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error reordering columns
 */
boardRouter.put('/:boardId/columns/reorder', requireAuth, async (req, res) => {
    const { boardId } = req.params;
    const { columnIds } = req.body;
    try {
        await boardService.updateBoard(boardId, { columnIds });
        res.status(200).json({ message: 'Columns reordered successfully' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/boards/{boardId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Error updating board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error updating board
 */
boardRouter.put('/:boardId', requireAuth, async (req, res) => {
    const { boardId } = req.params;
    const board = req.body;
    try {
        const updatedBoard = await boardService.updateBoard(boardId, board);
        res.status(200).json(updatedBoard);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

/**
 * @swagger
 * /api/boards/{boardId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Board deleted successfully
 *       400:
 *         description: Error deleting board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error deleting board
 */
boardRouter.delete('/:boardId', requireAuth, async (req, res) => {
    const { boardId } = req.params;
    try {
        await boardService.deleteBoard(boardId);
        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

export default boardRouter;