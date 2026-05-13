import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { isSuperAdmin } from "@/lib/admins";
import { motion } from "framer-motion";

export function FloatingAdminButton({ onClick }: { onClick?: () => void }) {
  const { user, userData } = useAuth();
  
  const isSuper = user ? isSuperAdmin(user.email) : false;
  const isAuthorized = user && (userData?.isAdmin || isSuper);

  if (!isAuthorized) return null;

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      whileHover={{ x: -5 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-blue-600 text-white p-3 rounded-l-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] border-y border-l border-blue-400/30 flex items-center gap-2 group transition-all"
    >
      <ShieldAlert size={20} className="group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-300">
        SuperAdmin
      </span>
    </motion.button>
  );
}
