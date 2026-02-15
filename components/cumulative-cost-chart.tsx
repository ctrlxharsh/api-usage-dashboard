"use client";

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface CumulativeCostChartProps {
    data: { date: string; cost: number }[];
}

export function CumulativeCostChart({ data }: CumulativeCostChartProps) {
    // Build cumulative data
    let cumulative = 0;
    const cumulativeData = data.map((d) => {
        cumulative += d.cost;
        return { date: d.date, cumulative: Number(cumulative.toFixed(4)) };
    });

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={cumulativeData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(17,17,27,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#38bdf8", fontWeight: 600 }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number | string | undefined) => [
                        `$${Number(value || 0).toFixed(2)}`,
                        "Cumulative Cost",
                    ]}
                />
                <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
