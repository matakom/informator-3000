import axios from 'axios';
import { Article } from '../types';
import URL from './url';

// -- Configuration --

const apiClient = axios.create({
    baseURL: URL,
    timeout: 10000
});

// The backend seems to return mixed casing (sometimes Title, sometimes title),
// so this interface helps us catch everything before normalizing.
interface RawArticle {
    id?: number;
    ID?: number;
    title?: string;
    Title?: string;
    author?: string;
    Author?: string;
    content?: string;
    Content?: string;
    category?: string;
    Category?: string;
    createdAt?: string;
    CreatedAt?: string;
    updatedAt?: string;
    UpdatedAt?: string;
}

// -- Fetchers --

export const getArticles = async (): Promise<Article[]> => {
    try {
        const { data } = await apiClient.get<RawArticle[]>('/article/list');

        if (!Array.isArray(data)) return [];

        // Normalizing the messy backend data into our clean Article type.
        // We check for both PascalCase and camelCase properties here to avoid runtime errors.
        const normalizedArticles = data.map((item) => ({
            id: item.id ?? item.ID ?? 0,
            title: item.title ?? item.Title ?? "No Title",
            author: item.author ?? item.Author ?? "Unknown",
            content: item.content ?? item.Content ?? "",
            category: item.category ?? item.Category ?? "General",
            createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
            updatedAt: item.updatedAt ?? item.UpdatedAt ?? new Date().toISOString(),
        }));

        // Showing newest articles first
        return normalizedArticles.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    } catch (error) {
        // In a real app we might want to throw this up to the UI, 
        // but for now returning empty keeps the app from crashing.
        console.error("Error fetching articles", error);
        return [];
    }
};

export const checkApiHealth = async (): Promise<boolean> => {
    try {
        // Just a simple ping to see if the server is awake
        await apiClient.get('/'); 
        return true;
    } catch {
        return false;
    }
};

// -- Mutations --

export const createArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
        const response = await apiClient.post('/article/create', articleData);
        // Accepting both 200 and 201 as success just to be safe
        return response.status === 200 || response.status === 201;
    } catch (error) {
        console.error("Error creating article", error);
        return false;
    }
};

export const updateArticle = async (id: number, articleData: Partial<Article>): Promise<boolean> => {
    try {
        // Note: passing ID as a query param here, not in the body
        const response = await apiClient.post(`/article/update`, articleData, {
            params: { id }
        });
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error("Error updating article", error);
        return false;
    }
};

export const deleteArticle = async (id: number): Promise<boolean> => {
    try {
        await apiClient.post(`/article/delete`, null, {
            params: { id }
        });
        return true;
    } catch (error) {
        console.error("Error deleting article", error);
        return false;
    }
};