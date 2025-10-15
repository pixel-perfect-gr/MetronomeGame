export interface LeaderboardEntry {
    name: string;
    score: number;
    date: string;
}

export default class Leaderboard {
    private static STORAGE_KEY = 'super-metronome-leaderboard';

    public static getAll(): LeaderboardEntry[] {
        const data = localStorage.getItem(Leaderboard.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    public static add(name: string, score: number): void {
        const leaderboard = Leaderboard.getAll();
        leaderboard.push({ name, score, date: new Date().toISOString() });
        leaderboard.sort((a, b) => b.score - a.score);
        const top10 = leaderboard.slice(0, 10); // keep best 10
        localStorage.setItem(Leaderboard.STORAGE_KEY, JSON.stringify(top10));
    }

    public static clear(): void {
        localStorage.removeItem(Leaderboard.STORAGE_KEY);
    }
}
