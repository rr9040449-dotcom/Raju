import { FriendProfile, Message } from "../types";

export interface ChatResponse {
  replyText: string;
  quickReplies: string[];
  reaction?: string | null;
  newMemory?: string | null;
  photoUrl?: string | null;
}

export async function sendSmsToFriend(
  friendProfile: FriendProfile,
  userMessage: string,
  history: Message[]
): Promise<ChatResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: history,
        friendProfile: friendProfile,
      }),
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      replyText: data.replyText || "Hey! Got your text!",
      quickReplies: data.quickReplies || ["Sounds good!", "Tell me more", "Haha love that"],
      reaction: data.reaction || null,
      newMemory: data.newMemory || null,
      photoUrl: data.photoUrl || null,
    };
  } catch (err) {
    console.warn("Express API chat error, using smart fallback response:", err);
    // Offline / Fallback generator tailored to friend tone
    const fallbackText = getFallbackResponse(friendProfile, userMessage);
    return {
      replyText: fallbackText.replyText,
      quickReplies: fallbackText.quickReplies,
      reaction: fallbackText.reaction,
      newMemory: null,
      photoUrl: null,
    };
  }
}

export async function requestProactiveCheckin(
  friendProfile: FriendProfile,
  timeOfDay: string = "afternoon"
): Promise<{ replyText: string; quickReplies: string[] }> {
  try {
    const res = await fetch("/api/proactive-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friendProfile,
        timeOfDay,
      }),
    });

    if (!res.ok) throw new Error("Check-in API failed");

    const data = await res.json();
    return {
      replyText: data.replyText,
      quickReplies: data.quickReplies || ["Hey! Doing great!", "Just thinking of you!", "Super busy today!"],
    };
  } catch (err) {
    return {
      replyText: `Hey! Just wanted to send a quick text and check in on you! How's your ${timeOfDay} going? 😊`,
      quickReplies: ["Going awesome!", "Pretty busy!", "Just relaxing, you?"],
    };
  }
}

function getFallbackResponse(friend: FriendProfile, message: string): {
  replyText: string;
  quickReplies: string[];
  reaction?: string;
} {
  const lower = message.toLowerCase();

  if (friend.id === "friend_maya") {
    if (lower.includes("hello") || lower.includes("hey") || lower.includes("hi")) {
      return {
        replyText: "Heuysss!! So happy you texted! How is your day treating you so far? ✨",
        quickReplies: ["Going great!", "Pretty busy honestly", "Just relaxing!"],
        reaction: "❤️",
      };
    }
    return {
      replyText: "Omg I completely feel you on that! Tell me all the details!! ☕✨",
      quickReplies: ["Haha okay so...", "Well basically...", "You won't believe it"],
      reaction: "😍",
    };
  } else if (friend.id === "friend_leo") {
    return {
      replyText: "yo fr? that's wild lol. gotta log that into my brain database 🧠",
      quickReplies: ["fr fr", "lol true", "what are you up to?"],
      reaction: "😂",
    };
  } else if (friend.id === "friend_jake") {
    return {
      replyText: "BOOM!! 🔥 Love that attitude champ! Keep pushing forward today, nothing can stop you!! 💪",
      quickReplies: ["LET'S GO!", "Thanks Jake!", "Appreciate the hype!"],
      reaction: "🔥",
    };
  } else if (friend.id === "friend_sophia") {
    return {
      replyText: "That's really lovely. I always appreciate when we share our thoughts like this 🍃",
      quickReplies: ["Me too Sophia", "How is your day?", "Thanks for listening"],
      reaction: "✨",
    };
  }

  return {
    replyText: `Hey! That's awesome! I was just thinking about that. What else is new with you today?`,
    quickReplies: ["Not much!", "Tell me about your day!", "Let's catch up"],
  };
}
