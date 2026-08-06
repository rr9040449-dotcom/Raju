import React, { useState } from "react";
import { X, Clock, Zap, Plus, Trash2, Calendar, Sparkles } from "lucide-react";
import { FriendProfile, ScheduledText } from "../types";

interface ScheduledTextModalProps {
  friends: FriendProfile[];
  scheduledList: ScheduledText[];
  onClose: () => void;
  onAddSchedule: (friendId: string, topic: string, delaySeconds: number) => void;
  onCancelSchedule: (id: string) => void;
}

export const ScheduledTextModal: React.FC<ScheduledTextModalProps> = ({
  friends,
  scheduledList,
  onClose,
  onAddSchedule,
  onCancelSchedule,
}) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id || "");
  const [topic, setTopic] = useState("Casual check-in & hello");
  const [delaySecs, setDelaySecs] = useState<number>(10);

  const presetTopics = [
    "Morning motivation & coffee text ☕",
    "How's work/study going today? 📚",
    "Evening unwind check-in 🌙",
    "Ask if I drank water today! 💧",
    "Send me a funny joke or meme! 😂",
  ];

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriendId) return;
    onAddSchedule(selectedFriendId, topic, delaySecs);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Scheduled SMS Check-ins</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          {/* New Schedule Form */}
          <form onSubmit={handleScheduleSubmit} className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Schedule Auto SMS</span>
            </h3>

            {/* Friend Selector */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Friend</label>
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.nickname || f.phoneNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Topic & Presets */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMS Topic or Prompt</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 mb-2"
              />
              <div className="flex flex-wrap gap-1">
                {presetTopics.map((pt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(pt)}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800"
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Delay Selector */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Send Text In:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "10 Seconds", val: 10 },
                  { label: "1 Minute", val: 60 },
                  { label: "5 Minutes", val: 300 },
                  { label: "15 Minutes", val: 900 },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setDelaySecs(d.val)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      delaySecs === d.val
                        ? "bg-amber-500 text-black border-amber-400"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center space-x-1 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Auto Text</span>
            </button>
          </form>

          {/* List of Pending Scheduled Texts */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Pending Scheduled Texts ({scheduledList.length})
            </h3>

            {scheduledList.length === 0 ? (
              <p className="p-3 text-center text-slate-500 text-xs italic bg-slate-950 rounded-2xl">
                No active scheduled texts. Schedule one above!
              </p>
            ) : (
              scheduledList.map((st) => {
                const targetFriend = friends.find((f) => f.id === st.friendId);
                return (
                  <div
                    key={st.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{targetFriend?.name || "Friend"}</span>
                        <span className="text-[10px] text-amber-400 font-normal">
                          ({st.delaySeconds}s timer)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">"{st.promptTopic}"</p>
                    </div>

                    <button
                      onClick={() => onCancelSchedule(st.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900"
                      title="Cancel Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
