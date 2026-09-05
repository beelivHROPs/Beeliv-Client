"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a working show/hide toggle — approved this session for
 * the new gradient-header + overlapping-card login/apply screens
 * (app/login/page.tsx, app/apply/[id]/page.tsx). Per this session's research:
 * no leading icon (shared Input has no icon slot), trailing Eye/EyeOff
 * toggle only. The toggle is the ONE interactive control on these otherwise
 * disabled/structural screens — it's pure client-side UI state (no auth
 * action), so it's exempt from the "everything disabled" convention used
 * for every other field/button on both pages. Shared between both screens
 * so login and apply stay visually/behaviourally consistent.
 */
export function PasswordField({
  id,
  label,
  autoComplete,
  disabled = true,
  title,
  placeholder = "••••••••",
  className,
  labelClassName = "block text-sm font-medium text-foreground",
  inputClassName = "",
  toggleClassName = "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
}: {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  disabled?: boolean;
  title?: string;
  placeholder?: string;
  className?: string;
  /** Override for the on-purple auth screens (AuthPageShell), where the
   *  default dark label/icon colors are invisible against bg-auth-glow. */
  labelClassName?: string;
  inputClassName?: string;
  toggleClassName?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          title={title}
          placeholder={placeholder}
          className={cn("h-11 pr-10 text-base", inputClassName)}
        />
        {/* Genuinely interactive — flips both the icon and the input's
            `type` together, regardless of the input's own disabled state
            (visibility toggling isn't an auth action, so it stays usable
            even while the field itself is structural/disabled). */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center px-3 transition-colors focus-visible:outline-none",
            toggleClassName
          )}
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </div>
  );
}
