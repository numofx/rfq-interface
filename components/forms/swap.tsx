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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-4">
      <div className="relative w-full max-w-[470px]">
        <div className="fixed left-24 top-12 z-20 flex items-center gap-2">
          <Image src="/numo.png" alt="Numo" width={112} height={39} className="h-8 w-auto" />
          <div className="h-5 w-px bg-gray-300" />
          <h1 className="text-[18px] font-semibold text-slate-800">FX Options</h1>
        </div>

        <div className="rounded-[18px] bg-gray-100 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.1)]">
        <div className="space-y-2.5">
          <div className="relative" ref={pairRef}>
            <button
              onClick={() => setShowPairMenu((prev) => !prev)}
              className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#D0D0D5] bg-[#F2F2F3] px-4 text-left shadow-[0_2px_6px_rgba(15,23,42,0.08)] transition"
              aria-haspopup="menu"
              aria-expanded={showPairMenu}
              aria-label="Select pair"
            >
              {renderPairLabel(selectedPair)}
              {showPairMenu ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {showPairMenu && (
              <div className="absolute left-0 top-full z-50 mt-3 w-full rounded-[28px] border border-[#D7D7DB] bg-[#EFEFF0] p-4 shadow-[0_16px_28px_rgba(15,23,42,0.12)]">
                <p className="mb-2 px-2 text-[10px] font-semibold tracking-wide text-slate-500">
                  SELECT PAIR
                </p>
                <div className="space-y-2">
                  {pairOptions.map((pair) => {
                    const isSelected = selectedPair === pair;
                    return (
                      <button
                        key={pair}
                        onClick={() => {
                          setSelectedPair(pair);
                          setShowPairMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-3xl px-4 py-4 text-left transition ${
                          isSelected ? "bg-[#DEDDDA]" : "bg-[#F5F5F5]"
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
            className="flex h-9 items-center gap-1 rounded-full border border-black/10 bg-white/60 p-1 shadow-[0_1px_0_rgba(255,255,255,0.9),0_6px_14px_rgba(15,23,42,0.08)] backdrop-blur-sm"
            role="tablist"
            aria-label="Option type"
          >
            <button
              type="button"
              onClick={() => setOptionType("call")}
              role="tab"
              aria-selected={optionType === "call"}
              className={`flex h-full flex-1 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                optionType === "call"
                  ? "bg-neutral-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Call
            </button>
            <button
              type="button"
              onClick={() => setOptionType("put")}
              role="tab"
              aria-selected={optionType === "put"}
              className={`flex h-full flex-1 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                optionType === "put"
                  ? "bg-neutral-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Put
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div ref={calendarRef} className="relative">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Expiry</label>
              <button
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 bg-white/50 px-3 text-[13px] leading-none text-slate-600"
              >
                <span>{displayDate}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
              <label className="mb-1 block text-xs font-semibold text-slate-700">Strike</label>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white/50 px-3 text-[13px] leading-none text-slate-600">
                <input
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-left outline-none"
                />
                <span className="whitespace-nowrap text-[9px] font-semibold text-slate-600">
                  {quoteCurrency} per {baseCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <div className="text-[13px] text-slate-500">
            <span>Notional (USDC)</span>
          </div>

          <div className="rounded-lg border border-gray-300 bg-white/60 px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-[16px] leading-none text-slate-500">$</span>
              <input
                value={usdAmount}
                onChange={(e) => {
                  setUsdAmount(e.target.value);
                }}
                className="w-full bg-transparent text-left text-[26px] leading-none text-slate-800 outline-none"
                placeholder="10,000"
              />
              <button className="rounded-lg px-2 py-0.5 text-[10px] text-slate-500 transition hover:bg-gray-100">
                Max
              </button>
            </div>
          </div>
          <div className="text-[11px] text-slate-600">
            Protecting: {(parsedNotional * parsedStrike).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {quoteCurrency} exposure
          </div>

          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <p className="text-[11px] text-slate-600">
              Indicative premium:{" "}
              <span className="font-semibold text-emerald-700">${indicativePrice.toFixed(2)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-md bg-emerald-100 p-1 text-emerald-700">
                <RefreshCw className="h-2.5 w-2.5" />
              </button>
              <span className="text-[9px] text-slate-500">updates in {secondsToRefresh}s</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              Advanced options
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>
            {showAdvanced && (
              <div className="mt-1 text-[10px] text-slate-500">
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
            className="w-full rounded-lg bg-slate-200 py-2.5 text-[13px] font-semibold leading-none text-slate-600 shadow-[0_6px_14px_rgba(15,23,42,0.12)] transition hover:bg-slate-300 disabled:opacity-70"
          >
            {isLoading ? "Loading..." : "Next Step"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
