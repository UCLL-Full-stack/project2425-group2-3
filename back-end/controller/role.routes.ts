import { Router } from "express";
import roleService from "../service/role.service";
import { CreateRoleInput } from "../types";

const roleRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 *     Role:
 *       type: object
 *       properties:
 *         roleId:
 *           type: string
 *           description: Unique identifier for the role
 *         roleName:
 *           type: string
 *           description: Name of the role
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             description: List of permissions assigned to the role
 *         guildId:
 *           type: string
 *           description: Guild to which the role belongs
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Retrieve a list of roles
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       404:
 *         description: No roles found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRouter.get("/", async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        res.status(404).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

/**
 * @swagger
 * /api/roles/{roleId}:
 *   get:
 *     summary: Retrieve a specific role by ID
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: The ID of the role to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRouter.get("/:roleId", async (req, res) => {
    const { roleId } = req.params;
    try {
        const role = await roleService.getRoleById(roleId);
        res.status(200).json(role);
    } catch (error) {
        res.status(404).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRouter.post("/", async (req, res) => {
    const { roleId, roleName, permissions = [], guildId } = req.body;
    const createRole: CreateRoleInput = { roleId, roleName, permissions, guildId };
    try {
        const role = await roleService.addRole(createRole);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

/**
 * @swagger
 * /api/roles/{roleId}:
 *   put:
 *     summary: Update a role
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: The ID of the role to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRouter.put("/:roleId", async (req, res) => {
    const { roleId } = req.params;
    const { roleName, permissions } = req.body;
    try {
        const role = await roleService.updateRole(roleId, { roleName, permissions });
        res.status(200).json(role);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
});

export default roleRouter;
