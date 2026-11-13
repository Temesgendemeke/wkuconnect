// TODO: replace with Convex notification queries.

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  kind: "Requests" | "Messages" | "General";
};

export type NotificationResult = {
  data: NotificationItem[];
  loading: boolean;
  error: string | null;
};

const notificationData: NotificationItem[] = [
  {
    id: "notification-1",
    title: "Connection request",
    subtitle: "Amanuel wants to connect with you.",
    time: "2m",
    unread: true,
    kind: "Requests",
  },
  {
    id: "notification-2",
    title: "New message",
    subtitle: "Your group study chat has 3 new replies.",
    time: "18m",
    unread: true,
    kind: "Messages",
  },
  {
    id: "notification-3",
    title: "Market update",
    subtitle: "A book you saved is now on sale.",
    time: "1d",
    unread: false,
    kind: "General",
  },
];

export function useNotifications(): NotificationResult {
  return {
    data: notificationData,
    loading: false,
    error: null,
  };
}
