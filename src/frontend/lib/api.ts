// Use relative URL so it works through Nginx proxy
const API_URL = '/api';

export interface Interaction {
    id?: number;
    type: 'CONVERSATION' | 'CALL' | 'REMOVAL';
    count_or_duration: number;
    crumbs: number;
    created_at?: string;
}

export interface Stats {
    total_crumbs: number;
    goal: number;
    percent: number;
}

export const getStats = async (): Promise<Stats> => {
    const res = await fetch(`${API_URL}/stats/`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

export const logInteraction = async (interaction: Interaction): Promise<Interaction> => {
    const res = await fetch(`${API_URL}/interactions/`, { // Added trailing slash
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(interaction),
    });
    if (!res.ok) throw new Error('Failed to log interaction');
    return res.json();
};
