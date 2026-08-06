import React, { useRef, useEffect, useState } from "react";
import {
  Phone,
  Video,
  Info,
  Heart,
  Smile,
  Check,
  CheckCheck,
  Play,
  Pause,
  Image as ImageIcon,
  Sparkles,
  Zap,
  MoreVertical,
  Volume2
} from "lucide-react";
import { FriendProfile, Message, ThemeMode } from "../types";

interface ChatWindowProps {
  friend: FriendProfile;
  messages: Message[];
  isTyping: boolean;
  theme: ThemeMode;
  onOpenProfile: () => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onQuickReplySelect: (text: string) => void;
  quickReplies: string[];
  onTriggerCheckin: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  friend,
  messages,
  isTyping,
  theme,
  onOpenProfile,
  onAddReaction,
  onQuickReplySelect,
  quickReplies,
  onTriggerCheckin,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [callModal, setCallModal] = useState<"audio" | "video" | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const reactionEmojis = ["❤️", "😂", "👍", "😮", "🔥", "✨"];

  // Toggle audio voice message play
  const handlePlayAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 4000);
    }
  };

  const getChatBg = () => {
    switch (theme) {
      case "imessage":
        return "bg-slate-900 text-slate-100";
      case "material":
        return "bg-slate-900 text-teal-100";
      case "cyberpunk":
        return "bg-slate-950 text-cyan-200 bg-[radial-gradient(#155e75_1px,transparent_1px)] [background-size:16px_16px]";
      case "lavender":
        return "bg-slate-950 text-purple-100";
      case "retro":
        return "bg-slate-950 text-emerald-400 font-mono";
      default:
        return "bg-slate-900 text-slate-100";
    }
  };

  const getUserBubbleStyle = () => {
    switch (theme) {
      case "imessage":
        return "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20";
      case "material":
        return "bg-teal-600 text-white shadow-lg shadow-teal-500/20";
      case "cyberpunk":
        return "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/20";
      case "lavender":
        return "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20";
      case "retro":
        return "bg-emerald-600 text-black font-semibold border border-emerald-400";
      default:
        return "bg-blue-600 text-white";
    }
  };

  const getFriendBubbleStyle = () => {
    switch (theme) {
      case "imessage":
        return "bg-slate-800/90 text-slate-100 border border-slate-700/50 shadow-md";
      case "material":
        return "bg-slate-800 text-teal-100 border border-slate-700/50";
      case "cyberpunk":
        return "bg-slate-900/90 text-cyan-300 border border-cyan-800/50";
      case "lavender":
        return "bg-slate-900/90 text-purple-200 border border-purple-800/50";
      case "retro":
        return "bg-slate-900 text-emerald-400 border border-emerald-800/80 font-mono";
      default:
        return "bg-slate-800 text-slate-100";
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative transition-colors duration-300 overflow-hidden ${getChatBg()}`}>
      {/* Chat Window Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
        {/* Contact Info */}
        <div
          onClick={onOpenProfile}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={friend.avatarUrl}
              alt={friend.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  friend.name
                )}&background=3b82f6&color=fff`;
              }}
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                friend.status === "online" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            ></span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-bold text-sm sm:text-base group-hover:text-blue-400 transition-colors">
                {friend.nickname || friend.name}
              </h2>
              <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                ({friend.phoneNumber})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
              <span>{isTyping ? "Typing a text..." : friend.statusText}</span>
            </p>
          </div>
        </div>

        {/* Action Call & Info Controls */}
        <div className="flex items-center space-x-2">
          {/* Simulate Phone Call */}
          <button
            onClick={() => setCallModal("audio")}
            title="Simulate Voice Call"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Simulate FaceTime / Video Call */}
          <button
            onClick={() => setCallModal("video")}
            title="Simulate Video FaceTime"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <Video className="w-4 h-4 text-blue-400" />
          </button>

          {/* Proactive Text Ping Trigger */}
          <button
            onClick={onTriggerCheckin}
            title="Request Instant Check-in Text"
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors border border-amber-500/30 flex items-center space-x-1 text-xs"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">Ping Me</span>
          </button>

          {/* Contact Details Info */}
          <button
            onClick={onOpenProfile}
            title="Friend Profile & Memories"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <Info className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date Stamp Divider */}
        <div className="text-center my-2">
          <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[10px] text-slate-400 uppercase tracking-widest">
            SMS Conversation • Encryption Active
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-400 animate-spin" />
            <p className="font-semibold text-slate-300">No messages yet!</p>
            <p className="mt-1">Send a friendly text to start chatting with {friend.name}.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} group relative`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser ? getUserBubbleStyle() : getFriendBubbleStyle()
                  }`}
                >
                  {/* Photo Attachment if present */}
                  {msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
                         onClick={() => setImagePreviewUrl(msg.mediaUrl || null)}>
                      <img
                        src={msg.mediaUrl}
                        alt="Shared media"
                        className="w-full max-h-60 object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Audio Voice Note if present */}
                  {msg.mediaType === "audio" && (
                    <div className="flex items-center space-x-3 mb-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                      <button
                        onClick={() => handlePlayAudio(msg.id)}
                        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors"
                      >
                        {playingAudioId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                          <span>Voice Note</span>
                          <span>0:08</span>
                        </div>
                        {/* Audio Waveform visualizer */}
                        <div className="flex items-center space-x-1 h-3">
                          {[40, 70, 30, 90, 60, 100, 50, 80, 40, 60, 30, 80].map((height, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${height}%` }}
                              className={`w-1 rounded-full ${
                                playingAudioId === msg.id
                                  ? "bg-blue-400 animate-pulse"
                                  : "bg-slate-500"
                              }`}
                            ></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Message */}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                  {/* Reaction chips on bottom corner of bubble */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="absolute -bottom-2.5 right-2 flex items-center space-x-0.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full shadow-lg text-[11px]">
                      {msg.reactions.map((r, i) => (
                        <span key={i}>{r.emoji}</span>
                      ))}
                    </div>
                  )}

                  {/* Quick Reaction Action Trigger on Hover */}
                  <button
                    onClick={() =>
                      setActiveReactionMenu(
                        activeReactionMenu === msg.id ? null : msg.id
                      )
                    }
                    className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:scale-110"
                    title="React to text"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Reaction Picker Overlay */}
                  {activeReactionMenu === msg.id && (
                    <div className="absolute -top-10 left-0 bg-slate-950 border border-slate-700 rounded-full px-2 py-1 shadow-2xl flex items-center space-x-1.5 z-20 animate-fade-in">
                      {reactionEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onAddReaction(msg.id, emoji);
                            setActiveReactionMenu(null);
                          }}
                          className="hover:scale-125 transition-transform text-sm p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp & Status */}
                <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1 px-1">
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-400 inline" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Friend Typing Indicator Bubble */}
        {isTyping && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <img
              src={friend.avatarUrl}
              alt={friend.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className={`${getFriendBubbleStyle()} rounded-2xl px-3 py-2 flex items-center space-x-1.5`}>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] text-slate-500">{friend.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Reply Chips */}
      {quickReplies && quickReplies.length > 0 && !isTyping && (
        <div className="px-4 py-2 border-t border-white/5 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex-shrink-0">Quick Reply:</span>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => onQuickReplySelect(reply)}
              className="px-3 py-1 rounded-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs whitespace-nowrap transition-all hover:scale-105"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {imagePreviewUrl && (
        <div
          onClick={() => setImagePreviewUrl(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/20"
          />
        </div>
      )}

      {/* Simulated Phone/FaceTime Call Modal Overlay */}
      {callModal && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-between p-8 backdrop-blur-xl animate-fade-in">
          {/* Call Header */}
          <div className="text-center space-y-2 mt-8">
            <img
              src={friend.avatarUrl}
              alt={friend.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-500 shadow-2xl animate-pulse"
            />
            <h3 className="text-xl font-bold text-white">{friend.name}</h3>
            <p className="text-xs text-blue-400 font-medium">
              {callModal === "audio" ? "Simulated Voice Call..." : "Simulated FaceTime Video..."}
            </p>
          </div>

          {/* Call Waveform / Camera Box */}
          <div className="w-full max-w-sm h-48 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-4 space-y-3">
            <Volume2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <p className="text-xs text-slate-400 text-center">
              "Hey! Calling you right now! Let's talk soon!"
            </p>
          </div>

          {/* Call End Control */}
          <div className="mb-8">
            <button
              onClick={() => setCallModal(null)}
              className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold shadow-2xl transition-transform hover:scale-110 flex items-center space-x-2"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
              <span className="text-sm">End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
