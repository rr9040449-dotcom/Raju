import React, { useState, useEffect } from "react";
import { FriendProfile, Message, ScheduledText, ThemeMode } from "./types";
import { INITIAL_FRIENDS, INITIAL_MESSAGES } from "./data/initialFriends";
import { sendSmsToFriend, requestProactiveCheckin } from "./services/api";
import { soundManager } from "./services/sound";
import { initAuth, googleSignIn, logout } from "./services/auth";
import { User } from "firebase/auth";
import { PhoneHeader } from "./components/PhoneHeader";
import { SidebarContacts } from "./components/SidebarContacts";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";
import { FriendProfileModal } from "./components/FriendProfileModal";
import { NewFriendModal } from "./components/NewFriendModal";
import { ScheduledTextModal } from "./components/ScheduledTextModal";
import { ArrowLeft } from "lucide-react";

export default function App() {
  // LocalStorage Persistence Keys
  const LOCAL_FRIENDS_KEY = "sms_online_friends_v1";
  const LOCAL_MSGS_KEY = "sms_online_messages_v1";
  const LOCAL_THEME_KEY = "sms_online_theme_v1";

  // State Management
  const [friends, setFriends] = useState<FriendProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_FRIENDS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_FRIENDS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(LOCAL_MSGS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  const [selectedFriendId, setSelectedFriendId] = useState<string>(
    INITIAL_FRIENDS[0]?.id || ""
  );

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem(LOCAL_THEME_KEY) as ThemeMode) || "imessage";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Hey! What's up?",
    "Tell me more!",
    "Haha love that! 😂",
  ]);

  const [scheduledList, setScheduledList] = useState<ScheduledText[]>([]);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNewFriendModal, setShowNewFriendModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Mobile View Toggle
  const [mobileActiveView, setMobileActiveView] = useState<"contacts" | "chat">("chat");

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_FRIENDS_KEY, JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem(LOCAL_MSGS_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_THEME_KEY, theme);
  }, [theme]);

  // Sync sound manager toggle
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const activeFriend = friends.find((f) => f.id === selectedFriendId) || friends[0];
  const activeMessages = messages[selectedFriendId] || [];

  // Select Friend
  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
    setMobileActiveView("chat");
    setUnreadCounts((prev) => ({ ...prev, [friendId]: 0 }));
  };

  // Toggle Star / Favorite
  const handleToggleFavorite = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  // Send User Message & Trigger AI Friend Response
  const handleSendMessage = async (
    text: string,
    mediaUrl?: string,
    mediaType?: "image" | "audio"
  ) => {
    if (!activeFriend) return;

    soundManager.playSendSound();

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      friendId: selectedFriendId,
      sender: "user",
      text: text,
      timestamp,
      status: "sent",
      mediaUrl,
      mediaType,
    };

    // Update conversation state with user message
    const updatedHistory = [...(messages[selectedFriendId] || []), userMsg];
    setMessages((prev) => ({
      ...prev,
      [selectedFriendId]: updatedHistory,
    }));

    setIsTyping(true);

    // Call Gemini backend
    try {
      const response = await sendSmsToFriend(activeFriend, text, updatedHistory);

      soundManager.playReceiveSound();

      const friendMsg: Message = {
        id: `msg_friend_${Date.now()}`,
        friendId: selectedFriendId,
        sender: "friend",
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        status: "read",
        mediaUrl: response.photoUrl || undefined,
        mediaType: response.photoUrl ? "image" : undefined,
        reactions: response.reaction
          ? [{ emoji: response.reaction, from: "friend" }]
          : undefined,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedFriendId]: [...(prev[selectedFriendId] || []), friendMsg],
      }));

      // Update Quick Reply tags
      if (response.quickReplies && response.quickReplies.length > 0) {
        setQuickReplies(response.quickReplies);
      }

      // Update relationship meter level (+1)
      setFriends((prev) =>
        prev.map((f) =>
          f.id === selectedFriendId
            ? {
                ...f,
                relationshipLevel: Math.min(100, f.relationshipLevel + 1),
                memories: response.newMemory
                  ? [
                      ...(f.memories || []),
                      {
                        id: `mem_${Date.now()}`,
                        text: response.newMemory,
                        dateAdded: new Date().toISOString().split("T")[0],
                      },
                    ]
                  : f.memories,
              }
            : f
        )
      );
    } catch (e) {
      console.error("Failed to receive SMS reply", e);
    } finally {
      setIsTyping(false);
    }
  };

  // Instant Check-in / Unprompted SMS Trigger
  const handleTriggerCheckin = async (friendId?: string) => {
    const targetId = friendId || selectedFriendId;
    const targetFriend = friends.find((f) => f.id === targetId);
    if (!targetFriend) return;

    soundManager.playReceiveSound();

    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? "morning" : hours < 18 ? "afternoon" : "evening";

    const data = await requestProactiveCheckin(targetFriend, timeOfDay);

    const checkinMsg: Message = {
      id: `msg_checkin_${Date.now()}`,
      friendId: targetId,
      sender: "friend",
      text: data.replyText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      status: "read",
    };

    setMessages((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), checkinMsg],
    }));

    if (targetId === selectedFriendId && data.quickReplies) {
      setQuickReplies(data.quickReplies);
    } else {
      setUnreadCounts((prev) => ({
        ...prev,
        [targetId]: (prev[targetId] || 0) + 1,
      }));
    }
  };

  // Schedule SMS Auto Check-in
  const handleAddSchedule = (
    friendId: string,
    topic: string,
    delaySeconds: number
  ) => {
    const newSch: ScheduledText = {
      id: `sch_${Date.now()}`,
      friendId,
      promptTopic: topic,
      delaySeconds,
      scheduledTime: new Date(Date.now() + delaySeconds * 1000).toLocaleTimeString(),
      status: "pending",
    };

    setScheduledList((prev) => [...prev, newSch]);

    // Timer queue
    setTimeout(() => {
      handleTriggerCheckin(friendId);
      setScheduledList((prev) => prev.filter((s) => s.id !== newSch.id));
    }, delaySeconds * 1000);

    setShowScheduleModal(false);
  };

  const handleCancelSchedule = (id: string) => {
    setScheduledList((prev) => prev.filter((s) => s.id !== id));
  };

  // Add Reaction to Message
  const handleAddReaction = (messageId: string, emoji: string) => {
    soundManager.playPopSound();
    setMessages((prev) => {
      const currentMsgs = prev[selectedFriendId] || [];
      return {
        ...prev,
        [selectedFriendId]: currentMsgs.map((m) => {
          if (m.id === messageId) {
            const existing = m.reactions || [];
            return {
              ...m,
              reactions: [...existing, { emoji, from: "user" }],
            };
          }
          return m;
        }),
      };
    });
  };

  // Create Custom Online Friend
  const handleCreateFriend = (newFriend: FriendProfile, initialText?: string) => {
    setFriends((prev) => [newFriend, ...prev]);
    setSelectedFriendId(newFriend.id);
    setMobileActiveView("chat");

    if (initialText) {
      const starterMsg: Message = {
        id: `msg_init_${Date.now()}`,
        friendId: newFriend.id,
        sender: "friend",
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        status: "read",
      };
      setMessages((prev) => ({
        ...prev,
        [newFriend.id]: [starterMsg],
      }));
    }
  };

  // Memory Vault Operations
  const handleAddMemory = (friendId: string, text: string) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId
          ? {
              ...f,
              memories: [
                ...(f.memories || []),
                {
                  id: `mem_${Date.now()}`,
                  text,
                  dateAdded: new Date().toISOString().split("T")[0],
                },
              ],
            }
          : f
      )
    );
  };

  const handleDeleteMemory = (friendId: string, memoryId: string) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.id === friendId
          ? {
              ...f,
              memories: f.memories.filter((m) => m.id !== memoryId),
            }
          : f
      )
    );
  };

  const handleClearHistory = (friendId: string) => {
    setMessages((prev) => ({
      ...prev,
      [friendId]: [],
    }));
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Smartphone Status & Controls Bar */}
      <PhoneHeader
        theme={theme}
        onThemeChange={setTheme}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenScheduleModal={() => setShowScheduleModal(true)}
        onOpenNewFriendModal={() => setShowNewFriendModal(true)}
      />

      {needsAuth && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-slate-900 border-b border-slate-700 p-2 flex items-center justify-between">
          <span className="text-xs text-slate-300">Gmail integration requires sign-in</span>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:bg-slate-200"
          >
            {isLoggingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      )}

      {/* Main Responsive App Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile View Back to Contacts Bar */}
        {mobileActiveView === "chat" && (
          <button
            onClick={() => setMobileActiveView("contacts")}
            className="md:hidden absolute top-3 left-3 z-30 p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-blue-400 font-bold text-xs flex items-center space-x-1 shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Contacts</span>
          </button>
        )}

        {/* Contacts Sidebar */}
        <div
          className={`${
            mobileActiveView === "contacts" ? "block w-full" : "hidden md:block"
          }`}
        >
          <SidebarContacts
            friends={friends}
            selectedFriendId={selectedFriendId}
            onSelectFriend={handleSelectFriend}
            messages={messages}
            unreadCounts={unreadCounts}
            onToggleFavorite={handleToggleFavorite}
            onOpenNewFriendModal={() => setShowNewFriendModal(true)}
            onTriggerCheckin={handleTriggerCheckin}
            theme={theme}
          />
        </div>

        {/* Active Chat Main Area */}
        <div
          className={`flex-1 flex flex-col h-full ${
            mobileActiveView === "chat" ? "block w-full" : "hidden md:flex"
          }`}
        >
          {activeFriend ? (
            <>
              <ChatWindow
                friend={activeFriend}
                messages={activeMessages}
                isTyping={isTyping}
                theme={theme}
                onOpenProfile={() => setShowProfileModal(true)}
                onAddReaction={handleAddReaction}
                onQuickReplySelect={(replyText) => handleSendMessage(replyText)}
                quickReplies={quickReplies}
                onTriggerCheckin={() => handleTriggerCheckin(selectedFriendId)}
              />

              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isTyping}
                theme={theme}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <p>Select a friend to start texting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && activeFriend && (
        <FriendProfileModal
          friend={activeFriend}
          onClose={() => setShowProfileModal(false)}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onClearHistory={handleClearHistory}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {showNewFriendModal && (
        <NewFriendModal
          onClose={() => setShowNewFriendModal(false)}
          onCreateFriend={handleCreateFriend}
        />
      )}

      {showScheduleModal && (
        <ScheduledTextModal
          friends={friends}
          scheduledList={scheduledList}
          onClose={() => setShowScheduleModal(false)}
          onAddSchedule={handleAddSchedule}
          onCancelSchedule={handleCancelSchedule}
        />
      )}
    </div>
  );
}
