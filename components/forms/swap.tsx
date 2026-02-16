"use client";

import { Check, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForwardRates } from "@/lib/hooks/useFxRates";
import { useRouter } from "next/navigation";

interface CalendarPickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

const CalendarPicker = ({
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarPickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1.5" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      date.setHours(0, 0, 0, 0);

      const isPast = date < today;
      const isSelected =
        date.toDateString() === new Date(selectedDate).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isPast) {
              const newDate = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );
              onDateSelect(newDate.toISOString().split("T")[0]);
              onClose();
            }
          }}
          disabled={isPast}
          className={`rounded-lg p-1.5 text-center text-sm font-medium transition ${
            isPast
              ? "cursor-not-allowed text-gray-300"
              : "cursor-pointer hover:bg-slate-100"
          } ${isSelected ? "bg-slate-900 text-white hover:bg-slate-900" : ""}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1)
    );
  };

  return (
    <div className="absolute bottom-full left-0 right-0 z-40 mb-2 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg p-1.5 text-lg hover:bg-gray-100"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="rounded-lg p-1.5 text-lg hover:bg-gray-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="p-1 text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
    </div>
  );
};

type OptionType = "call" | "put";
type Pair = "USDC/cNGN" | "USDT/KESm";

export function ForwardInterface() {
  const router = useRouter();
  const [optionType, setOptionType] = useState<OptionType>("call");
  const [selectedPair, setSelectedPair] = useState<Pair>("USDC/cNGN");
  const [showPairMenu, setShowPairMenu] = useState(false);
  const [usdAmount, setUsdAmount] = useState("");
  const [strikePrice, setStrikePrice] = useState("2,200.00");
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(9);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const pairRef = useRef<HTMLDivElement>(null);

  const { data: forwardRateData, isLoading } = useForwardRates("3M");

  const pairOptions = ["USDC/cNGN", "USDT/KESm"] as const;
  const tokenIcon: Record<"USDC" | "cNGN" | "USDT" | "KESm", string> = {
    USDC: "/tokens/usdc.svg",
    cNGN: "/tokens/cngn.svg",
    USDT: "/tokens/usdt.svg",
    KESm: "/tokens/kesm.svg",
  };
  const pairMeta: Record<Pair, { network: string; swatch: string }> = {
    "USDC/cNGN": { network: "Base", swatch: "bg-[#2126F8]" },
    "USDT/KESm": { network: "Celo", swatch: "bg-[#E5DB2B]" },
  };

  const PairIconSplit = ({
    base,
    quote,
    compact = false,
  }: {
    base: keyof typeof tokenIcon;
    quote: keyof typeof tokenIcon;
    compact?: boolean;
  }) => (
      <div className={`flex items-center ${compact ? "-space-x-1.5" : "-space-x-2"}`}>
      <div
        className={`relative overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.14)] ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
      >
        <Image
          src={tokenIcon[base]}
          alt={`${base} logo`}
          fill
          sizes={compact ? "32px" : "40px"}
          className="object-cover"
        />
      </div>
      <div
        className={`relative overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.14)] ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
      >
        <Image
          src={tokenIcon[quote]}
          alt={`${quote} logo`}
          fill
          sizes={compact ? "32px" : "40px"}
          className="object-cover"
        />
      </div>
    </div>
  );

  const renderPairLabel = (pair: Pair, compact = false) => {
    const [base, quote] = pair.split("/") as [keyof typeof tokenIcon, keyof typeof tokenIcon];
    const meta = pairMeta[pair];

    return (
      <div className="flex items-center gap-3">
        <PairIconSplit base={base} quote={quote} compact={compact} />
        <div className={`flex items-center ${compact ? "text-[14px]" : "text-[16px]"} leading-none`}>
          <span className="font-semibold text-slate-800">{pair}</span>
          <span className="mx-1 text-[#8E8A87]">·</span>
          <span className={`mr-1 inline-block ${compact ? "h-3 w-3" : "h-4 w-4"} ${meta.swatch}`} />
          <span className="font-semibold text-[#8E8A87]">{meta.network}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => (prev <= 1 ? 9 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (pairRef.current && !pairRef.current.contains(event.target as Node)) {
        setShowPairMenu(false);
      }
    };
    if (showCalendar || showPairMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar, showPairMenu]);

  const parsedNotional = Number(usdAmount.replace(/,/g, "")) || 0;
  const parsedStrike = Number(strikePrice.replace(/[^0-9.]/g, "")) || 1;
  const indicativePrice = forwardRateData?.forwardPoints || 13.33;
  const ivValue = 69.03;
  const contractCount = parsedNotional > 0 ? parsedNotional / Math.max(parsedStrike, 0.0001) : 0;
  const estimatedPremium = contractCount * indicativePrice;
  const premiumPct = parsedNotional > 0 ? (estimatedPremium / parsedNotional) * 100 : 0;
  const pairScenario = selectedPair === "USDC/cNGN"
    ? { up: 2600, flat: 1500 }
    : { up: 160, flat: 130 };

  const calculatePayout = (spotAtExpiry: number) => {
    if (optionType === "call") {
      return Math.max(spotAtExpiry - parsedStrike, 0) * contractCount;
    }
    return Math.max(parsedStrike - spotAtExpiry, 0) * contractCount;
  };

  const payoutAtUp = calculatePayout(pairScenario.up);
  const payoutAtFlat = calculatePayout(pairScenario.flat);

  const displayDate = new Date(expiryDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
  const [baseCurrency, quoteCurrency] = selectedPair.split("/") as [Pair extends `${infer A}/${infer B}` ? A : never, Pair extends `${infer A}/${infer B}` ? B : never];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--fx-bg)] px-4 py-4 [font-family:Inter,'SF_Pro_Text',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <div className="relative w-full max-w-[470px]">
        <div className="fixed left-24 top-12 z-20 flex items-center gap-2">
          <Image src="/numo.png" alt="Numo" width={112} height={39} className="h-8 w-auto" />
          <div className="h-5 w-px bg-[var(--fx-border)]" />
          <h1 className="text-[18px] font-semibold text-[var(--fx-heading)]">FX Options</h1>
        </div>

        <div className="rounded-[26px] border border-[rgba(226,232,240,0.92)] bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)] backdrop-blur-[6px]">
        <div className="space-y-2">
          <div className="relative" ref={pairRef}>
            <button
              onClick={() => setShowPairMenu((prev) => !prev)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--fx-border)] bg-[#F8FAFC] px-3 text-left shadow-[0_2px_6px_rgba(15,23,42,0.04)] transition"
              aria-haspopup="menu"
              aria-expanded={showPairMenu}
              aria-label="Select pair"
            >
              {renderPairLabel(selectedPair)}
              {showPairMenu ? (
                <ChevronUp className="h-4 w-4 text-[var(--fx-secondary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--fx-secondary)]" />
              )}
            </button>
            {showPairMenu && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[20px] border border-[var(--fx-border)] bg-[var(--fx-card)] p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)]">
                <p className="mb-2 px-1 text-[10px] font-semibold tracking-wide text-[var(--fx-secondary)]">
                  SELECT PAIR
                </p>
                <div className="space-y-1.5">
                  {pairOptions.map((pair) => {
                    const isSelected = selectedPair === pair;
                    return (
                      <button
                        key={pair}
                        onClick={() => {
                          setSelectedPair(pair);
                          setShowPairMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                          isSelected ? "bg-[#F1F5F9]" : "bg-[var(--fx-card)]"
                        }`}
                      >
                        {renderPairLabel(pair, true)}
                        {isSelected ? <Check className="h-5 w-5 text-black" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            className="grid h-11 grid-cols-2 gap-2"
            role="tablist"
            aria-label="Option type"
          >
            <button
              type="button"
              onClick={() => setOptionType("call")}
              role="tab"
              aria-selected={optionType === "call"}
              className={`flex h-full items-center justify-center rounded-xl border px-4 text-[14px] font-semibold tracking-tight transition focus-visible:outline-none ${
                optionType === "call"
                  ? "border-[#111827] bg-[#111827] text-white shadow-[0_2px_6px_rgba(17,24,39,0.28)]"
                  : "border-[#D1D5DB] bg-[#F3F4F6] text-[var(--fx-label)] hover:bg-[#E5E7EB]"
              }`}
            >
              Call
            </button>
            <button
              type="button"
              onClick={() => setOptionType("put")}
              role="tab"
              aria-selected={optionType === "put"}
              className={`flex h-full items-center justify-center rounded-xl border px-4 text-[14px] font-semibold tracking-tight transition focus-visible:outline-none ${
                optionType === "put"
                  ? "border-[#111827] bg-[#111827] text-white shadow-[0_2px_6px_rgba(17,24,39,0.28)]"
                  : "border-[#D1D5DB] bg-[#F3F4F6] text-[var(--fx-label)] hover:bg-[#E5E7EB]"
              }`}
            >
              Put
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div ref={calendarRef} className="relative">
              <label className="mb-1 block text-[13px] font-semibold text-[var(--fx-label)]">Expiry</label>
              <button
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex h-8.5 w-full items-center justify-between rounded-lg border border-[var(--fx-border)] bg-[#F8FAFC] px-3 text-[14px] leading-none text-[var(--fx-label)]"
              >
                <span>{displayDate}</span>
                <ChevronDown className="h-4 w-4 text-[var(--fx-secondary)]" />
              </button>
              {showCalendar && (
                <CalendarPicker
                  selectedDate={expiryDate}
                  onDateSelect={(date) => {
                    setExpiryDate(date);
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-[var(--fx-label)]">Strike</label>
              <div className="flex h-8.5 items-center gap-2 rounded-lg border border-[var(--fx-border)] bg-[#F8FAFC] px-3 text-[14px] leading-none text-[var(--fx-label)]">
                <input
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-left outline-none"
                />
                <span className="whitespace-nowrap text-[10px] font-semibold text-[var(--fx-label)]">
                  {quoteCurrency} per {baseCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1.5 space-y-1.5">
          <div className="text-[13px] font-semibold text-[var(--fx-label)]">
            <span>Notional (USDC)</span>
          </div>

          <div className="rounded-lg border border-[var(--fx-border)] bg-[#F8FAFC] px-3 py-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[16px] leading-none text-[var(--fx-secondary)]">$</span>
              <input
                value={usdAmount}
                onChange={(e) => {
                  setUsdAmount(e.target.value);
                }}
                className="w-full bg-transparent text-left text-[20px] font-medium leading-none text-[var(--fx-heading)] outline-none"
                placeholder="10,000"
              />
              <button className="rounded-lg px-2 py-0.5 text-[11px] text-[var(--fx-secondary)] transition hover:bg-[#F1F5F9]">
                Max
              </button>
            </div>
          </div>
          <div className="text-[12px] text-[var(--fx-secondary)]">
            Protecting: {(parsedNotional * parsedStrike).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {quoteCurrency} exposure
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--fx-border)] bg-[#F8FAFC] px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="border-l-[3px] border-[var(--fx-accent-green)] pl-2">
              <p className="text-[10px] text-[var(--fx-secondary)]">Indicative premium</p>
              <p className="text-[17px] font-semibold text-[var(--fx-heading)]">${indicativePrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md bg-[#F1F5F9] p-1 text-[var(--fx-label)]">
                <RefreshCw className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-[var(--fx-secondary)]">updates in {secondsToRefresh}s</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--fx-label)] underline-offset-2 hover:underline"
            >
              Advanced options
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 text-[var(--fx-secondary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--fx-secondary)]" />
              )}
            </button>
            {showAdvanced && (
              <div className="mt-1 text-[10px] text-[var(--fx-secondary)]">
                Implied Volatility (IV): {ivValue.toFixed(2)}%
              </div>
            )}
          </div>

          <button
            disabled={isLoading}
            onClick={() => {
              const params = new URLSearchParams({
                pair: selectedPair,
                type: optionType,
                notional: String(parsedNotional),
                strike: String(parsedStrike),
                expiry: expiryDate,
                indicative: String(indicativePrice),
              });
              router.push(`/app/review?${params.toString()}`);
            }}
            className="w-full rounded-lg border border-[#0F172A] bg-[#0B1220] py-2.5 text-[14px] font-bold leading-none text-white shadow-[0_8px_16px_rgba(15,23,42,0.28)] transition hover:bg-[#070D18] active:bg-[#070D18] disabled:opacity-70"
          >
            {isLoading ? "Loading..." : "Next Step"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
