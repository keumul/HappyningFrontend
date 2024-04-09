export interface Event {
    id: number;
    title: string;
    startDate: Date;
    endDate: Date;
    description: string;
    maxGuestAmount: number;
    isPublic: boolean;
    locationId: number;
    categoryId: number;
    formatId: number;
    secretCode: string;
    ageLimit: number;
    organizerId: number;
}