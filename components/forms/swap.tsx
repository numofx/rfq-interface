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
  const [selectedPair, setSelectedPair] = useState<"USDC/NGN" | "USDC/KES">("USDC/NGN");
  const [showPairMenu, setShowPairMenu] = useState(false);
  const [usdAmount, setUsdAmount] = useState("");
  const [strikePrice, setStrikePrice] = useState("2,200.00");
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(9);
  const [hasQuoted, setHasQuoted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const pairRef = useRef<HTMLDivElement>(null);

  const { data: forwardRateData, isLoading } = useForwardRates("3M");

  const pairOptions = ["USDC/NGN", "USDC/KES"] as const;
  const pairIcon: Record<"USDC/NGN" | "USDC/KES", string> = {
    "USDC/NGN": "/tokens/ng.svg",
    "USDC/KES": "/tokens/ke.svg",
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
  const pairScenario = selectedPair === "USDC/NGN"
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-6">
      <div className="relative w-full max-w-[700px]">
        <div className="fixed left-36 top-16 z-20 flex items-center gap-6">
          <Image src="/numo-logo.png" alt="Numo" width={228} height={66} className="h-16 w-auto" />
          <div className="h-12 w-px bg-gray-300" />
          <h1 className="text-4xl font-semibold text-slate-800">FX Option</h1>
        </div>

        <div className="rounded-[30px] bg-gray-100 p-12 shadow-[0_12px_30px_rgba(15,23,42,0.12)] md:p-14">
        <div className="space-y-4">
          <div className="relative" ref={pairRef}>
            <button
              onClick={() => setShowPairMenu((prev) => !prev)}
              className="flex h-14 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/40 px-4 text-left transition hover:bg-white/60"
              aria-haspopup="menu"
              aria-expanded={showPairMenu}
              aria-label="Select pair"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white">
                  <Image
                    src={pairIcon[selectedPair]}
                    alt={selectedPair}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                </div>
                <p className="text-3xl font-semibold leading-none text-slate-800">
                  {selectedPair}
                </p>
              </div>
              {showPairMenu ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {showPairMenu && (
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
                          setShowPairMenu(false);
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
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full"
                            />
                          </div>
                          <span className="text-2xl font-semibold text-slate-800">{pair}</span>
                        </div>
                        {isSelected ? <Check className="h-5 w-5 text-black" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid h-14 grid-cols-2 rounded-2xl border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setOptionType("call")}
              className={`rounded-xl text-2xl leading-none transition ${
                optionType === "call"
                  ? "border border-slate-900 bg-white text-slate-900"
                  : "text-gray-500"
              }`}
            >
              Call
            </button>
            <button
              onClick={() => setOptionType("put")}
              className={`rounded-xl text-2xl leading-none transition ${
                optionType === "put"
                  ? "border border-slate-900 bg-white text-slate-900"
                  : "text-gray-500"
              }`}
            >
              Put
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div ref={calendarRef} className="relative">
              <label className="mb-1 block text-base font-semibold text-slate-700">Expiry</label>
              <button
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex h-14 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/50 px-4 text-[22px] leading-none text-slate-600"
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
              <label className="mb-1 block text-base font-semibold text-slate-700">Strike</label>
              <div className="flex h-14 items-center gap-2 rounded-2xl border border-gray-200 bg-white/50 px-3 text-[22px] leading-none text-slate-600">
                <input
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-left outline-none"
                />
                <span className="whitespace-nowrap text-sm font-semibold text-slate-600">
                  {quoteCurrency} per USDC
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="text-[22px] text-slate-500">
            <span>Notional (USDC)</span>
          </div>

          <div className="rounded-2xl border border-gray-300 bg-white/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[32px] leading-none text-slate-500">$</span>
              <input
                value={usdAmount}
                onChange={(e) => {
                  setUsdAmount(e.target.value);
                  setHasQuoted(false);
                }}
                className="w-full bg-transparent text-left text-[52px] leading-none text-slate-800 outline-none"
                placeholder="10,000"
              />
              <button className="rounded-lg px-3 py-1 text-sm text-slate-500 transition hover:bg-gray-100">
                Max
              </button>
            </div>
          </div>
          <div className="text-base text-slate-600">
            Protecting: {(parsedNotional * parsedStrike).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {quoteCurrency} exposure
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-base text-slate-600">
              Indicative premium:{" "}
              <span className="font-semibold text-emerald-700">${indicativePrice.toFixed(2)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <RefreshCw className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-500">updates in {secondsToRefresh}s</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              Advanced options
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
            className="w-full rounded-2xl bg-slate-900 py-4 text-[30px] font-semibold leading-none text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:opacity-70"
          >
            {isLoading ? "Loading..." : "Request Quote"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Dealers respond after you submit a quote request.
          </p>
        </div>

        {hasQuoted && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white/50 px-4 py-3">
            <div className="text-sm text-slate-500">Quote Summary</div>
            <div className="mt-2 space-y-2 text-base text-slate-700">
              <div>
                <div>Notional</div>
                <div className="font-semibold text-slate-800">
                  ${parsedNotional.toLocaleString("en-US")}
                </div>
              </div>
              <div>
                <div>Premium</div>
                <div className="font-semibold text-slate-800">
                  ${estimatedPremium.toFixed(2)} ({premiumPct.toFixed(3)}%)
                </div>
              </div>
              <div>
                <div>Max payout</div>
                <div className="font-semibold text-slate-800">
                  {optionType === "call"
                    ? `Unlimited above ${Number(strikePrice.replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`
                    : `Unlimited below ${Number(strikePrice.replace(/[^0-9.]/g, "") || 0).toLocaleString("en-US")}`}
                </div>
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
    </div>
  );
}
