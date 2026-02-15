"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

interface UsagePieChartProps {
    data: { model: string; cost: number }[];
}

const COLORS = [
    "#a78bfa",
    "#38bdf8",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#fb923c",
    "#e879f9",
    "#22d3ee",
];

export function UsagePieChart({ data }: UsagePieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="cost"
                    nameKey="model"
                    strokeWidth={0}
                >
                    {data.map((_entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.3))" }}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(17,17,27,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number | string | undefined) => [`$${Number(value || 0).toFixed(4)}`, "Cost"]}
                />
                <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    iconType="circle"
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
