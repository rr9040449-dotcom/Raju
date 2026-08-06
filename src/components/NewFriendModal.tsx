import React, { useState } from "react";
import { X, Sparkles, UserPlus, Image as ImageIcon } from "lucide-react";
import { FriendProfile } from "../types";

interface NewFriendModalProps {
  onClose: () => void;
  onCreateFriend: (newFriend: FriendProfile, initialText?: string) => void;
}

export const NewFriendModal: React.FC<NewFriendModalProps> = ({
  onClose,
  onCreateFriend,
}) => {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [personality, setPersonality] = useState("");
  const [tone, setTone] = useState("Casual & friendly SMS style");
  const [hobbiesStr, setHobbiesStr] = useState("");
  const [initialText, setInitialText] = useState("");

  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `friend_${Date.now()}`;
    const generatedPhone = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newFriend: FriendProfile = {
      id,
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      phoneNumber: generatedPhone,
      avatarUrl: avatarUrl.trim() || presetAvatars[Math.floor(Math.random() * presetAvatars.length)],
      avatarColor: "from-blue-600 to-indigo-600",
      status: "online",
      statusText: "Ready to chat! 💬",
      bio: bio.trim() || `Your custom AI online friend, ${name}!`,
      personality: personality.trim() || "Friendly, engaging, and always ready to text.",
      tone: tone,
      hobbies: hobbiesStr ? hobbiesStr.split(",").map((s) => s.trim()) : ["Chatting", "Music"],
      relationshipLevel: 75,
      memories: [],
      isCustom: true,
      isFavorite: true,
    };

    onCreateFriend(
      newFriend,
      initialText.trim() || `Hey! So glad we connected! What's on your mind today? 😊`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Create Online Friend</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
          {/* Name & Nickname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Friend Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chloe, Alex, Sam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nickname / Emoji</label>
              <input
                type="text"
                placeholder="e.g. Chloe ✨"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Choose Avatar</label>
            <div className="flex items-center space-x-2 mb-2">
              {presetAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Preset"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                    avatarUrl === url ? "border-blue-500 scale-110" : "border-slate-800 opacity-70"
                  }`}
                />
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom image URL..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            />
          </div>

          {/* Bio & Backstory */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Bio / Backstory</label>
            <textarea
              rows={2}
              placeholder="e.g. Anime enthusiast who loves late-night talks and giving study advice."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Personality & Tone */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Personality Prompt</label>
              <input
                type="text"
                placeholder="e.g. Sarcastic, funny, warm, deeply empathetic, gamer"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">SMS Texting Style / Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="Casual & friendly SMS style with emojis">Casual & Upbeat (Emojis & Positivity)</option>
                <option value="Gen Z slang, lowercase vibe, 'fr fr', 'lol'">Gen Z Banter (lowercase, meme slang)</option>
                <option value="Warm, thoughtful, articulate & calm">Thoughtful & Calming Listener</option>
                <option value="High energy hype man, all caps, fire emojis">High Energy Gym / Motivation Hype</option>
                <option value="Sarcastic, witty, tech bro humor">Witty & Sarcastic Banter</option>
              </select>
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Hobbies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Gaming, Coffee, Cooking, Sci-fi"
              value={hobbiesStr}
              onChange={(e) => setHobbiesStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          {/* Initial Opening SMS */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">First Opening SMS Text</label>
            <input
              type="text"
              placeholder="e.g. Heyyy! So excited we can text! What are you up to?"
              value={initialText}
              onChange={(e) => setInitialText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Friend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
