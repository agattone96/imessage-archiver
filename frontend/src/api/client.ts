const API_BASE = 'http://127.0.0.1:8000';

const PATH_RE = /\/(?:Users|var|private|tmp|Volumes)\/[\w\-./]+/g;

const redactPaths = (message: string) => {
    return message.replace(PATH_RE, '[redacted]');
};

async function fetchJson(path: string, options?: RequestInit) {
    try {
        const response = await fetch(`${API_BASE}${path}`, options);
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
            let detail = 'API Error';
            if (isJson) {
                try {
                    const data = await response.json();
                    if (data?.detail) detail = String(data.detail);
                } catch {
                    // ignore parse errors
                }
            }
            const safeDetail = redactPaths(detail);
            console.error(safeDetail);
            throw new Error(safeDetail);
        }

        if (isJson) {
            return await response.json();
        }
        return null;
    } catch (err: any) {
        const safeMessage = redactPaths(err?.message || 'Network error');
        console.error(safeMessage);
        throw new Error(safeMessage);
    }
}

export const api = {
    getOnboardingStatus: async () => {
        return await fetchJson('/onboarding/status');
    },
    completeOnboarding: async () => {
        return await fetchJson('/onboarding/complete', { method: 'POST' });
    },
    getSystemStatus: async () => {
        return await fetchJson('/system/status');
    }
};
