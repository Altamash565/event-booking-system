import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { IconCircleCheck, IconInfoCircle, IconAlertTriangle, IconAlertOctagon, IconLoader } from "@tabler/icons-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <IconCircleCheck className="size-5 text-emerald-500 dark:text-emerald-400" />
        ),
        info: (
          <IconInfoCircle className="size-5 text-sky-500 dark:text-sky-400" />
        ),
        warning: (
          <IconAlertTriangle className="size-5 text-amber-500 dark:text-amber-400" />
        ),
        error: (
          <IconAlertOctagon className="size-5 text-rose-500 dark:text-rose-400" />
        ),
        loading: (
          <IconLoader className="size-5 animate-spin text-primary" />
        ),
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "inherit",
          "--normal-border": "transparent",
          "--border-radius": "14px"
        }
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/80 dark:group-[.toaster]:bg-[#121414]/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-black/[0.06] dark:group-[.toaster]:border-white/[0.08] group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:group-[.toaster]:shadow-[0_16px_40px_rgb(0,0,0,0.4)] group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-3 group-[.toaster]:transition-all group-[.toaster]:duration-300 relative overflow-hidden",
          title: "font-semibold text-[14px] font-sans tracking-tight text-[#1a1c1c] dark:text-[#e2e2e2]",
          description: "text-[12px] text-[#555555] dark:text-[#aa8984] font-sans mt-0.5",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-medium py-1.5 px-3 rounded-lg transition-colors hover:bg-primary/90",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs font-medium py-1.5 px-3 rounded-lg transition-colors hover:bg-muted/80",
          success: "group-[.toast]:border-emerald-500/10 group-[.toast]:bg-emerald-500/[0.01] dark:group-[.toast]:bg-emerald-500/[0.005]",
          error: "group-[.toast]:border-rose-500/10 group-[.toast]:bg-rose-500/[0.01] dark:group-[.toast]:bg-rose-500/[0.005]",
          warning: "group-[.toast]:border-amber-500/10 group-[.toast]:bg-amber-500/[0.01] dark:group-[.toast]:bg-amber-500/[0.005]",
          info: "group-[.toast]:border-sky-500/10 group-[.toast]:bg-sky-500/[0.01] dark:group-[.toast]:bg-sky-500/[0.005]",
        },
      }}
      {...props} />
  );
}

export { Toaster }
