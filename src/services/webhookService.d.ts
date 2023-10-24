export declare class webhookService {
    async setAvailable(): Promise<void>;
    async setAway(): Promise<void>;
    async setBusy(): Promise<void>;
    async clearStatus(): Promise<void>;
    async postStatus(status: string): Promise<void>;
}
