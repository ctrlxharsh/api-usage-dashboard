"use client";

import {
    BarChart,
    Bar,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface RequestsChartProps {
    data: { date: string; requests: number }[];
}

export function RequestsChart({ data }: RequestsChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
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
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(17,17,27,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: "#f87171", fontWeight: 600 }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number | string | undefined) => [value, "Requests"]}
                />
                <Bar dataKey="requests" fill="#f87171" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
        </ResponsiveContainer>
    );
}
