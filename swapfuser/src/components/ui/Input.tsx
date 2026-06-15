import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="font-label-caps text-label-caps text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded bg-surface-container-low border border-outline-variant/50 px-3 py-2.5",
            "font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
            "transition-colors duration-200",
            error && "border-error focus:border-error focus:ring-error/30",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      )}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="font-label-caps text-label-caps text-on-surface-variant">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded bg-surface-container-low border border-outline-variant/50 px-3 py-2.5 resize-none",
          "font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60",
          "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
          "transition-colors duration-200",
          error && "border-error focus:border-error focus:ring-error/30",
          className
        )}
        {...props}
      />
      {error && (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      )}
    </div>
  )
);
Textarea.displayName = "Textarea";

