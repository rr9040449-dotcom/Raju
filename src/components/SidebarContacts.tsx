import React, { useState } from "react";
import { Search, UserPlus, Star, Sparkles, MessageSquare, Zap, Radio } from "lucide-react";
import { FriendProfile, Message, ThemeMode } from "../types";

interface SidebarContactsProps {
  friends: FriendProfile[];
  selectedFriendId: string;
  onSelectFriend: (id: string) => void;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onOpenNewFriendModal: () => void;
  onTriggerCheckin: (friendId: string) => void;
  theme: ThemeMode;
}

export const SidebarContacts: React.FC<SidebarContactsProps> = ({
  friends,
  selectedFriendId,
  onSelectFriend,
  messages,
  unreadCounts,
  onToggleFavorite,
  onOpenNewFriendModal,
  onTriggerCheckin,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites" | "online">("all");

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.personality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (friend.bio && friend.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "favorites") return friend.isFavorite;
    if (filter === "online") return friend.status === "online";
    return true;
  });

  const getSidebarBg = () => {
    switch (theme) {
      case "imessage":
        return "bg-slate-950 border-slate-800 text-slate-100";
      case "material":
        return "bg-slate-950 border-teal-900/40 text-slate-100";
      case "cyberpunk":
        return "bg-slate-950 border-cyan-900/40 text-cyan-100";
      case "lavender":
        return "bg-purple-950/90 border-purple-800/40 text-purple-100";
      case "retro":
        return "bg-slate-950 border-emerald-900/40 text-emerald-300 font-mono";
      default:
        return "bg-slate-950 border-slate-800 text-slate-100";
    }
  };

  return (
    <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r flex flex-col h-full transition-colors duration-300 ${getSidebarBg()}`}>
      {/* Sidebar Header & Action Controls */}
      <div className="p-3 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base tracking-tight">SMS Messages</h2>
          </div>
          <button
            onClick={onOpenNewFriendModal}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center space-x-1 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            title="Create Custom Online Friend"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search friends or chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === "favorites"
                ? "bg-amber-500 text-black font-semibold"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Starred</span>
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === "online"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Online</span>
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filteredFriends.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <Radio className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
            <p className="font-medium">No online friends found</p>
            <p className="mt-1 text-[11px]">Try adjusting your search or add a new friend.</p>
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const friendMsgs = messages[friend.id] || [];
            const lastMsg = friendMsgs[friendMsgs.length - 1];
            const unreadCount = unreadCounts[friend.id] || 0;
            const isSelected = friend.id === selectedFriendId;

            return (
              <div
                key={friend.id}
                onClick={() => onSelectFriend(friend.id)}
                className={`group relative p-3 flex items-center space-x-3 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-600/15 border-l-4 border-blue-500 text-slate-100"
                    : "hover:bg-slate-900/60 text-slate-300"
                }`}
              >
                {/* Avatar with Status Badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10 ring-2 ring-slate-900 shadow-md"
                    onError={(e) => {
                      // Fallback avatar generator
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        friend.name
                      )}&background=3b82f6&color=fff`;
                    }}
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                      friend.status === "online"
                        ? "bg-emerald-500"
                        : friend.status === "away"
                        ? "bg-amber-500"
                        : "bg-slate-500"
                    }`}
                  ></span>
                </div>

                {/* Info & Last Msg */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center space-x-1 truncate">
                      <h3 className="font-semibold text-xs sm:text-sm truncate text-slate-100">
                        {friend.nickname || friend.name}
                      </h3>
                      {friend.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {lastMsg ? lastMsg.timestamp : "New"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <p className="text-slate-400 text-[11px] truncate pr-2">
                      {lastMsg
                        ? lastMsg.sender === "user"
                          ? `You: ${lastMsg.text}`
                          : lastMsg.text
                        : friend.statusText}
                    </p>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(friend.id);
                        }}
                        className={`p-1 hover:text-amber-400 transition-colors ${
                          friend.isFavorite ? "text-amber-400" : "text-slate-600 opacity-0 group-hover:opacity-100"
                        }`}
                        title={friend.isFavorite ? "Unstar Contact" : "Star Contact"}
                      >
                        <Star className={`w-3.5 h-3.5 ${friend.isFavorite ? "fill-current" : ""}`} />
                      </button>

                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px] animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instant Ping Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerCheckin(friend.id);
                  }}
                  title={`Simulate instant SMS text from ${friend.name}`}
                  className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all border border-amber-500/30"
                >
                  <Zap className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-white/10 bg-black/30 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Gemini Powered</span>
        </div>
        <button
          onClick={() => {
            const randomFriend = friends[Math.floor(Math.random() * friends.length)];
            onTriggerCheckin(randomFriend.id);
          }}
          className="text-blue-400 hover:underline flex items-center space-x-1"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Random Ping</span>
        </button>
      </div>
    </aside>
  );
};
