import UserService from "@/services/UserService";
import TaskService from "@/services/TaskService";
import GuildService from "@/services/GuildService";
import { Task, User } from "@/types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ColumnService from "@/services/ColumnService";
import BoardService from "@/services/BoardService";
import ConfirmationModal from "../ConfirmationModal";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "react-i18next";

interface ExpandedTaskProps {
    task: Task;
    onClose: () => void;
    onTaskUpdate: (task: Task) => void;
    onTaskDelete: (taskId: string) => void;
    permissions: {
        canDeleteColumns: boolean;
        canEditColumns: boolean;
        canCreateTasks: boolean;
        canEditTasks: boolean;
        canDeleteTasks: boolean;
        canAssignTasks: boolean;
        canEditAssignees: boolean;
        canEditTaskStatus: boolean;
    }
}

const ExpandedTask: React.FC<ExpandedTaskProps> = ({ task, onClose, onTaskUpdate, onTaskDelete, permissions }) => {
    const {user} = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [assigneeNames, setAssigneeNames] = useState<string[]>([]);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [dueDate, setDueDate] = useState(task.dueDate.split("T")[0]);
    const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const { t } = useTranslation(["common"]);

    useEffect(() => {
        const fetchAssigneesAndUsers = async () => {
            try{
                const assigneeData = await Promise.all(
                    task.assigneeIds.map((id) => UserService.getUser(id))
                );
                setAssigneeNames(assigneeData.map((user) => user.globalName));
                setSelectedAssignees(assigneeData);
                const column = await ColumnService.getColumnById(task.columnId);
                const board = await BoardService.getBoard(column.boardId);
                const guildUsers = await GuildService.getGuildMembers(board.guildId);
                setAvailableUsers(guildUsers);
            } catch (error) {
                console.error("Error fetching assignees and users:", error);
            }
        };

        if(!isEditing){
            fetchAssigneesAndUsers();
        }
    }, [task.assigneeIds, task.columnId]);

    const handleUpdateTask = async () => {
        if (!title.trim() || !description.trim() || !dueDate.trim()) {
            setError(t("task.errors.missingFields"));
            return;
        }

        const updatedTask = {
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate),
            assigneeIds: selectedAssignees.map((user) => user.userId),
        };

        try {
            const newTask = await TaskService.updateTask(task.taskId, updatedTask);
            onTaskUpdate(newTask);
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    const handleDeleteTask = async () => {
        try {
            await TaskService.deleteTask(task.taskId);
            console.log("Task deleted successfully");
            onTaskDelete(task.taskId);
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setIsConfirmingDelete(false);
        }
    };

    const handleAddAssignee = (user: User) => {
        if (!selectedAssignees.some((assignee) => assignee.userId === user.userId)) {
            setSelectedAssignees((prev) => [...prev, user]);
        }
        setSearchQuery("");
    };

    const handleRemoveAssignee = (userId: string) => {
        if (!permissions.canEditAssignees && userId !== user?.userId) {
            return;
        }
        setSelectedAssignees((prev) => prev.filter((user) => user.userId !== userId));
    };

    const filteredUsers = availableUsers.filter((u) => {
        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
        const isNotAlreadyAssigned = !selectedAssignees.some((assignee) => assignee.userId === u.userId);
        if (permissions.canEditAssignees) {
            return matchesSearch && isNotAlreadyAssigned;
        }
        if (permissions.canAssignTasks) {
            return matchesSearch && isNotAlreadyAssigned && u.userId === user!.userId;
        }
        return false;
    });

    const formattedDueDate = format(new Date(task.dueDate), "MMMM d, yyyy");

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 text-white p-6 rounded-lg w-96 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                    ✕
                </button>
                {!isEditing ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{task.title}</h2>
                        <div className="text-gray-300">
                            <p className="mb-2">
                                <strong>{t("task.description")}:</strong> {task.description}
                            </p>
                            <p className="mb-2">
                                <strong>{t("task.dueDate")}:</strong> {formattedDueDate}
                            </p>
                            <p>
                                <strong>{t("task.assignees")}:</strong>{" "}
                                {assigneeNames.length > 0 ? assigneeNames.join(", ") : "None"}
                            </p>
                        </div>
                        <div className="flex justify-between mt-4">
                            {permissions.canDeleteTasks && (
                                <button
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
                                >
                                    {t("task.delete")}
                                </button>
                            )}
                            {(permissions.canEditTasks || permissions.canAssignTasks || permissions.canEditAssignees) && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                                >
                                    {t("task.edit")}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{t("task.edit")}</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("task.create.title")}
                            className={`w-full p-2 mb-2 rounded-md outline-none ${
                                permissions.canEditTasks ? "bg-gray-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}
                            disabled={!permissions.canEditTasks}
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("task.description")}
                            className={`w-full p-2 mb-2 rounded-md outline-none ${
                                permissions.canEditTasks ? "bg-gray-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}
                            disabled={!permissions.canEditTasks}
                        ></textarea>
                        <label className="block text-sm mb-2">{t("task.dueDate")}:</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={`w-full p-2 mb-2 rounded-md outline-none ${
                                permissions.canEditTasks ? "bg-gray-600 text-white" : "bg-gray-700 text-gray-400"
                            }`}
                            disabled={!permissions.canEditTasks}
                        />
                        <p>{t("task.dueDate")}:</p>
                        {selectedAssignees.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 bg-gray-600 p-2 rounded-md">
                                {selectedAssignees.map((assignee) => (
                                    <div
                                        key={assignee.userId}
                                        className="bg-gray-700 px-3 py-1 rounded flex items-center"
                                    >
                                        <span>{assignee.globalName}</span>
                                        <button
                                            className="ml-2 text-gray-500 hover:text-red-600"
                                            onClick={() => handleRemoveAssignee(assignee.userId)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder={t("task.create.searchUsers")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 rounded-md outline-none bg-gray-600 text-white"
                            />
                            <ul className="mt-2 bg-gray-800 rounded-md max-h-32 overflow-y-auto">
                                {filteredUsers.map((user) => (
                                    <li
                                        key={user.userId}
                                        className="p-2 hover:bg-gray-700 cursor-pointer rounded"
                                        onClick={() => handleAddAssignee(user)}
                                    >
                                        {user.globalName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
                            >
                                {t("actions.cancel")}
                            </button>
                            <button
                                onClick={handleUpdateTask}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                            >
                                {t("actions.save")}
                            </button>
                        </div>
                    </>
                )}
                <ConfirmationModal
                    isOpen={isConfirmingDelete}
                    title={t("task.delete")}
                    message={t("task.deleteConfirm")}
                    onConfirm={handleDeleteTask}
                    onCancel={() => setIsConfirmingDelete(false)}
                />
            </div>
        </div>
    );
};

export default ExpandedTask;
