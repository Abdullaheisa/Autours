export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "blog" | "system";
  timestamp: string;
  isRead: boolean;
}
