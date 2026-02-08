// API Configuration
export const API_BASE_URL = 'https://api-node-uduz.onrender.com';

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
};

// Helper function to construct full URLs for static assets
export const getAssetUrl = (path: string) => {
    if (path.startsWith('http')) {
        return path;
    }
    return `${API_BASE_URL}${path}`;
};
