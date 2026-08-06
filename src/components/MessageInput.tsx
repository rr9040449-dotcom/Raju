import React, { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  Image as ImageIcon,
  X,
  Sparkles,
  Camera
} from "lucide-react";
import { ThemeMode } from "../types";

interface MessageInputProps {
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: "image" | "audio") => void;
  disabled?: boolean;
  theme: ThemeMode;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  theme,
}) => {
  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const samplePhotos = [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
  ];

  const quickEmojis = [
    "😀", "😂", "😍", "✨", "☕", "🎉", "🔥", "❤️", "👍", "🙌", "💯", "😴", "🎧", "🎮", "🍕", "🌟"
  ];

  const handleSend = () => {
    if ((!text.trim() && !attachedImage) || disabled) return;
    onSendMessage(text.trim(), attachedImage || undefined, attachedImage ? "image" : undefined);
    setText("");
    setAttachedImage(null);
    setShowEmojiPicker(false);
    setShowImagePicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopAndSendVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecordingVoice(false);
    onSendMessage(
      "🎙️ [Voice Message]",
      undefined,
      "audio"
    );
  };

  const cancelVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecordingVoice(false);
  };

  const getSendBtnStyle = () => {
    switch (theme) {
      case "imessage":
        return "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20";
      case "material":
        return "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20";
      case "cyberpunk":
        return "bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/30";
      case "lavender":
        return "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20";
      case "retro":
        return "bg-emerald-500 hover:bg-emerald-400 text-black font-bold";
      default:
        return "bg-blue-600 hover:bg-blue-500 text-white";
    }
  };

  return (
    <div className="p-3 border-t border-white/10 bg-slate-950/90 backdrop-blur-md relative z-20">
      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="mb-2 flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
          <img
            src={attachedImage}
            alt="Attached"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <span className="text-xs text-slate-300">Photo attached</span>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Active Banner */}
      {isRecordingVoice ? (
        <div className="flex items-center justify-between bg-red-950/80 border border-red-800/80 rounded-2xl p-3 animate-pulse">
          <div className="flex items-center space-x-2 text-xs text-red-300 font-semibold">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span>Recording Voice Note... 0:0{recordingSeconds}s</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={cancelVoiceRecording}
              className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={stopAndSendVoiceRecording}
              className="px-3 py-1 rounded-xl bg-red-600 text-white hover:bg-red-500 font-bold text-xs shadow-lg"
            >
              Send Voice Note
            </button>
          </div>
        </div>
      ) : (
        /* Standard SMS Input Bar */
        <div className="flex items-center space-x-2">
          {/* Photo Attachment Trigger */}
          <button
            onClick={() => {
              setShowImagePicker(!showImagePicker);
              setShowEmojiPicker(false);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title="Attach Photo"
          >
            <Camera className="w-4 h-4 text-blue-400" />
          </button>

          {/* Emoji Drawer Trigger */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowImagePicker(false);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title="Emoji Picker"
          >
            <Smile className="w-4 h-4 text-amber-400" />
          </button>

          {/* Textarea Input */}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Text message..."
              disabled={disabled}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
            />
          </div>

          {/* Mic / Voice Note Trigger */}
          <button
            onClick={startVoiceRecording}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4 text-purple-400" />
          </button>

          {/* Send SMS Button */}
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !attachedImage) || disabled}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${getSendBtnStyle()}`}
            title="Send SMS"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Drawer Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 w-64 grid grid-cols-8 gap-1.5 animate-fade-in">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-base hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Photo Picker Popup */}
      {showImagePicker && (
        <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 w-80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span>Select Sample Photo to Send</span>
            <button
              onClick={() => setShowImagePicker(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {samplePhotos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Sample"
                onClick={() => {
                  setAttachedImage(url);
                  setShowImagePicker(false);
                }}
                className="w-full h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform border border-slate-700"
              />
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400">Or enter Image URL:</span>
            <div className="flex space-x-1">
              <input
                type="text"
                placeholder="https://..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
              <button
                onClick={() => {
                  if (customImageUrl.trim()) {
                    setAttachedImage(customImageUrl.trim());
                    setCustomImageUrl("");
                    setShowImagePicker(false);
                  }
                }}
                className="px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
