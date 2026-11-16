export interface SessionCutoffStore{
    cutoffOf(userId: string): Promise<number | null>;
    cut(userId: string): Promise<void>;
}
