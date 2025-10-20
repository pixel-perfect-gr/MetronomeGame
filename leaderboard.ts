export interface LeaderboardEntry {
    name: string;
    score: number;
    date: string;
}

const API_URL = "http://localhost:3000";

export default class Leaderboard {
    public static async getAll(): Promise<LeaderboardEntry[]> {
        const res = await fetch(`${API_URL}/leaderboard`);
        return await res.json();
    }

    public static async add(name: string, score: number): Promise<void> {
        await fetch(`${API_URL}/leaderboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, score }),
        });
    }
}
