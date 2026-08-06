export type ThemeMode = "imessage" | "material" | "cyberpunk" | "lavender" | "retro";

export interface MemoryItem {
  id: string;
  text: string;
  dateAdded: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  nickname?: string;
  phoneNumber: string;
  avatarUrl: string;
  avatarColor: string;
  status: "online" | "away" | "busy" | "offline";
  statusText: string;
  bio: string;
  personality: string;
  tone: string;
  hobbies: string[];
  relationshipLevel: number; // 1 to 100
  memories: MemoryItem[];
  isFavorite?: boolean;
  isCustom?: boolean;
  typingDelayMs?: number;
}

export interface MessageReaction {
  emoji: string;
  from: "user" | "friend";
}

export interface Message {
  id: string;
  friendId: string;
  sender: "user" | "friend";
  text: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  reactions?: MessageReaction[];
  mediaUrl?: string; // photo attachment
  mediaType?: "image" | "audio";
  audioDuration?: number; // in seconds
  isScheduled?: boolean;
}

export interface ScheduledText {
  id: string;
  friendId: string;
  promptTopic: string;
  delaySeconds: number;
  scheduledTime: string;
  status: "pending" | "sent" | "cancelled";
}
