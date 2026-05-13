import React from "react";
import { 
  Shield, Ban, AlertTriangle, Trash2, MoreVertical, ChevronRight, User as UserIcon, Calendar, Mail, Users, MessageSquare, ShieldCheck
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UserModerationProps {
  users: any[];
  onSelectUser: (user: any) => void;
  selectedUser: any | null;
  onCloseDetails: () => void;
}

export function UserModeration({ users, onSelectUser, selectedUser, onCloseDetails }: UserModerationProps) {
  return (
    <div className="relative h-full">
      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 h-full overflow-hidden flex flex-col">
        <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
          <Shield size={16} /> User Moderation
        </h3>
        <div className="space-y-3 overflow-y-auto pr-2 no-scrollbar flex-1">
          {users.map(u => (
            <div 
              key={u.id} 
              onClick={() => onSelectUser(u)}
              className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:bg-zinc-900 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black">
                      {u.displayName?.[0] || u.username?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-200">{u.displayName || u.username || "Unknown User"}</p>
                  <p className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    u.isBanned ? "text-red-500" : u.role === "companion" ? "text-cyan-500" : "text-emerald-500"
                  )}>
                    {u.isBanned ? "Banned" : u.role || "User"}
                  </p>
                </div>
              </div>
              
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 rounded-2xl p-2 w-48 shadow-2xl z-[150]">
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 text-yellow-500 focus:text-yellow-500 focus:bg-white/5">
                    <AlertTriangle size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">Send Warning</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <Ban size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">{u.isBanned ? "Unban User" : "Ban User"}</span>
                  </DropdownMenuItem>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-600 text-white focus:bg-red-600">
                    <Trash2 size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {users.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest italic">No users found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute inset-0 bg-[#0A0A0A] z-[120] p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={onCloseDetails}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black text-xs uppercase tracking-widest"
              >
                <ChevronRight className="rotate-180" size={16} />
                Back to List
              </button>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest px-4 h-9">Warn</Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 h-9">Ban User</Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 no-scrollbar space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-800 border border-white/10 overflow-hidden shadow-2xl">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                      {selectedUser.displayName?.[0] || selectedUser.username?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">{selectedUser.displayName || selectedUser.username || "Unknown User"}</h3>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic opacity-50">UID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard 
                  label="Email Address" 
                  value={selectedUser.email || "No email linked"} 
                  icon={<Mail size={14} className="text-cyan-500" />}
                />
                <InfoCard 
                  label="Joined Date" 
                  value={selectedUser.createdAt ? (typeof selectedUser.createdAt === 'object' && selectedUser.createdAt.seconds ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : new Date(selectedUser.createdAt).toLocaleDateString()) : "Not available"} 
                  icon={<Calendar size={14} className="text-purple-500" />}
                />
                <StatCard 
                  label="Characters Created" 
                  value={selectedUser.characterCount || 0} 
                  icon={<UserIcon size={14} />}
                  color="text-cyan-500"
                />
                <StatCard 
                  label="Followers" 
                  value={selectedUser.followerCount || 0} 
                  icon={<Users size={14} />}
                  color="text-purple-500"
                />
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} /> Account Security
                </p>
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Shield className="text-emerald-500" size={18} />
                    <span className="font-bold text-sm">Status</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl",
                    selectedUser.isBanned ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {selectedUser.isBanned ? "Banned" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="font-bold text-zinc-200 break-all">{value}</p>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className={cn("text-3xl font-black italic", color)}>{value}</p>
    </div>
  );
}