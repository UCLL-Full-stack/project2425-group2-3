
export const handleFetchErrors = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        
        if (response.status === 401) {
            throw new Error("You are not authorized. Please log in.");
        } else if (response.status === 403) {
            throw new Error("You do not have permission to access this resource.");
        } else if (response.status === 404) {
            throw new Error(errorMessage.error || "Resource not found.");
        } else {
            throw new Error(errorMessage.error || "An error occurred while processing your request.");
        }
    }
    return response.json();
};
