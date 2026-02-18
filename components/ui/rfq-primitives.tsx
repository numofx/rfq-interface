import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

export function SurfaceCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-surface)] p-3 sm:p-3.5",
        className
      )}
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1 block text-[11px] font-semibold text-[var(--inst-label)]", className)} {...props} />
  );
}

export function HelperText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[12px] leading-[1.3] text-[var(--inst-muted)]", className)} {...props} />;
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export function TextInput({
  className,
  leftAdornment,
  rightAdornment,
  ...props
}: TextInputProps) {
  if (!leftAdornment && !rightAdornment) {
    return (
      <input
        className={cn(
          "h-[44px] w-full rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 text-[14px] text-[var(--inst-text)] placeholder:text-[var(--inst-placeholder)] focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className="flex h-[44px] items-center rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3">
      {leftAdornment ? <div className="mr-3 text-[var(--inst-muted)]">{leftAdornment}</div> : null}
      <input
        className={cn(
          "h-full w-full bg-transparent text-[14px] text-[var(--inst-text)] placeholder:text-[var(--inst-placeholder)] focus:outline-none",
          className
        )}
        {...props}
      />
      {rightAdornment ? <div className="ml-3">{rightAdornment}</div> : null}
    </div>
  );
}

export function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-[44px] w-full rounded-[12px] bg-gradient-to-r from-[var(--inst-primary-start)] to-[var(--inst-primary-end)] text-[14px] font-semibold text-[var(--inst-primary-text)] shadow-[0_2px_0_rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  className?: string;
  optionClassName?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  optionClassName,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("grid gap-1 rounded-[12px] bg-[var(--inst-control)] p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-[10px] px-3 text-[13px] font-medium text-[var(--inst-label)]",
              isActive && "bg-[var(--inst-control-active)] font-semibold text-[var(--inst-text)]",
              optionClassName
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface DropdownOption<T extends string> {
  value: T;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

interface DropdownSelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  className?: string;
}

export function DropdownSelect<T extends string>({
  value,
  options,
  onChange,
  className,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[44px] w-full items-center justify-between rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 text-left text-[14px] text-[var(--inst-text)]"
      >
        <span className="flex items-center gap-2">
          {selected?.leading ? <span className="shrink-0">{selected.leading}</span> : null}
          <span className="font-semibold">{selected?.label ?? value}</span>
          {selected?.trailing ? <span className="shrink-0">{selected.trailing}</span> : null}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[var(--inst-muted)] transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-[24px] border border-[#d9dae0] bg-[#f4f4f5] p-5 shadow-[0_14px_28px_rgba(0,0,0,0.10)]">
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-left text-[12px] font-semibold text-[#131318]",
                    isSelected && "bg-[#ebebee]"
                  )}
                >
                  <span className="w-5 text-[#7b7d8a]">{isSelected ? <Check className="h-4 w-4" /> : null}</span>
                  {option.leading ? <span className="shrink-0">{option.leading}</span> : null}
                  <span>{option.label}</span>
                  {option.trailing ? <span className="shrink-0">{option.trailing}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
