"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SegmentedControl, SurfaceCard } from "@/components/ui/rfq-primitives";

type OptionType = "call" | "put";
type PanelTab = "chart" | "payoff";

interface SpotHistoryPoint {
  date: string;
  spot: number;
}

interface OptionSidePanelProps {
  pair?: string;
  optionType: OptionType;
  spot: number | null;
  strike: number;
  daysToExpiry: number | null;
  premiumUSDC?: number;
  spotHistory?: SpotHistoryPoint[];
}

function formatWhole(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function formatTwo(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatSigned(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatTwo(value)}`;
}

function buildDefaultHistory(spot: number, days = 90): SpotHistoryPoint[] {
  const now = new Date();
  const data: SpotHistoryPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const wave = Math.sin((days - i) / 9) * spot * 0.025;
    const trend = ((days - i) / days - 0.5) * spot * 0.03;
    const point = i === 0 ? spot : Math.max(0, spot + wave + trend);
    data.push({
      date: date.toISOString().split("T")[0],
      spot: point,
    });
  }

  return data;
}

function buildPayoffCurve({
  optionType,
  strike,
  premiumUSDC,
  spot,
}: {
  optionType: OptionType;
  strike: number;
  premiumUSDC: number;
  spot: number;
}) {
  const floor = Math.max(1, Math.min(strike, spot) * 0.55);
  const ceil = Math.max(strike, spot) * 1.45;
  const steps = 65;

  return Array.from({ length: steps }, (_, idx) => {
    const price = floor + ((ceil - floor) * idx) / (steps - 1);
    const intrinsic = optionType === "call" ? Math.max(price - strike, 0) : Math.max(strike - price, 0);
    const profit = intrinsic - premiumUSDC;
    return { spot: price, profit };
  });
}

export function OptionSidePanel({
  pair = "USD/NGN",
  optionType,
  spot,
  strike,
  daysToExpiry,
  premiumUSDC,
  spotHistory,
}: OptionSidePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("chart");
  const hasSpot = typeof spot === "number" && Number.isFinite(spot) && spot > 0;
  const safeSpot = hasSpot ? spot : Math.max(strike, 1);
  const safeStrike = Number.isFinite(strike) && strike > 0 ? strike : safeSpot;
  const hasPremium = typeof premiumUSDC === "number" && Number.isFinite(premiumUSDC);
  const breakeven = hasPremium ? safeStrike + premiumUSDC : null;

  const historyData = useMemo(() => {
    if (spotHistory?.length) return spotHistory;
    return buildDefaultHistory(safeSpot);
  }, [safeSpot, spotHistory]);

  const moneyness = useMemo(() => {
    if (!hasSpot || !safeStrike) return "—";
    const ratio = safeStrike / safeSpot - 1;
    const absRatio = Math.abs(ratio) * 100;
    const bucket =
      optionType === "call"
        ? safeStrike > safeSpot
          ? "OTM"
          : "ITM"
        : safeStrike < safeSpot
          ? "OTM"
          : "ITM";
    return `${absRatio.toFixed(2)}% ${bucket}`;
  }, [hasSpot, optionType, safeSpot, safeStrike]);

  const positiveZoneLine = hasPremium ? (breakeven as number) : safeStrike;
  const yValues = historyData.map((point) => point.spot).concat([safeStrike, positiveZoneLine]);
  const yMinRaw = Math.min(...yValues);
  const yMaxRaw = Math.max(...yValues);
  const yPadding = Math.max(20, (yMaxRaw - yMinRaw) * 0.12);
  const yMin = Math.max(0, yMinRaw - yPadding);
  const yMax = yMaxRaw + yPadding;

  const payoffData = useMemo(
    () =>
      buildPayoffCurve({
        optionType,
        strike: safeStrike,
        premiumUSDC: hasPremium ? premiumUSDC : 0,
        spot: safeSpot,
      }),
    [hasPremium, optionType, premiumUSDC, safeSpot, safeStrike]
  );

  return (
    <SurfaceCard className="space-y-3 p-3 sm:p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--inst-text)]">
          {pair} {optionType === "call" ? "Call" : "Put"}
        </h3>
        <span className="rounded-full border border-[var(--inst-border)] bg-[var(--inst-input)] px-2 py-0.5 text-[10px] font-semibold text-[var(--inst-label)]">
          {typeof daysToExpiry === "number" ? `${daysToExpiry}D` : "—"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <div className="rounded-[10px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-2.5 py-2">
          <div className="text-[10px] font-semibold text-[var(--inst-muted)]">Spot (NGN per USD)</div>
          <div className="mt-0.5 text-[14px] font-semibold text-[var(--inst-text)]">
            {hasSpot ? formatTwo(safeSpot) : "—"}
          </div>
        </div>
        <div className="rounded-[10px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-2.5 py-2">
          <div className="text-[10px] font-semibold text-[var(--inst-muted)]">Strike</div>
          <div className="mt-0.5 text-[14px] font-semibold text-[var(--inst-text)]">{formatTwo(safeStrike)}</div>
        </div>
        <div className="rounded-[10px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-2.5 py-2">
          <div className="text-[10px] font-semibold text-[var(--inst-muted)]">OTM/ITM %</div>
          <div className="mt-0.5 text-[14px] font-semibold text-[var(--inst-text)]">{moneyness}</div>
        </div>
        <div className="rounded-[10px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-2.5 py-2">
          <div className="text-[10px] font-semibold text-[var(--inst-muted)]">Breakeven</div>
          <div className="mt-0.5 text-[14px] font-semibold text-[var(--inst-text)]">
            {breakeven ? formatTwo(breakeven) : "—"}
          </div>
        </div>
      </div>

      <div className="h-[260px] rounded-[12px] border border-[var(--inst-border)] bg-[var(--inst-input)] px-2 py-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "chart" ? (
            <LineChart data={historyData} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="rgba(143, 144, 153, 0.24)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--inst-muted)" }}
                tickFormatter={(value: string) => value.slice(5)}
                minTickGap={26}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--inst-muted)" }}
                tickFormatter={(value: number) => formatWhole(value)}
                domain={[yMin, yMax]}
                width={52}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--inst-border)",
                  backgroundColor: "var(--inst-surface)",
                  fontSize: 11,
                  color: "var(--inst-text)",
                }}
                formatter={(value: number) => [`${formatTwo(value)} NGN/USD`, "Spot"]}
                labelFormatter={(value: string, payload) => {
                  const spotPoint = payload[0]?.payload?.spot as number | undefined;
                  const dist = typeof spotPoint === "number" ? spotPoint - safeStrike : 0;
                  return `${value}  |  Dist: ${formatSigned(dist)} to strike`;
                }}
              />
              <ReferenceArea
                y1={optionType === "call" ? positiveZoneLine : yMin}
                y2={optionType === "call" ? yMax : positiveZoneLine}
                fill="rgba(25, 135, 84, 0.10)"
              />
              <ReferenceLine
                y={safeStrike}
                stroke="#6b7280"
                strokeDasharray="4 4"
                label={{
                  value: `Strike ${formatWhole(safeStrike)}`,
                  position: "insideTopRight",
                  fill: "#6b7280",
                  fontSize: 10,
                }}
              />
              {breakeven ? (
                <ReferenceLine
                  y={breakeven}
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  label={{
                    value: "B/E",
                    position: "insideTopRight",
                    fill: "#1f2937",
                    fontSize: 10,
                  }}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="spot"
                stroke="#111118"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#111118" }}
              />
            </LineChart>
          ) : (
            <LineChart data={payoffData} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="rgba(143, 144, 153, 0.24)" vertical={false} />
              <XAxis
                dataKey="spot"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 10, fill: "var(--inst-muted)" }}
                tickFormatter={(value: number) => formatWhole(value)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--inst-muted)" }}
                tickFormatter={(value: number) => formatTwo(value)}
                width={52}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--inst-border)",
                  backgroundColor: "var(--inst-surface)",
                  fontSize: 11,
                  color: "var(--inst-text)",
                }}
                labelFormatter={(value) => `Spot ${formatTwo(Number(value))}`}
                formatter={(value: number) => [`${formatTwo(value)} USD`, "Profit @ Expiry"]}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
              {hasSpot ? (
                <ReferenceLine
                  x={safeSpot}
                  stroke="#111118"
                  strokeDasharray="3 3"
                  label={{
                    value: "Current Spot",
                    position: "insideTopRight",
                    fill: "#111118",
                    fontSize: 10,
                  }}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#111118"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#111118" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "chart", label: "Chart" },
          { value: "payoff", label: "Payoff" },
        ]}
        className="grid-cols-2"
        optionClassName="h-6 text-[12px]"
      />

      <p className="text-[11px] leading-[1.35] text-[var(--inst-muted)]">
        {optionType === "call"
          ? "Pays if USD rises above Strike at expiry (NGN weakens)."
          : "Pays if USD falls below Strike at expiry (NGN strengthens)."}
      </p>
    </SurfaceCard>
  );
}
