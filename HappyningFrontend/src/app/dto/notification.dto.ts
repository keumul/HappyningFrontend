export interface Notifications {
    id: number;
    message: string;
    user: number;
    eventId: number;
    isRead: boolean;
    qrCode: string;
    createdAt: Date;
}