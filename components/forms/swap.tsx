"use client";

import { Check, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForwardRates } from "@/lib/hooks/useFxRates";

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

export function ForwardInterface() {
  const [optionType, setOptionType] = useState<OptionType>("call");
  const [selectedPair, setSelectedPair] = useState<"USD/NGN" | "USD/KES">("USD/KES");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [usdAmount, setUsdAmount] = useState("0");
  const [strikePrice, setStrikePrice] = useState("2,200.00");
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(9);
  const [hasQuoted, setHasQuoted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  const { data: forwardRateData, isLoading } = useForwardRates("3M");

  const pairOptions = ["USD/NGN", "USD/KES"] as const;
  const pairIcon: Record<"USD/NGN" | "USD/KES", string> = {
    "USD/NGN": "/tokens/ng.svg",
    "USD/KES": "/tokens/ke.svg",
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
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false);
      }
    };
    if (showCalendar || showCurrencyMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar, showCurrencyMenu]);

  const parsedNotional = Number(usdAmount.replace(/,/g, "")) || 0;
  const parsedStrike = Number(strikePrice.replace(/[^0-9.]/g, "")) || 1;
  const indicativePrice = forwardRateData?.forwardPoints || 13.33;
  const ivValue = 69.03;
  const contractCount = parsedNotional > 0 ? parsedNotional / Math.max(parsedStrike, 0.0001) : 0;
  const estimatedPremium = contractCount * indicativePrice;
  const premiumPct = parsedNotional > 0 ? (estimatedPremium / parsedNotional) * 100 : 0;
  const pairScenario = selectedPair === "USD/NGN"
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
  const quoteCurrency = selectedPair.split("/")[1];

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-[640px] rounded-[30px] bg-gray-100 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)] md:p-8">
        <div className="relative" ref={currencyRef}>
          <button
            onClick={() => setShowCurrencyMenu((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/40 px-4 py-3 text-left transition hover:bg-white/60"
            aria-haspopup="menu"
            aria-expanded={showCurrencyMenu}
            aria-label="Open currency menu"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white">
                <Image
                  src={pairIcon[selectedPair]}
                  alt={selectedPair}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full"
                />
              </div>
              <p className="text-3xl font-semibold leading-none text-slate-800">
                {selectedPair}
              </p>
            </div>
            {showCurrencyMenu ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showCurrencyMenu && (
            <div className="absolute left-0 top-full z-50 mt-3 w-full rounded-[28px] border border-gray-200 bg-gray-100 p-4 shadow-xl">
              <p className="mb-3 px-2 text-sm font-semibold tracking-wide text-slate-500">
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
                        setShowCurrencyMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                        isSelected ? "bg-stone-200" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white">
                          <Image
                            src={pairIcon[pair]}
                            alt={pair}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full"
                          />
                        </div>
                        <span className="text-2xl font-semibold text-slate-800">{pair}</span>
                      </div>
                      {isSelected ? <Check className="h-6 w-6 text-black" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-2xl border border-gray-200 bg-gray-100 p-1">
          <button
            onClick={() => setOptionType("call")}
            className={`rounded-xl py-3 text-2xl leading-none transition ${
              optionType === "call"
                ? "border border-slate-900 bg-white text-slate-900"
                : "text-gray-500"
            }`}
          >
            Call
          </button>
          <button
            onClick={() => setOptionType("put")}
            className={`rounded-xl py-3 text-2xl leading-none transition ${
              optionType === "put"
                ? "border border-slate-900 bg-white text-slate-900"
                : "text-gray-500"
            }`}
          >
            Put
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 text-[22px] leading-none text-slate-600">
          <button
            onClick={() => setShowCalendar((prev) => !prev)}
            className="flex items-center justify-center gap-2"
          >
            {displayDate}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          <div className="h-7 w-px bg-gray-300" />
          <div className="flex items-center justify-center gap-2">
            <input
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              className="w-[170px] bg-transparent text-center outline-none"
            />
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-500">
          Strike: {strikePrice} {quoteCurrency} per USD
        </div>

        <div ref={calendarRef} className="relative">
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

        <div className="mt-5 flex items-center justify-between text-[22px] text-slate-500">
          <span>Notional (USD)</span>
          <span>Exposure Size</span>
        </div>

        <div className="mt-2 rounded-2xl border border-gray-300 bg-white/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              value={usdAmount}
              onChange={(e) => {
                setUsdAmount(e.target.value);
                setHasQuoted(false);
              }}
              className="w-full bg-transparent text-[52px] leading-none text-slate-800 outline-none"
              placeholder="0"
            />
            <button className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-[20px] text-slate-600">
              Max
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-[22px] leading-none text-slate-500">Indicative Price Per Option</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[52px] font-semibold leading-none text-emerald-600">
              ${indicativePrice.toFixed(2)}
            </p>
            <button className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-[20px] leading-none text-slate-500">
            Auto refresh in {secondsToRefresh} seconds
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-gray-200 bg-white/50 px-4 py-3">
          <button
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-600"
          >
            <span>Advanced</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>
          {showAdvanced && (
            <div className="mt-2 text-sm text-slate-500">
              Implied Volatility (IV): {ivValue.toFixed(2)}%
            </div>
          )}
        </div>

        <button
          disabled={isLoading}
          onClick={() => setHasQuoted(true)}
          className="mt-5 w-full rounded-2xl bg-slate-900 py-4 text-[28px] leading-none text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isLoading ? "Loading..." : "Request Quote"}
        </button>

        {hasQuoted && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white/50 px-4 py-3">
            <div className="text-sm text-slate-500">Quote Summary</div>
            <div className="mt-2 space-y-2 text-base text-slate-700">
              <div className="flex items-center justify-between">
                <span>Notional</span>
                <span className="font-semibold text-slate-800">
                  ${parsedNotional.toLocaleString("en-US")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Premium</span>
                <span className="font-semibold text-slate-800">
                  ${estimatedPremium.toFixed(2)} ({premiumPct.toFixed(3)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max payout</span>
                <span className="font-semibold text-slate-800">
                  {optionType === "call"
                    ? `Unlimited above ${Number(strikePrice.replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`
                    : `Unlimited below ${Number(strikePrice.replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white/60 p-3">
              <div className="text-sm font-medium text-slate-500">Scenario Preview</div>
              <div className="mt-2 text-sm text-slate-700">
                If {selectedPair} hits {pairScenario.up.toLocaleString("en-US")} {"->"} payout ~= $
                {payoutAtUp.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                If {selectedPair} stays at {pairScenario.flat.toLocaleString("en-US")} {"->"} payout = $
                {payoutAtFlat.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
