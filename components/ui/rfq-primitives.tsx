import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

export function SurfaceCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-panel/55 p-3 sm:p-3.5 shadow-panel backdrop-blur-panel ring-1 ring-white/5",
        className
      )}
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1 block text-[11px] font-semibold text-muted", className)} {...props} />
  );
}

export function HelperText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[12px] leading-[1.3] text-muted", className)} {...props} />;
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
          "h-11 w-full rounded-xl border border-border/70 bg-panel-2/50 px-4 text-sm text-text placeholder:text-muted/60 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className="flex h-11 items-center rounded-xl border border-border/70 bg-panel-2/50 px-4">
      {leftAdornment ? <div className="mr-3 text-muted">{leftAdornment}</div> : null}
      <input
        className={cn(
          "h-full w-full bg-transparent text-sm text-text placeholder:text-muted/60 outline-none",
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
        "h-11 w-full rounded-xl bg-white text-black font-medium hover:bg-white/95 active:bg-white/90 disabled:opacity-50",
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
    <div className={cn("grid gap-1 rounded-xl border border-border/70 bg-panel-2/60 p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-lg px-3 text-[13px] font-medium text-muted",
              isActive && "bg-white font-semibold text-black",
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

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={cn(
        "grid h-9 w-full gap-1 rounded-full border border-border/70 bg-panel-2/80 p-1",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-7 rounded-full text-sm font-semibold transition-colors",
              isActive ? "bg-white text-black" : "bg-zinc-800 text-zinc-300"
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
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border/70 bg-panel-2/50 px-4 text-left text-sm text-text"
      >
        <span className="flex items-center gap-2">
          {selected?.leading ? <span className="shrink-0">{selected.leading}</span> : null}
          <span className="font-semibold">{selected?.label ?? value}</span>
          {selected?.trailing ? <span className="shrink-0">{selected.trailing}</span> : null}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-2xl border border-border/70 bg-panel p-5 shadow-panel backdrop-blur-panel">
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
                    "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-[12px] font-semibold text-text",
                    isSelected && "bg-panel-2/70"
                  )}
                >
                  <span className="w-5 text-muted">{isSelected ? <Check className="h-4 w-4" /> : null}</span>
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
