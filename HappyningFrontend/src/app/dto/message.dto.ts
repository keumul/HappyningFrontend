export interface Message {
  id: number;
  chat: number;
  user: {
    id: number;
    username: string;
  };
  message: string;
  createdAt: Date;
  latency: number;
}