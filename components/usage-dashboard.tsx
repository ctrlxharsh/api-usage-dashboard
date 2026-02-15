"use client";

import { useState } from "react";
import { fetchUsage, getMockUsage, UsageData } from "@/lib/openai";
import { UsageBarChart } from "@/components/usage-bar-chart";
import { UsagePieChart } from "@/components/usage-pie-chart";
import { CumulativeCostChart } from "@/components/cumulative-cost-chart";
import { TokenBarChart } from "@/components/token-bar-chart";
import { RequestsChart } from "@/components/requests-chart";
import {
    Loader2,
    Search,
    DollarSign,
    Zap,
    BarChart3,
    TrendingUp,
    Activity,
    Settings,
} from "lucide-react";

export default function UsageDashboard() {
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usageData, setUsageData] = useState<UsageData | null>(null);

    // Default to last 30 days
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });

    const handleFetch = async () => {
        if (!apiKey) {
            setError("Please enter an API Key");
            return;
        }

        setLoading(true);
        setError(null);
        setUsageData(null);

        try {
            if (apiKey.toLowerCase() === "mock") {
                await new Promise((r) => setTimeout(r, 600));
                setUsageData(getMockUsage());
            } else {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                const data = await fetchUsage(apiKey, start, end);
                setUsageData(data);
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch usage data.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const formatTokens = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
        return String(n);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* ── Top Bar: Controls ── */}
            <div
                className="glass-card"
                style={{
                    padding: "16px 24px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto" }}>
                    <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                        <Settings style={{ position: "absolute", left: 12, top: 14, width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
                        <input
                            type="password"
                            placeholder="Enter API Key (sk-...)"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="dash-input"
                            style={{ paddingLeft: "36px" }}
                            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="dash-input"
                        style={{ width: "auto" }}
                    />
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="dash-input"
                        style={{ width: "auto" }}
                    />
                    <button
                        onClick={handleFetch}
                        disabled={loading}
                        className="dash-button"
                        style={{ marginLeft: "8px" }}
                    >
                        {loading ? <Loader2 className="animate-spin" width={16} /> : <Search width={16} />}
                        Analyze
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-box">
                    <p style={{ fontWeight: 600 }}>Error Fetching Data</p>
                    <p style={{ opacity: 0.8 }}>{error}</p>
                </div>
            )}

            {/* ── Dashboard Content ── */}
            {usageData && (
                <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Row 1: Key Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <StatCard
                            icon={<DollarSign width={18} />}
                            label="Estimated Cost"
                            value={`$${usageData.totalCost.toFixed(2)}`}
                            sub={usageData.costIsEstimated ? "Calculated from tokens" : "From Billing API"}
                            color="#a78bfa"
                        />
                        <StatCard
                            icon={<Zap width={18} />}
                            label="Total Tokens"
                            value={formatTokens(usageData.totalTokens)}
                            sub={`${usageData.totalTokens.toLocaleString()}`}
                            color="#38bdf8"
                        />
                        <StatCard
                            icon={<BarChart3 width={18} />}
                            label="Requests"
                            value={usageData.totalRequests.toLocaleString()}
                            sub="Total API Calls"
                            color="#34d399"
                        />
                        <StatCard
                            icon={<Activity width={18} />}
                            label="Avg Daily Cost"
                            value={`$${usageData.avgDailyCost.toFixed(2)}`}
                            sub={`Peak: ${usageData.peakDay}`}
                            color="#fbbf24"
                        />
                    </div>

                    {/* Row 2: Activity Chart (Main) */}
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <TrendingUp width={18} color="#a78bfa" />
                            Usage Activity (Daily Cost)
                        </h3>
                        <UsageBarChart data={usageData.daily} />
                    </div>

                    {/* Row 3: Breakdown Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>

                        {/* Model Breakdown Table */}
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <BarChart3 width={18} color="#fbbf24" />
                                Model Breakdown
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {usageData.byModel.map((m, i) => {
                                    const max = Math.max(...usageData.byModel.map(x => x.cost));
                                    const pct = max ? (m.cost / max) * 100 : 0;
                                    return (
                                        <div key={m.model}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                                                <span style={{ fontWeight: 500 }}>{m.model}</span>
                                                <span style={{ opacity: 0.6 }}>${m.cost.toFixed(4)}</span>
                                            </div>
                                            <div className="progress-track" style={{ height: "6px" }}>
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: i === 0 ? "#a78bfa" : "rgba(255,255,255,0.2)"
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", gap: "12px", fontSize: "11px", opacity: 0.4, marginTop: "4px" }}>
                                                <span>{formatTokens(m.totalTokens)} tokens</span>
                                                <span>{m.requests.toLocaleString()} reqs</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Cost Distribution (Pie) */}
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <TrendingUp width={18} color="#38bdf8" />
                                Cost Distribution
                            </h3>
                            <UsagePieChart data={usageData.byModel} />
                        </div>

                    </div>

                    {/* Row 4: Cumulative & Tokens */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <TrendingUp width={18} color="#34d399" />
                                Cumulative Cost
                            </h3>
                            <CumulativeCostChart data={usageData.daily} />
                        </div>

                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Zap width={18} color="#38bdf8" />
                                Token Usage (Prompt vs Completion)
                            </h3>
                            <TokenBarChart data={usageData.daily} />
                        </div>
                    </div>

                    {/* Row 5: Requests Chart */}
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Activity width={18} color="#f87171" />
                            Request Volume
                        </h3>
                        <RequestsChart data={usageData.daily} />
                    </div>

                    {/* Debug: Raw Response */}
                    {usageData.raw && (
                        <div className="glass-card" style={{ padding: "24px", opacity: 0.8 }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Settings width={14} />
                                Raw API Response
                            </h3>
                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "16px", overflow: "hidden" }}>
                                <pre style={{
                                    fontSize: "10px",
                                    fontFamily: "monospace",
                                    color: "rgba(255,255,255,0.6)",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {JSON.stringify(usageData.raw, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {!usageData && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.5 }}>
                    <Activity width={48} height={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                    <p style={{ fontSize: "14px" }}>Enter your API key above to analyze usage.</p>
                    <p style={{ fontSize: "12px", marginTop: "8px" }}>
                        Keys are processed locally. Type <code>mock</code> for a demo.
                    </p>
                </div>
            )}

        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    color: string;
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
    return (
        <div className="stat-card">
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{
                    padding: "10px",
                    borderRadius: "10px",
                    background: `${color}15`,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontSize: "11px", opacity: 0.5, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, lineHeight: "1.2", marginBottom: "4px", color: "#fff" }}>{value}</div>
                    <div style={{ fontSize: "12px", opacity: 0.4 }}>{sub}</div>
                </div>
            </div>
        </div>
    )
}
