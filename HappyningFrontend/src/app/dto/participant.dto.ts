export interface Participant {
    eventId: number;
    userId: number;
    event: {
        title: string,
        startDate: Date,
        endDate: Date,
    }
}