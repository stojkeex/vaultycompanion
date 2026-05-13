import { cn } from "@/lib/utils";

interface VaultyIconProps {
  className?: string;
  size?: number | string;
}

export function VaultyIcon({ className, size = 16 }: VaultyIconProps) {
  return (
    <div 
      className={cn("inline-block rounded-full bg-zinc-800", className)}
      style={{ width: size, height: size }}
    />
  );
}
