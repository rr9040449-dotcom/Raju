import React, { useState } from "react";
import {
  X,
  Heart,
  Brain,
  Trash2,
  Plus,
  Phone,
  Sparkles,
  Award,
  RefreshCw,
  Star
} from "lucide-react";
import { FriendProfile } from "../types";

interface FriendProfileModalProps {
  friend: FriendProfile;
  onClose: () => void;
  onAddMemory: (friendId: string, text: string) => void;
  onDeleteMemory: (friendId: string, memoryId: string) => void;
  onClearHistory: (friendId: string) => void;
  onToggleFavorite: (friendId: string) => void;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  onClose,
  onAddMemory,
  onDeleteMemory,
  onClearHistory,
  onToggleFavorite,
}) => {
  const [newMemoryText, setNewMemoryText] = useState("");

  const handleAddMem = () => {
    if (!newMemoryText.trim()) return;
    onAddMemory(friend.id, newMemoryText.trim());
    setNewMemoryText("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className={`p-6 bg-gradient-to-r ${friend.avatarColor || "from-blue-600 to-purple-600"} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-2 mt-2">
            <img
              src={friend.avatarUrl}
              alt={friend.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  friend.name
                )}&background=3b82f6&color=fff`;
              }}
            />
            <div>
              <h2 className="text-xl font-extrabold">{friend.name}</h2>
              <p className="text-xs text-white/80 font-medium">{friend.phoneNumber}</p>
            </div>

            <button
              onClick={() => onToggleFavorite(friend.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 border ${
                friend.isFavorite
                  ? "bg-amber-400 text-black border-amber-300"
                  : "bg-black/20 text-white border-white/30 hover:bg-black/40"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${friend.isFavorite ? "fill-current" : ""}`} />
              <span>{friend.isFavorite ? "Starred Contact" : "Star Contact"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Relationship Level Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-pink-400">
                <Heart className="w-4 h-4 fill-current" />
                <span>Friendship Bond</span>
              </span>
              <span className="text-white font-bold">{friend.relationshipLevel}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${friend.relationshipLevel}%` }}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              {friend.relationshipLevel > 80
                ? "Close Besties • High Trust & Deep Chats"
                : "Great Online Buddies • Regular SMS Chats"}
            </p>
          </div>

          {/* Bio & Tone */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">About {friend.name}</h3>
            <p className="text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800/80 leading-relaxed text-slate-300">
              {friend.bio}
            </p>
          </div>

          {/* Hobbies / Interests */}
          {friend.hobbies && friend.hobbies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Interests & Hobbies</h3>
              <div className="flex flex-wrap gap-1.5">
                {friend.hobbies.map((hobby, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Friendship Memory Vault */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Memory Vault</span>
              </h3>
              <span className="text-[10px] text-slate-500">{friend.memories?.length || 0} facts saved</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {(!friend.memories || friend.memories.length === 0) ? (
                <p className="text-xs text-slate-500 italic p-2 bg-slate-950 rounded-xl">
                  No memories saved yet. As you chat, {friend.name} will remember things about you!
                </p>
              ) : (
                friend.memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-300 flex-1 pr-2">"{mem.text}"</span>
                    <button
                      onClick={() => onDeleteMemory(friend.id, mem.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Forget Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Fact / Memory */}
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Teach friend a fact about you..."
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMem()}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500"
              />
              <button
                onClick={handleAddMem}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Clear Chat */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (confirm(`Clear all chat history with ${friend.name}?`)) {
                  onClearHistory(friend.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Chat History</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
