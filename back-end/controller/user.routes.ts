import { Router } from "express";
import userService from "../service/user.service";
import { UpdateUserInput } from "../types";
import { requireAuth } from "../util/helperFunctions";

const userRouter = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Username of the user
 *         globalName:
 *           type: string
 *           description: Global name of the user
 *         userAvatar:
 *           type: string
 *           description: URL of the user's avatar
 *         guildIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of guild IDs the user is part of
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/", requireAuth, async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/:userId", async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post("/", async (req, res, next) => {
    try {
        const { userId, username, globalName, userAvatar, guildIds = [] } = req.body;
        const user = await userService.addUser({ userId, username, globalName, userAvatar, guildIds });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.put("/:userId", async (req, res, next) => {
    const { userId } = req.params;
    const { username, globalName, userAvatar, guildIds, boardIds, taskIds } = req.body;

    const updateInput: UpdateUserInput = {};
    if (username) updateInput.username = username;
    if (globalName) updateInput.globalName = globalName;
    if (userAvatar) updateInput.userAvatar = userAvatar;
    if (guildIds) updateInput.guildIds = guildIds;
    if (boardIds) updateInput.boardIds = boardIds;
    if (taskIds) updateInput.taskIds = taskIds;

    try {
        const user = await userService.updateUser(userId, updateInput);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/guilds:
 *   get:
 *     summary: Retrieve all guilds associated with a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of guilds associated with the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/:userId/guilds", requireAuth, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const guilds = await userService.getUserGuilds(userId);
        res.status(200).json(guilds);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/guilds/{guildId}/kanban-permissions:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve kanban permissions for a user in a specific guild
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: guildId
 *         required: true
 *         description: The ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kanban permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["View Board", "Edit Board"]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/:userId/guilds/:guildId/kanban-permissions", requireAuth, async (req, res, next) => {
    const { userId, guildId } = req.params;
    try {
        const kanbanPermissions = await userService.getAllKanbanPermissionsForGuild(userId, guildId);
        res.status(200).json(kanbanPermissions);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/boards/{boardId}/kanban-permissions:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve kanban permissions for a user in a specific board
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: The ID of the board
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kanban permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Create Tasks", "Manage Board Permissions"]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/:userId/boards/:boardId/kanban-permissions", requireAuth, async (req, res, next) => {
    const { userId, boardId } = req.params;
    try {
        const kanbanPermissions = await userService.getAllKanbanPermissionsForBoard(userId, boardId);
        res.status(200).json(kanbanPermissions);
    } catch (error) {
        next(error);
    }
});


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user using userId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post("/login", async (req, res, next) => {
    try {
        const { userId } = req.body;
        const authResponse = await userService.loginWithToken(userId);
        res.status(200).json(authResponse);
    } catch (error) {
        next(error);
    }
});

export default userRouter;
