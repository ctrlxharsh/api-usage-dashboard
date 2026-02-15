"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

interface TokenBarChartProps {
    data: {
        date: string;
        promptTokens: number;
        completionTokens: number;
    }[];
}

export function TokenBarChart({ data }: TokenBarChartProps) {
    // Scale down for display
    const scaled = data.map((d) => ({
        date: d.date,
        "Prompt Tokens (K)": Number((d.promptTokens / 1000).toFixed(1)),
        "Completion Tokens (K)": Number((d.completionTokens / 1000).toFixed(1)),
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={scaled}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
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
                    tickFormatter={(v: number) => `${v}K`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(17,17,27,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#a78bfa", fontWeight: 600 }}
                    itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    iconType="circle"
                />
                <Bar
                    dataKey="Prompt Tokens (K)"
                    stackId="tokens"
                    fill="#34d399"
                    radius={[0, 0, 0, 0]}
                />
                <Bar
                    dataKey="Completion Tokens (K)"
                    stackId="tokens"
                    fill="#fbbf24"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
