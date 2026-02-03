import type { Chat, GlobalStats, Message, OnboardingStatus } from './types';

const API_BASE = 'http://localhost:8000';

export const api = {
    getSystemStatus: async () => {
        const res = await fetch(`${API_BASE}/system/status`);
        return res.json();
    },

    getOnboardingStatus: async (): Promise<OnboardingStatus> => {
        const res = await fetch(`${API_BASE}/onboarding/status`);
        return res.json();
    },

    checkAccess: async (): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_BASE}/onboarding/check-access`, { method: 'POST' });
        return res.json();
    },

    completeOnboarding: async () => {
        await fetch(`${API_BASE}/onboarding/complete`, { method: 'POST' });
    },

    getGlobalStats: async (): Promise<GlobalStats> => {
        const res = await fetch(`${API_BASE}/stats/global`);
        return res.json();
    },

    getRecentChats: async (search?: string): Promise<Chat[]> => {
        const url = new URL(`${API_BASE}/chats/recent`);
        if (search) url.searchParams.set('search', search);
        const res = await fetch(url.toString());
        return res.json();
    },

    getChatMessages: async (guid: string, limit = 50): Promise<Message[]> => {
        const res = await fetch(`${API_BASE}/chats/${guid}/messages?limit=${limit}`);
        return res.json();
    },

    archiveChat: async (guid: string, format = 'csv', incremental = true) => {
        const res = await fetch(`${API_BASE}/chats/${guid}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_guid: guid, format, incremental }),
        });
        return res.json();
    }
};
