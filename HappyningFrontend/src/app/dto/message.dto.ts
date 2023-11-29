export interface Message {
    chat: number;
    user: {
        id: number;
        username: string;
      };
    message: string;
    createdAt: Date;
}