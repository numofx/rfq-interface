"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [usdAmount, setUsdAmount] = useState("0");
  const [strikePrice, setStrikePrice] = useState("2,200.00");
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(9);
  const calendarRef = useRef<HTMLDivElement>(null);

  const { data: forwardRateData, isLoading } = useForwardRates("3M");

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
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const parsedAmount = Number(usdAmount.replace(/,/g, "")) || 0;
  const indicativePrice = forwardRateData?.forwardPoints || 13.33;
  const ivValue = 69.03;
  const contractCount = parsedAmount > 0 ? parsedAmount / Math.max(indicativePrice, 0.0001) : 0;

  const displayDate = new Date(expiryDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-[640px] rounded-[30px] bg-gray-100 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.12)] md:p-8">
        <div className="rounded-2xl border border-gray-200 bg-white/40 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg text-gray-700">
                ◆
              </div>
              <div>
                <p className="text-4xl font-semibold leading-none text-slate-800">ETH</p>
                <p className="mt-1 text-3xl leading-none text-slate-500">
                  $1,957.20 <span className="ml-2 text-pink-500">-$0.86%</span>
                </p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>
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
            <span>$</span>
            <input
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              className="w-[170px] bg-transparent text-center outline-none"
            />
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
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
          <span>Amount (USDC)</span>
          <span>USDC Balance: 0.00</span>
        </div>

        <div className="mt-2 rounded-2xl border border-gray-300 bg-white/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
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
              ${indicativePrice.toFixed(2)}{" "}
              <span className="text-[42px] text-emerald-700">IV {ivValue.toFixed(2)}%</span>
            </p>
            <button className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-[20px] leading-none text-slate-500">
            Auto refresh in {secondsToRefresh} seconds
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between text-[22px] leading-none">
          <span className="text-slate-600">Number of Contracts</span>
          <span className="font-semibold text-slate-800">
            {contractCount > 0 ? contractCount.toFixed(4) : "---"}
          </span>
        </div>

        <button
          disabled={isLoading}
          className="mt-5 w-full rounded-2xl bg-slate-900 py-4 text-[28px] leading-none text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isLoading ? "Loading..." : "Request Quote"}
        </button>
      </div>
    </div>
  );
}
