import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, Volume2, VolumeX, Sparkles, Clock, Palette } from "lucide-react";
import { ThemeMode } from "../types";

interface PhoneHeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenScheduleModal: () => void;
  onOpenNewFriendModal: () => void;
}

export const PhoneHeader: React.FC<PhoneHeaderProps> = ({
  theme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  onOpenScheduleModal,
  onOpenNewFriendModal,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const getThemeClass = () => {
    switch (theme) {
      case "imessage":
        return "bg-slate-900/95 text-slate-100 border-slate-800";
      case "material":
        return "bg-slate-900 text-teal-400 border-teal-900/50";
      case "cyberpunk":
        return "bg-black text-cyan-400 border-cyan-900/50";
      case "lavender":
        return "bg-purple-950 text-purple-200 border-purple-800/50";
      case "retro":
        return "bg-emerald-950 text-emerald-400 border-emerald-800/50 font-mono";
      default:
        return "bg-slate-900 text-slate-100 border-slate-800";
    }
  };

  return (
    <header className={`w-full px-4 py-2 border-b flex items-center justify-between transition-colors duration-300 ${getThemeClass()}`}>
      {/* Phone Status Left: Time & Carrier */}
      <div className="flex items-center space-x-3 text-xs font-semibold tracking-tight">
        <span>{currentTime || "10:14 AM"}</span>
        <span className="hidden sm:inline-block opacity-60">|</span>
        <span className="hidden sm:inline-block font-normal opacity-80">Online Friend 5G</span>
      </div>

      {/* Center Title / Branding */}
      <div className="flex items-center space-x-1.5 font-bold text-xs sm:text-sm tracking-wide">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold">
          SMS Online Friend
        </span>
      </div>

      {/* Phone Status Right & Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Picker Dropdown */}
        <div className="relative group">
          <button
            title="Change Theme"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-1 text-xs"
          >
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline capitalize opacity-90">{theme}</span>
          </button>
          <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50 text-xs">
            <button
              onClick={() => onThemeChange("imessage")}
              className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${theme === "imessage" ? "text-blue-400 font-bold" : "text-slate-300"}`}
            >
              📱 iOS iMessage
            </button>
            <button
              onClick={() => onThemeChange("material")}
              className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${theme === "material" ? "text-teal-400 font-bold" : "text-slate-300"}`}
            >
              🤖 Material You
            </button>
            <button
              onClick={() => onThemeChange("cyberpunk")}
              className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${theme === "cyberpunk" ? "text-cyan-400 font-bold" : "text-slate-300"}`}
            >
              ⚡ Cyberpunk
            </button>
            <button
              onClick={() => onThemeChange("lavender")}
              className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${theme === "lavender" ? "text-purple-400 font-bold" : "text-slate-300"}`}
            >
              🌸 Lavender Glow
            </button>
            <button
              onClick={() => onThemeChange("retro")}
              className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${theme === "retro" ? "text-emerald-400 font-bold" : "text-slate-300"}`}
            >
              📟 Retro Phone
            </button>
          </div>
        </div>

        {/* Schedule Text Button */}
        <button
          onClick={onOpenScheduleModal}
          title="Scheduled Texts & Auto Check-ins"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-amber-400 flex items-center space-x-1 text-xs"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Schedule</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {/* Signal & Battery Icons */}
        <div className="hidden lg:flex items-center space-x-1.5 opacity-70 text-xs pl-1">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center space-x-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>
      </div>
    </header>
  );
};
