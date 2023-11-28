export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    organizerId: number;
    categoryId: number;
    maxGuestAmount: number;
    secretCode: string;
    isPublic: boolean;
}