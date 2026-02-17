"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { createPublicClient, http } from "viem";
import { base, celo } from "viem/chains";
import {
  DropdownSelect,
  FieldLabel,
  HelperText,
  PrimaryButton,
  SegmentedControl,
  SurfaceCard,
  TextInput,
} from "@/components/ui/rfq-primitives";

type RFQState =
  | "IDLE"
  | "REQUESTING"
  | "QUOTES_LIVE"
  | "QUOTE_SELECTED"
  | "SIGNING"
  | "PENDING"
  | "DONE"
  | "ERROR";

type Pair = "USDC/cNGN" | "USDT/KESm";
type OptionType = "call" | "put";

interface Quote {
  id: string;
  maker: string;
  premium: number;
  fees: number;
  spreadBps: number;
}

const QUOTE_WINDOW_SECONDS = 30;
const REQUEST_DELAY_MS = 1400;
const ATM_THRESHOLD = 0.0025;
const CHAINLINK_NGN_USD_FEED_BASE = "0xdfbb5Cbc88E382de007bfe6CE99C388176ED80aD";
const CHAINLINK_KES_USD_FEED_CELO = "0x0826492a24b1dBd1d8fcB4701b38C557CE685e9D";
const DEFAULT_SPOT_BY_PAIR: Partial<Record<Pair, number>> = {
  "USDT/KESm": 130,
};
const chainlinkAggregatorV3Abi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
] as const;
const basePublicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});
const celoPublicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const pairs = [
  { id: "usdc-cngn", label: "USDC/cNGN" },
  { id: "usdt-kesm", label: "USDT/KESm" },
] as const;

const optionOptions: ReadonlyArray<{ value: OptionType; label: string }> = [
  { value: "call", label: "Call" },
  { value: "put", label: "Put" },
] as const;

const makers = ["Maker A", "Maker B", "Maker C", "Maker D"] as const;

function PairIcons({ left, right }: { left: string; right: string }) {
  return (
    <span className="flex items-center -space-x-1.5">
      <Image
        src={left}
        alt=""
        width={16}
        height={16}
        aria-hidden="true"
        className="h-4 w-4 rounded-full border border-[var(--inst-surface)] bg-white object-cover"
      />
      <Image
        src={right}
        alt=""
        width={16}
        height={16}
        aria-hidden="true"
        className="h-4 w-4 rounded-full border border-[var(--inst-surface)] bg-white object-cover"
      />
    </span>
  );
}

function PairFlag({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={14}
      height={14}
      className="h-3.5 w-3.5 rounded-full border border-[var(--inst-surface)] object-cover"
    />
  );
}

function PairFlags({ flags }: { flags: Array<{ src: string; alt: string }> }) {
  return (
    <span className="flex items-center -space-x-1.5">
      {flags.map((flag) => (
        <PairFlag key={flag.src} src={flag.src} alt={flag.alt} />
      ))}
    </span>
  );
}

function toMoney(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInput(iso: string) {
  return parseIsoDate(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function bestPriceFirst(quotes: Quote[]) {
  return quotes.slice().sort((a, b) => a.premium - b.premium);
}

function makeMockQuotes(notional: number): Quote[] {
  void notional;
  return [];
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--inst-muted)] border-t-transparent" />;
}

function StatusRail({ state }: { state: RFQState }) {
  const activeIndex = state === "SIGNING" ? 0 : state === "PENDING" ? 1 : state === "DONE" ? 2 : -1;
  const items = ["SIGN", "PENDING", "DONE"];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => {
        const isActive = index <= activeIndex;
        return (
          <div
            key={item}
            className={`rounded-[12px] border px-3 py-2 text-center text-[12px] font-semibold ${
              isActive
                ? "border-[var(--inst-primary-start)] bg-[var(--inst-control-active)] text-[var(--inst-text)]"
                : "border-[var(--inst-border)] bg-[var(--inst-input)] text-[var(--inst-muted)]"
            }`}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

export function ForwardInterface() {
  const [state, setState] = useState<RFQState>("IDLE");
  const [pair, setPair] = useState<Pair>("USDC/cNGN");
  const [optionType, setOptionType] = useState<OptionType>("call");
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notional, setNotional] = useState("10000");
  const [strike, setStrike] = useState("2200.00");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isQuotePopupOpen, setIsQuotePopupOpen] = useState(false);
  const [windowRemaining, setWindowRemaining] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => parseIsoDate(expiryDate));
  const [usdcCngnSpot, setUsdcCngnSpot] = useState<number | null>(null);
  const [usdtKesmSpot, setUsdtKesmSpot] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const pairOptions = useMemo(
    () =>
      pairs.map((nextPair) => {
        if (nextPair.label === "USDC/cNGN") {
          return {
            value: nextPair.label as Pair,
            label: nextPair.label,
            leading: <PairIcons left="/tokens/usdc.svg" right="/tokens/cngn.svg" />,
            trailing: (
              <PairFlags
                flags={[
                  { src: "/tokens/us.svg", alt: "United States flag" },
                  { src: "/tokens/ng.svg", alt: "Nigeria flag" },
                ]}
              />
            ),
          };
        }
        return {
          value: nextPair.label as Pair,
          label: nextPair.label,
          leading: <PairIcons left="/tokens/usdt.svg" right="/tokens/kesm.svg" />,
          trailing: (
            <PairFlags
              flags={[
                { src: "/tokens/us.svg", alt: "United States flag" },
                { src: "/tokens/ke.svg", alt: "Kenya flag" },
              ]}
            />
          ),
        };
      }),
    []
  );

  const parsedNotional = Number(notional.replace(/,/g, "")) || 0;
  const parsedStrike = Number(strike.replace(/,/g, "")) || 0;
  const [baseCurrency, quoteCurrency] = pair.split("/") as [string, string];
  const spot =
    pair === "USDC/cNGN"
      ? usdcCngnSpot
      : pair === "USDT/KESm"
        ? usdtKesmSpot ?? DEFAULT_SPOT_BY_PAIR[pair]
        : DEFAULT_SPOT_BY_PAIR[pair];
  const hasValidSpot = typeof spot === "number" && Number.isFinite(spot) && spot > 0;
  const displayExpiry = parseIsoDate(expiryDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const minDateIso = toIsoDate(new Date());
  const expiryCountdownDays = useMemo(() => {
    if (!expiryDate) return null;
    const diffMs = parseIsoDate(expiryDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [expiryDate]);
  const moneyness = useMemo(() => {
    if (!hasValidSpot || !parsedStrike) return "—";
    const ratio = parsedStrike / spot - 1;
    const absRatio = Math.abs(ratio);
    if (absRatio < ATM_THRESHOLD) return "ATM";
    const pct = `${(absRatio * 100).toFixed(2)}%`;
    if (optionType === "call") {
      return `${pct} ${parsedStrike > spot ? "OTM" : "ITM"}`;
    }
    return `${pct} ${parsedStrike < spot ? "OTM" : "ITM"}`;
  }, [hasValidSpot, optionType, parsedStrike, spot]);

  const sortedQuotes = useMemo(() => bestPriceFirst(quotes), [quotes]);
  const selectedQuote = useMemo(
    () => sortedQuotes.find((quote) => quote.id === selectedQuoteId) ?? null,
    [selectedQuoteId, sortedQuotes]
  );

  const expired = (state === "QUOTES_LIVE" || state === "QUOTE_SELECTED") && windowRemaining <= 0;

  const indicativePremium = useMemo(() => {
    if (!parsedNotional || !parsedStrike) return 0;
    const contracts = parsedNotional / parsedStrike;
    return Number((contracts * 1.82).toFixed(2));
  }, [parsedNotional, parsedStrike]);
  const hasRequestedQuotes = state !== "IDLE";
  const showIndicativePremium = hasRequestedQuotes && parsedNotional > 0 && parsedStrike > 0;

  useEffect(() => {
    let cancelled = false;

    const fetchUsdcCngnSpot = async () => {
      try {
        const [decimals, latestRoundData] = await Promise.all([
          basePublicClient.readContract({
            address: CHAINLINK_NGN_USD_FEED_BASE,
            abi: chainlinkAggregatorV3Abi,
            functionName: "decimals",
          }),
          basePublicClient.readContract({
            address: CHAINLINK_NGN_USD_FEED_BASE,
            abi: chainlinkAggregatorV3Abi,
            functionName: "latestRoundData",
          }),
        ]);

        const answer = latestRoundData[1];
        if (answer <= 0n) {
          if (!cancelled) setUsdcCngnSpot(null);
          return;
        }

        const ngnPerUsd = 1 / (Number(answer) / 10 ** Number(decimals));
        if (!Number.isFinite(ngnPerUsd) || ngnPerUsd <= 0) {
          if (!cancelled) setUsdcCngnSpot(null);
          return;
        }

        if (!cancelled) setUsdcCngnSpot(ngnPerUsd);
      } catch {
        if (!cancelled) setUsdcCngnSpot(null);
      }
    };

    void fetchUsdcCngnSpot();
    const intervalId = window.setInterval(fetchUsdcCngnSpot, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchUsdtKesmSpot = async () => {
      try {
        const [decimals, latestRoundData] = await Promise.all([
          celoPublicClient.readContract({
            address: CHAINLINK_KES_USD_FEED_CELO,
            abi: chainlinkAggregatorV3Abi,
            functionName: "decimals",
          }),
          celoPublicClient.readContract({
            address: CHAINLINK_KES_USD_FEED_CELO,
            abi: chainlinkAggregatorV3Abi,
            functionName: "latestRoundData",
          }),
        ]);

        const answer = latestRoundData[1];
        if (answer <= 0n) {
          if (!cancelled) setUsdtKesmSpot(null);
          return;
        }

        const usdPerKes = Number(answer) / 10 ** Number(decimals);
        const kesPerUsd = usdPerKes > 0 ? 1 / usdPerKes : 0;
        if (!Number.isFinite(kesPerUsd) || kesPerUsd <= 0) {
          if (!cancelled) setUsdtKesmSpot(null);
          return;
        }

        if (!cancelled) setUsdtKesmSpot(kesPerUsd);
      } catch {
        if (!cancelled) setUsdtKesmSpot(null);
      }
    };

    void fetchUsdtKesmSpot();
    const intervalId = window.setInterval(fetchUsdtKesmSpot, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (state !== "REQUESTING" && state !== "QUOTES_LIVE" && state !== "QUOTE_SELECTED") {
      return;
    }

    if (windowRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setWindowRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state, windowRemaining]);

  useEffect(() => {
    if (state !== "REQUESTING") {
      return;
    }

    const timeout = window.setTimeout(() => {
      const nextQuotes = makeMockQuotes(parsedNotional);
      setQuotes(nextQuotes);
      setState("QUOTES_LIVE");
    }, REQUEST_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [state, parsedNotional]);

  useEffect(() => {
    if (!expired) {
      return;
    }

    if (state === "QUOTE_SELECTED") {
      setErrorMessage("Selected quote has expired. Request quotes again.");
    }
  }, [expired, state]);

  useEffect(() => {
    if (!isCalendarOpen) {
      return;
    }

    const onOutsideClick = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [isCalendarOpen]);

  const requestQuotes = () => {
    setErrorMessage(null);
    setSelectedQuoteId(null);
    setQuotes([]);
    setWindowRemaining(QUOTE_WINDOW_SECONDS);
    setIsQuotePopupOpen(true);
    setState("REQUESTING");
  };

  const clearForm = () => {
    setState("IDLE");
    setPair("USDC/cNGN");
    setOptionType("call");
    const resetExpiry = toIsoDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setExpiryDate(resetExpiry);
    setCalendarMonth(parseIsoDate(resetExpiry));
    setIsCalendarOpen(false);
    setNotional("");
    setStrike("");
    setQuotes([]);
    setSelectedQuoteId(null);
    setWindowRemaining(0);
    setErrorMessage(null);
  };

  const selectQuote = (quoteId: string) => {
    if (expired) {
      return;
    }

    setSelectedQuoteId(quoteId);
    setState("QUOTE_SELECTED");
    setIsQuotePopupOpen(false);
    setErrorMessage(null);
  };

  const executeTrade = () => {
    if (!selectedQuote) {
      setState("ERROR");
      setErrorMessage("No quote selected.");
      return;
    }

    if (expired) {
      setState("ERROR");
      setErrorMessage("Quote expired before execution. Request a fresh quote.");
      return;
    }

    setErrorMessage(null);
    setState("SIGNING");

    window.setTimeout(() => {
      setState("PENDING");
    }, 1200);

    window.setTimeout(() => {
      setState("DONE");
    }, 2800);
  };

  return (
    <>
      <SurfaceCard className="space-y-2 p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <section className="space-y-1">
            <div>
              <FieldLabel htmlFor="pair">Pair</FieldLabel>
              <DropdownSelect
                value={pair}
                options={pairOptions}
                onChange={setPair}
              />
              <HelperText className="mt-1 text-[11px]">
                Spot:{" "}
                <span className="text-[var(--inst-text)]">
                  {hasValidSpot ? spot.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
                </span>{" "}
                {quoteCurrency} per {baseCurrency}
              </HelperText>
            </div>

            <div>
              <FieldLabel>Option Type</FieldLabel>
              <SegmentedControl
                value={optionType}
                onChange={setOptionType}
                options={optionOptions}
                className="grid-cols-2"
                optionClassName="h-6.5"
              />
            </div>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="expiry">Expiry</FieldLabel>
                <div ref={calendarRef} className="relative">
                  <button
                    id="expiry"
                    type="button"
                    onClick={() => {
                      setCalendarMonth(parseIsoDate(expiryDate));
                      setIsCalendarOpen((prev) => !prev);
                    }}
                    className="flex h-[44px] w-full items-center justify-between rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 text-[14px] text-[var(--inst-text)]"
                  >
                    <span>{formatDateInput(expiryDate)}</span>
                    <Calendar className="h-4 w-4 text-[var(--inst-muted)]" />
                  </button>

                  {isCalendarOpen ? (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-[28px] border border-[var(--inst-border)] bg-[var(--inst-surface)] p-4">
                      <div className="mb-3 flex items-center justify-between px-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                            )
                          }
                          className="h-8 w-8 rounded-full text-[24px] leading-none text-[var(--inst-text)]"
                          aria-label="Previous month"
                        >
                          ‹
                        </button>
                        <div className="text-[16px] font-semibold text-[var(--inst-text)]">
                          {calendarMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                            )
                          }
                          className="h-8 w-8 rounded-full text-[24px] leading-none text-[var(--inst-text)]"
                          aria-label="Next month"
                        >
                          ›
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[var(--inst-muted)]">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
                        {Array.from({ length: 42 }, (_, idx) => {
                          const year = calendarMonth.getFullYear();
                          const month = calendarMonth.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const dayNumber = idx - firstDay + 1;
                          const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
                          const date = new Date(year, month, dayNumber);
                          const iso = toIsoDate(date);
                          const isDisabled = !inMonth || iso < minDateIso;
                          const isSelected = inMonth && iso === expiryDate;

                          return (
                            <button
                              key={`${year}-${month}-${idx}`}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                setExpiryDate(iso);
                                setIsCalendarOpen(false);
                              }}
                              className={`mx-auto h-8 w-8 rounded-[9px] text-[14px] ${
                                isSelected
                                  ? "bg-[#111827] font-semibold text-white"
                                  : isDisabled
                                    ? "text-[#b7b9c4]"
                                    : "text-[var(--inst-text)]"
                              }`}
                            >
                              {inMonth ? dayNumber : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
                <HelperText className="mt-1 text-[11px]">
                  {typeof expiryCountdownDays === "number" ? `${expiryCountdownDays} days` : "—"}
                </HelperText>
              </div>

              <div>
                <FieldLabel htmlFor="strike">Strike</FieldLabel>
                <TextInput
                  id="strike"
                  value={strike}
                  onChange={(event) => setStrike(event.target.value)}
                  placeholder="2,200.00"
                  rightAdornment={
                    <span className="whitespace-nowrap text-[9px] leading-none font-semibold text-[var(--inst-muted)]">
                      {quoteCurrency} per {baseCurrency}
                    </span>
                  }
                />
                <HelperText className="mt-1 text-[11px]">{moneyness}</HelperText>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="notional">Notional</FieldLabel>
              <TextInput
                id="notional"
                value={notional}
                onChange={(event) => setNotional(event.target.value)}
                placeholder="10,000"
                leftAdornment={<span className="text-[14px]">$</span>}
                rightAdornment={
                  <span className="text-[10px] font-semibold text-[var(--inst-muted)]">{baseCurrency}</span>
                }
              />
            </div>

            <div className="border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 py-2 text-[11px] text-[var(--inst-muted)]">
              <div className="flex items-center justify-between">
                <span>Indicative all-in premium</span>
                <span>Indicative</span>
              </div>
              <div className="mt-1 text-[16px] font-semibold text-[var(--inst-text)]">
                {showIndicativePremium ? toMoney(indicativePremium) : "—"}
              </div>
              <div className="mt-1">
                {state === "REQUESTING"
                  ? "Requesting quotes..."
                  : showIndicativePremium
                    ? `${((indicativePremium / parsedNotional) * 100).toFixed(3)}% of notional (${baseCurrency})`
                    : "Awaiting quote"}
              </div>
            </div>

            <PrimaryButton type="button" onClick={requestQuotes} className="h-[42px]">
              Request Quotes
            </PrimaryButton>
            <HelperText className="text-[11px]">Quotes valid for 30s after response.</HelperText>

            <button
              type="button"
              onClick={clearForm}
              className="text-left text-[12px] font-semibold text-[var(--inst-muted)]"
            >
              Clear
            </button>
        </section>

          {selectedQuote ? (
            <section className="space-y-1 rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] p-1.5">
              <div className="text-[11px] font-semibold tracking-[0.04em] text-[var(--inst-muted)]">CONFIRMATION</div>

              <div className="grid grid-cols-2 gap-y-1 text-[12px]">
                <span className="text-[var(--inst-muted)]">Type</span>
                <span className="text-right text-[var(--inst-text)]">{optionType.toUpperCase()}</span>
                <span className="text-[var(--inst-muted)]">Pair</span>
                <span className="text-right text-[var(--inst-text)]">{pair}</span>
                <span className="text-[var(--inst-muted)]">Notional ({baseCurrency})</span>
                <span className="text-right text-[var(--inst-text)]">{toMoney(parsedNotional)}</span>
                <span className="text-[var(--inst-muted)]">Expiry</span>
                <span className="text-right text-[var(--inst-text)]">{displayExpiry}</span>
                <span className="text-[var(--inst-muted)]">Strike</span>
                <span className="text-right text-[var(--inst-text)]">{strike || "-"}</span>
                <span className="text-[var(--inst-muted)]">Premium</span>
                <span className="text-right text-[var(--inst-text)]">{toMoney(selectedQuote.premium)}</span>
                <span className="text-[var(--inst-muted)]">Fees</span>
                <span className="text-right text-[var(--inst-text)]">{toMoney(selectedQuote.fees)}</span>
                <span className="font-semibold text-[var(--inst-text)]">Total cost</span>
                <span className="text-right font-semibold text-[var(--inst-text)]">
                  {toMoney(selectedQuote.premium + selectedQuote.fees)}
                </span>
              </div>

              {(state === "QUOTE_SELECTED" || state === "SIGNING" || state === "PENDING" || state === "DONE") && (
                <div className="space-y-3">
                  <PrimaryButton
                    type="button"
                    onClick={executeTrade}
                    className="h-[42px]"
                    disabled={state === "SIGNING" || state === "PENDING" || state === "DONE"}
                  >
                    {state === "SIGNING"
                      ? "Signing..."
                      : state === "PENDING"
                        ? "Pending..."
                        : state === "DONE"
                          ? "Trade executed"
                          : "Execute trade"}
                  </PrimaryButton>
                  <StatusRail state={state} />
                </div>
              )}
            </section>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[9px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 py-2 text-[11px] text-[var(--inst-text)]">
              {errorMessage}
            </div>
          ) : null}
      </SurfaceCard>

      {isQuotePopupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[360px] rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-surface)] p-4 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold text-[var(--inst-label)]">Quotes</div>
              <button
                type="button"
                onClick={() => setIsQuotePopupOpen(false)}
                className="text-[12px] font-semibold text-[var(--inst-muted)]"
              >
                Close
              </button>
            </div>

            <div className="mt-2 text-[11px] text-[var(--inst-muted)]">
              {windowRemaining > 0 ? `Expires in ${windowRemaining}s` : "Quotes expired"}
            </div>

            {sortedQuotes.length === 0 ? (
              <div className="mt-3 rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 py-2.5 text-[12px] text-[var(--inst-muted)]">
                No quotes yet.
              </div>
            ) : null}

            <div className="mt-3 space-y-2">
              {sortedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-3 py-2.5 text-center"
                >
                  <div className="text-[13px] font-semibold text-[var(--inst-text)]">{quote.maker}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--inst-muted)]">Spread {quote.spreadBps} bps</div>
                  <div className="mt-1 text-[18px] font-semibold text-[var(--inst-text)]">
                    {toMoney(quote.premium)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--inst-muted)]">Fees {toMoney(quote.fees)}</div>
                  <div className="mt-1 text-[11px] text-[var(--inst-muted)]">TTL: {windowRemaining}s</div>
                  <button
                    type="button"
                    onClick={() => selectQuote(quote.id)}
                    disabled={expired || state === "SIGNING" || state === "PENDING" || state === "DONE"}
                    className="mt-2 h-8 w-full rounded-[9px] border border-[var(--inst-border)] px-3 text-[12px] font-semibold text-[var(--inst-text)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
