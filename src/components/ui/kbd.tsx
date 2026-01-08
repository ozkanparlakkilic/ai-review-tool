import { cn } from "@/lib/utils";

type KbdProps = React.HTMLAttributes<HTMLElement>;

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-sans text-[10px] font-medium opacity-100 select-none",
        className
      )}
      {...props}
    />
  );
}
