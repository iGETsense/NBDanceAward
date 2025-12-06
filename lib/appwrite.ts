/**
 * Appwrite Integration (DEPRECATED - Using Firebase only)
 * 
 * Appwrite has been removed from the project.
 * All operations now use Firebase as the primary database.
 * 
 * For Orange network compatibility, use the Firebase proxy API.
 */

// Dummy exports for backward compatibility
export const isAppwriteConfigured = () => false;

export const APPWRITE_CONFIG = {
    databaseId: '',
    candidatesCollection: '',
    categoriesCollection: '',
    candidateCategoriesCollection: '',
    votesCollection: '',
    usersCollection: '',
};

// Stub functions for backward compatibility
export const getAppwriteCandidates = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const getAppwriteCategories = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const getAppwriteCandidatesByCategory = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const getAppwriteUserVotes = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const submitAppwriteVote = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const getAppwriteUser = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const createAppwriteUser = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const updateAppwriteUser = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};

export const getAppwriteLeaderboard = async () => {
    throw new Error('Appwrite is disabled. Use Firebase instead.');
};
