import Head from 'next/head';
import { FC, useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import UserService from '@/services/UserService';
import GuildCard from '@/components/dashboard/GuildCard';
import { Guild, Board, User, KanbanPermission, PermissionEntry } from '@/types';
import BoardService from '@/services/BoardService';
import BoardCard from '@/components/dashboard/BoardCard';
import CreateBoardForm from '@/components/dashboard/CreateBoardForm';
import EditGuildSettingsForm from '@/components/dashboard/EditGuildSettingsForm';
import dotenv from 'dotenv';
import { useUser } from '@/context/UserContext';
import GuildService from '@/services/GuildService';
import EditBoard from '@/components/dashboard/EditBoard';
import EditBoardSettings from '@/components/dashboard/EditBoardSettings';
import BoardView from '@/components/board/BoardView';
import ColumnService from '@/services/ColumnService';
import { useTranslation } from 'react-i18next';

dotenv.config();

const Home: FC = () => {
  const { user, setUser } = useUser();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [displayGuilds, setDisplayGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [selectedGuildForBoardCreation, setSelectedGuildForBoardCreation] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isEditingGuildSettings, setIsEditingGuildSettings] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardPermissionsId, setEditingBoardPermissionsId] = useState<string | null>(null);
  const { t } = useTranslation(['common']);
  const [token, setToken] = useState<string | null>(null);

  const refreshSelectedBoard = async () => {
    if (!selectedBoard) return;
    try {
      const updatedBoard = await BoardService.getBoard(selectedBoard.boardId);
      setSelectedBoard(updatedBoard);
    } catch (error) {
      console.error('Error refreshing selected board:', error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const storedUser = sessionStorage.getItem('user');
      const sessionGuilds = JSON.parse(sessionStorage.getItem('guilds') || '[]');
  
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        const sessionToken = sessionStorage.getItem('token');
        if (!sessionToken) {
          const loginData = await UserService.login(parsedUser.userId);
          setToken(loginData.token);
          sessionStorage.setItem('token', loginData.token);
        }
  
        const dbGuilds = await UserService.getGuilds(parsedUser.userId);
        const displayGuilds = sessionGuilds.map((guild: any) => {
          const matchingDbGuild = dbGuilds.find((dbGuild: any) => dbGuild.guildId === guild.guildId);
          return {
            ...guild,
            guildName: matchingDbGuild?.guildName || guild.guildName,
            greyedOut: !matchingDbGuild && !guild.botInGuild,
          };
        });
  
        displayGuilds.sort((a: any, b: any) => a.greyedOut - b.greyedOut);
  
        setGuilds(dbGuilds);
        setDisplayGuilds(displayGuilds);
  
        const fetchedPermissions = await Promise.all(
          dbGuilds.map(async (guild: { guildId: string }) => {
            const permission = await UserService.getUserGuildKanbanPermissions(parsedUser.userId, guild.guildId);
            return { guildId: guild.guildId, permissions: permission };
          })
        );
  
        setPermissions(fetchedPermissions);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setLoading(false);
    }
  }, [setUser]);
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (selectedGuildId) {
      const fetchBoards = async () => {
        try {
          const fetchedBoards = await BoardService.getBoardsByGuild(selectedGuildId);
          const filteredBoards = await Promise.all(
            fetchedBoards.map(async (board) => {
              try {
                const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
                const canViewBoard =
                  permissions.includes(KanbanPermission.VIEW_BOARD) || 
                  permissions.includes(KanbanPermission.ADMINISTRATOR);
                return canViewBoard ? board : null;
              } catch (error) {
                console.error(`Error checking permissions for board ${board.boardId}:`, error);
                return null;
              }
            })
          );
          setBoards(filteredBoards.filter((board) => board !== null) || []);
        } catch (error) {
          console.error('Error fetching boards', error);
        }
      };

      fetchBoards();
      const interval = setInterval(fetchBoards, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGuildId, user]);

  useEffect(() => {
    if (selectedBoard) {
      const interval = setInterval(refreshSelectedBoard, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedBoard]);

  const handleDiscordLogin = () => {
    const redirectUri = `http://localhost:8080/api/auth/discord`;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify guilds`;
  };

  const handleGuildClick = async (guild: any) => {
    if (guild.greyedOut && guild.inviteLink) {
      window.open(guild.inviteLink, '_blank');
    } else if (!guild.greyedOut) {
      setSelectedGuildId(guild.guildId || guild.id);
      try {
          const fetchedBoards = await BoardService.getBoardsByGuild(guild.guildId);
          const filteredBoards = await Promise.all(
            fetchedBoards.map(async (board) => {
              try {
                  const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
                  const canViewBoard =
                      permissions.includes(KanbanPermission.VIEW_BOARD) || 
                      permissions.includes(KanbanPermission.ADMINISTRATOR);
                  return canViewBoard ? board : null;
              } catch (error) {
                  console.error(`Error checking permissions for board ${board.boardId}:`, error);
                  return null;
              }
          })
          )
          setBoards(filteredBoards.filter((board) => board !== null) || []);
        } catch (error) {
          console.error('Error fetching boards', error);
      }
    }
  };

  const handleBoardCreateClick = (guildId?: string) => {
    if(guildId) {
      setSelectedGuildForBoardCreation(guildId);
    }
    setIsFormOpen(true);
    console.log('Create button clicked!');
  };

  const handleBoardCreationFormClose = () => {
    setIsFormOpen(false);
    setSelectedGuildForBoardCreation(null);
  }

  const handleBoardCreationSubmit = async (boardData: { boardName: string; columns: string[]; guild: string }) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    if(boardData.columns.length === 0) {
      boardData.columns = ['To Do', 'In Progress', 'Done'];
    } else {
      boardData.columns = boardData.columns.map(column => column.trim());
    }
    const boardPayload = {
      boardName: boardData.boardName,
      createdByUserId: user.userId,
      guildId: boardData.guild,
      columns: boardData.columns,
      permissions: []
    };

    try {
      await BoardService.createBoard(boardPayload);
      console.log('Created board with data:', boardPayload);
      if (selectedGuildId) {
        const fetchedBoards = await BoardService.getBoardsByGuild(selectedGuildId);
        const filteredBoards = await Promise.all(
          fetchedBoards.map(async (board) => {
            try {
                const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
                const canViewBoard =
                    permissions.includes(KanbanPermission.VIEW_BOARD) || 
                    permissions.includes(KanbanPermission.ADMINISTRATOR);
                return canViewBoard ? board : null;
            } catch (error) {
                console.error(`Error checking permissions for board ${board.boardId}:`, error);
                return null;
            }
        })
        )
        setBoards(filteredBoards.filter((board)=> board !== null) || []);
    }
    } catch (error) {
      console.error('Error creating board', error);
    }
    handleBoardCreationFormClose();
  };

  const handleGuildEditSettings = (guildId: string) => {
    setIsEditingGuildSettings(true);
    setSelectedGuildId(guildId);
  }

  const handleGuildEditSubmit = async (updatedSettings: PermissionEntry[]) => {
    try {
      await GuildService.updateGuild(selectedGuildId!, {settings: updatedSettings});
      const updatedGuild: Guild = await GuildService.getGuild(selectedGuildId!);
      const updatedPermissions = await UserService.getUserGuildKanbanPermissions(user!.userId, updatedGuild.guildId);
      setPermissions((prev) => {
        return prev.map((perm) => 
            perm.guildId === selectedGuildId
                ? { guildId: selectedGuildId, permissions: updatedPermissions }
                : perm
        );
      });
      setIsEditingGuildSettings(false);
      console.log("Guild settings updated successfully");
    } catch (error) {
      console.error('Error updating guild settings:', error);
    }
  }

  const handleBoardDelete = async (boardId: string) => {
    console.log('Deleting board:', boardId);
    try {
        await BoardService.deleteBoard(boardId);
        const fetchedBoards = await BoardService.getBoardsByGuild(selectedGuildId!);
        const filteredBoards = await Promise.all(
          fetchedBoards.map(async (board) => {
            try {
                const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
                const canViewBoard =
                    permissions.includes(KanbanPermission.VIEW_BOARD) || 
                    permissions.includes(KanbanPermission.ADMINISTRATOR);
                return canViewBoard ? board : null;
            } catch (error) {
                console.error(`Error checking permissions for board ${board.boardId}:`, error);
                return null;
            }
        })
        )
        setBoards(filteredBoards.filter((board)=> board !== null) || []);
    } catch (error) {
        console.error('Error deleting board:', error);
    }
  }

  const handleBoardEditSubmit = async (boardData: { boardName: string; }) => {
    try {
        await BoardService.updateBoard(editingBoardId!, { boardName: boardData.boardName });
        const fetchedBoards = await BoardService.getBoardsByGuild(selectedGuildId!);
        const filteredBoards = await Promise.all(
          fetchedBoards.map(async (board) => {
            try {
                const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
                const canViewBoard =
                    permissions.includes(KanbanPermission.VIEW_BOARD) || 
                    permissions.includes(KanbanPermission.ADMINISTRATOR);
                return canViewBoard ? board : null;
            } catch (error) {
                console.error(`Error checking permissions for board ${board.boardId}:`, error);
                return null;
            }
        }))
        setBoards(filteredBoards.filter((board)=> board !== null) || []);
        setEditingBoardId(null);
    } catch (error) {
        console.error('Error updating board:', error);
    }
  };

  const handleBoardEditPermissionsSubmit = async (permissions: PermissionEntry[]) => {
    try {
      await BoardService.updateBoard(editingBoardPermissionsId!, { permissions });
      const fetchedBoards = await BoardService.getBoardsByGuild(selectedGuildId!);
      const filteredBoards = await Promise.all(
        fetchedBoards.map(async (board) => {
          try {
              const permissions = await UserService.getAllKanbanPermissionsForBoard(user!.userId, board.boardId);
              const canViewBoard =
                  permissions.includes(KanbanPermission.VIEW_BOARD) || 
                  permissions.includes(KanbanPermission.ADMINISTRATOR);
              return canViewBoard ? board : null;
          } catch (error) {
              console.error(`Error checking permissions for board ${board.boardId}:`, error);
              return null;
          }
      }))
      setBoards(filteredBoards.filter((board)=> board !== null) || []);
      setEditingBoardPermissionsId(null);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleAddColumn = async (columnName: string) => {
    if (!selectedBoard) return;

    try {
      const newColumn = await ColumnService.addColumn({
        columnName,
        columnIndex: selectedBoard.columnIds.length,
        boardId: selectedBoard.boardId,
        taskIds: [],
      });

      await BoardService.updateBoard(selectedBoard.boardId, {
        columnIds: [...selectedBoard.columnIds, newColumn.columnId],
      });

      const updatedBoard = await BoardService.getBoard(selectedBoard.boardId);

      setBoards((prev) =>
        prev.map((board) => (board.boardId === updatedBoard.boardId ? updatedBoard : board))
      );
      setSelectedBoard(updatedBoard);
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!selectedBoard) return;
    try {
        await ColumnService.deleteColumn(columnId);
        const updatedColumnIds = selectedBoard.columnIds.filter((id) => id !== columnId);
        await BoardService.updateBoard(selectedBoard.boardId, {
            columnIds: updatedColumnIds,
        });
        const updatedBoard = {
            ...selectedBoard,
            columnIds: updatedColumnIds,
        };
        setBoards((prev) =>
            prev.map((board) =>
                board.boardId === updatedBoard.boardId ? updatedBoard : board
            )
        );
        setSelectedBoard(updatedBoard);
        console.log("Column deleted successfully");
    } catch (error) {
        console.error("Error deleting column:", error);
    }
  };

  return (
      <div className="bg-[#2C2F33] min-h-screen flex flex-col">
          <Head>
              <title>KanbanCord</title>
              <meta name="description" content="A Kanban board application inspired by Discord." />
              <link rel="icon" href="/images/kanbancord.png" />
          </Head>
          <Header
              onCreateClick={handleBoardCreateClick}
              onLoginClick={handleDiscordLogin}
              onBackToDashboard={selectedBoard ? () => setSelectedBoard(null) : undefined}
              boardTitle={selectedBoard?.boardName}
          />
          <main className="flex-grow">
            {selectedBoard ? (
                <BoardView
                  board={selectedBoard}
                  onAddColumn={handleAddColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
            ) : (
              <>
                <div>
                {!user && (
                  <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
                    <h1 className="text-2xl font-bold mb-4">Predefined Users (Login to discord before logging in on KanbanCord)</h1>
                    <table className="table-auto border-collapse border border-gray-400">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Email</th>
                          <th className="border border-gray-300 px-4 py-2">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">jenaro@beefance.com</td>
                          <td className="border border-gray-300 px-4 py-2">jenarobeefance</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">africa.15@beefance.com</td>
                          <td className="border border-gray-300 px-4 py-2">africa15beefance</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">eagle4@beefance.com</td>
                          <td className="border border-gray-300 px-4 py-2">eagle4beefance</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  )}
                  {loading && user ? (
                      <p>{t("loading")}</p>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                          {displayGuilds.map(guild => (
                              <GuildCard key={guild.guildId} guild={guild} onClick={handleGuildClick} onCreateClick={handleBoardCreateClick} onGuildSettingsClick={handleGuildEditSettings} permissions={permissions}/>
                          ))}
                      </div>
                  )}

                </div>
                {selectedGuildId && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg m-4">
                    <h2 className="text-white text-xl font-bold">Boards</h2>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white">
                        {boards.length === 0 ? (
                            <p>No boards available for this server.</p>
                        ) : (
                            boards.map(board => (
                                <BoardCard
                                  key={board.boardId}
                                  board={board}
                                  onDelete={handleBoardDelete}
                                  onEdit={()=> {setEditingBoardId(board.boardId);}}
                                  onEditPermissions={()=> {setEditingBoardPermissionsId(board.boardId);}}
                                  onSelect={(board)=> {setSelectedBoard(board);}}
                                />
                            ))
                        )}
                      </div>
                    </div>
                  )}
                <CreateBoardForm 
                    isOpen={isFormOpen} 
                    onClose={handleBoardCreationFormClose} 
                    onSubmit={handleBoardCreationSubmit} 
                    selectedGuildId={selectedGuildForBoardCreation}
                    user={user!}
                    guilds={guilds}
                    permissions={permissions}
                />
                {isEditingGuildSettings && (
                    <EditGuildSettingsForm 
                        onClose={() => setIsEditingGuildSettings(false)} 
                        guildId={selectedGuildId!}
                        onSubmit={handleGuildEditSubmit}
                    />
                )}
                {editingBoardId && (
                  <EditBoard
                    boardId={editingBoardId}
                    onClose={() => setEditingBoardId(null)}
                    onSubmit={handleBoardEditSubmit}
                  />
                )}
                {editingBoardPermissionsId && (
                  <EditBoardSettings
                    boardId={editingBoardPermissionsId}
                    onClose={() => setEditingBoardPermissionsId(null)}
                    onSubmit={handleBoardEditPermissionsSubmit}
                  />
                )}
              </>
            )}

          </main>
      </div>
  );
};

export default Home;
