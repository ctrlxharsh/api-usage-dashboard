export interface DailyUsage {
    date: string; // YYYY-MM-DD
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
}

export interface ModelUsage {
    model: string;
    totalTokens: number;
    requests: number;
    cost: number;
}

export interface UsageData {
    daily: DailyUsage[];
    byModel: ModelUsage[];
    totalTokens: number;
    totalRequests: number;
    totalCost: number;
    peakDay: string;
    avgDailyCost: number;
    costIsEstimated: boolean;
    raw: any; // Debug: raw API response
}

const PRICING: Record<string, { prompt: number; completion: number }> = {
    "gpt-4o": { prompt: 0.0025, completion: 0.01 },
    "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
    "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
    "gpt-4": { prompt: 0.03, completion: 0.06 },
    "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
    "text-embedding-3-small": { prompt: 0.00002, completion: 0 },
    "text-embedding-3-large": { prompt: 0.00013, completion: 0 },
    "text-embedding-ada-002": { prompt: 0.0001, completion: 0 },
    "dall-e-3": { prompt: 0.04, completion: 0 },
    "dall-e-2": { prompt: 0.02, completion: 0 },
};

function estimateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
): number {
    const key =
        Object.keys(PRICING).find((k) =>
            model.toLowerCase().startsWith(k)
        ) || "";
    const pricing = PRICING[key] || { prompt: 0.002, completion: 0.002 };
    return (
        (promptTokens / 1000) * pricing.prompt +
        (completionTokens / 1000) * pricing.completion
    );
}

// ────────────────────────────────────────────────────
//  Fetch from /v1/usage (Robust Date Loop)
// ────────────────────────────────────────────────────

export async function fetchUsage(
    apiKey: string,
    startDate: Date,
    endDate: Date
): Promise<UsageData> {
    const headers = { Authorization: `Bearer ${apiKey}` };

    // 1. Build list of YYYY-MM-DD dates to fetch
    const dates: string[] = [];
    const current = new Date(startDate);
    // Ensure we don't fetch beyond today/endDate
    while (current <= endDate) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    // 2. Parallel fetch with concurrency limit (Batch size 5)
    const dailyMap = new Map<string, DailyUsage>();
    const modelMap = new Map<string, ModelUsage>();
    const allRawData: any[] = [];

    const BATCH_SIZE = 5;
    for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const batch = dates.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async (dateStr) => {
                try {
                    // Explicitly use ?date=YYYY-MM-DD as required by API
                    const res = await fetch(
                        `https://api.openai.com/v1/usage?date=${dateStr}`,
                        { headers }
                    );
                    if (!res.ok) {
                        // If it's the first request and fails, throw to alert user
                        if (i === 0 && dateStr === batch[0]) {
                            const body = await res.text();
                            throw new Error(`API Error (${res.status}): ${body}`);
                        }
                        return { dateStr, data: [] };
                    }
                    const json = await res.json();
                    // The API returns { object: "list", data: [...] }
                    return { dateStr, data: json.data || [] };
                } catch (e) {
                    console.error(`Failed to fetch ${dateStr}`, e);
                    return { dateStr, data: [] };
                }
            })
        );

        // Process batch results
        for (const { dateStr, data } of results) {
            if (data && data.length > 0) {
                allRawData.push(...data.map((d: any) => ({ ...d, _fetched_date: dateStr })));
            }

            let dRequests = 0;
            let dPrompt = 0;
            let dCompletion = 0;
            let dCost = 0;

            for (const entry of data) {
                // Map fields based on standard response
                // Try multiple field names to be robust
                const pTok = entry.input_tokens || entry.n_context_tokens_total || entry.prompt_tokens || 0;
                const cTok = entry.output_tokens || entry.n_generated_tokens_total || entry.completion_tokens || 0;
                const reqs = entry.num_requests || entry.n_requests || 1; // Default to 1 if missing but entry exists
                const model = entry.model || entry.snapshot_id || "unknown";

                const cost = estimateCost(model, pTok, cTok);

                dPrompt += pTok;
                dCompletion += cTok;
                dRequests += reqs;
                dCost += cost;

                // Model aggregation
                const m = modelMap.get(model) || { model, totalTokens: 0, requests: 0, cost: 0 };
                m.totalTokens += pTok + cTok;
                m.requests += reqs;
                m.cost += cost;
                modelMap.set(model, m);
            }

            // Only add day if there's activity
            if (dRequests > 0 || dCost > 0 || dPrompt > 0) {
                dailyMap.set(dateStr, {
                    date: dateStr,
                    requests: dRequests,
                    promptTokens: dPrompt,
                    completionTokens: dCompletion,
                    totalTokens: dPrompt + dCompletion,
                    cost: dCost,
                });
            }
        }
    }

    // 3. Build Final Arrays
    const daily = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({ ...d, cost: Number(d.cost.toFixed(6)) }));

    const byModel = Array.from(modelMap.values())
        .map(m => ({ ...m, cost: Number(m.cost.toFixed(6)) }))
        .sort((a, b) => b.cost - a.cost);

    const totalCost = daily.reduce((sum, d) => sum + d.cost, 0);
    const totalTokens = daily.reduce((sum, d) => sum + d.totalTokens, 0);
    const totalRequests = daily.reduce((sum, d) => sum + d.requests, 0);

    const peakDay = daily.length > 0
        ? daily.reduce((a, b) => (a.cost > b.cost ? a : b)).date
        : "N/A";

    return {
        daily,
        byModel,
        totalTokens,
        totalRequests,
        totalCost: Number(totalCost.toFixed(2)),
        peakDay,
        avgDailyCost: daily.length > 0
            ? Number((totalCost / daily.length).toFixed(2))
            : 0,
        costIsEstimated: true,
        raw: {
            object: "list",
            data: allRawData,
            _comment: "Fetched via /v1/usage?date=YYYY-MM-DD loop (Required by API)",
        }
    };
}

// ────────────────────────────────────────────────────
//  Mock Data
// ────────────────────────────────────────────────────
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

export function getMockUsage(): UsageData {
    const days = 30;
    const daily: DailyUsage[] = [];
    const now = new Date();
    const rand = seededRandom(42);
    const models = Object.keys(PRICING).slice(0, 6);
    const modelTotals = new Map<string, ModelUsage>();

    models.forEach(m => modelTotals.set(m, { model: m, totalTokens: 0, requests: 0, cost: 0 }));

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i) + 1);

        let dCost = 0, dReqs = 0, dPrompt = 0, dComp = 0;

        models.forEach(model => {
            const load = (0.5 + rand()) * (i / days * 0.5 + 0.5); // increasing trend
            const reqs = Math.floor(load * (model.includes("gpt-4") ? 50 : 200));
            if (reqs === 0) return;

            const p = reqs * Math.floor(500 * (0.8 + 0.4 * rand()));
            const c = reqs * Math.floor(200 * (0.8 + 0.4 * rand()));
            const cost = estimateCost(model, p, c);

            dCost += cost;
            dReqs += reqs;
            dPrompt += p;
            dComp += c;

            const m = modelTotals.get(model)!;
            m.cost += cost;
            m.requests += reqs;
            m.totalTokens += p + c;
        });

        daily.push({
            date: date.toISOString().split("T")[0],
            requests: dReqs,
            promptTokens: dPrompt,
            completionTokens: dComp,
            totalTokens: dPrompt + dComp,
            cost: Number(dCost.toFixed(4)),
        });
    }

    const byModel = Array.from(modelTotals.values()).map(m => ({ ...m, cost: Number(m.cost.toFixed(4)) }));
    const totalCost = daily.reduce((s, d) => s + d.cost, 0);

    return {
        daily,
        byModel,
        totalTokens: daily.reduce((s, d) => s + d.totalTokens, 0),
        totalRequests: daily.reduce((s, d) => s + d.requests, 0),
        totalCost: Number(totalCost.toFixed(2)),
        peakDay: "N/A",
        avgDailyCost: Number((totalCost / days).toFixed(2)),
        costIsEstimated: false,
        raw: {
            object: "list",
            data: daily.map(d => ({ ...d, source: "mock-generator" })),
            _comment: "Mock data generated for demo"
        }
    };
}
