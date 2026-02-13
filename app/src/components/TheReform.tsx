import { useState, useMemo } from "react";
import { Stack, Title, Text, Paper, Slider, Group } from "@mantine/core";

import Plot from "react-plotly.js";
import {
  chartLayout as _chartLayout,
  chartColors,
} from "@policyengine/design-system/charts";
import snapResults from "../data/snap_results.json";

const INTER_FONT = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";
const PE_TEAL = "#319795";

const chartLayout = {
  ..._chartLayout,
  font: { ..._chartLayout.font, family: INTER_FONT },
};

export default function TheReform() {
  const [extensionPeriods, setExtensionPeriods] = useState(3);

  const { earnings, baseline, reform, future_snap, metadata } = snapResults;

  const { standardTotal, extendedTotal, maxStdCliff, maxExtCliff } = useMemo(() => {
    // Standard: just 2025 SNAP
    const stdTotal = baseline.snap.map((s) => s);

    // Extended: sum 2025 + future years up to extensionPeriods
    const extTotal = baseline.snap.map((s, idx) => {
      let total = s;
      for (let t = 1; t <= extensionPeriods; t++) {
        const yearKey = String(metadata.year + t);
        const yearSnap = future_snap[yearKey as keyof typeof future_snap];
        if (yearSnap) {
          total += yearSnap[idx]!;
        }
      }
      return Math.round(total * 100) / 100;
    });

    let maxStd = 0;
    let maxExt = 0;
    for (let i = 1; i < stdTotal.length; i++) {
      const stdDrop = stdTotal[i - 1]! - stdTotal[i]!;
      const extDrop = extTotal[i - 1]! - extTotal[i]!;
      if (stdDrop > maxStd) maxStd = stdDrop;
      if (extDrop > maxExt) maxExt = extDrop;
    }

    return {
      standardTotal: stdTotal,
      extendedTotal: extTotal,
      maxStdCliff: Math.round(maxStd),
      maxExtCliff: Math.round(maxExt),
    };
  }, [baseline.snap, future_snap, metadata.year, extensionPeriods]);

  return (
    <Stack gap="md">
      <Title order={2}>How the reform changes the cliff structure</Title>

      <Text>
        Missouri{" "}
        <a
          href="https://www.senate.mo.gov/23info/bts_web/Bill.aspx?SessionType=R&BillID=44573"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#319795" }}
        >
          SB 82
        </a>{" "}
        (signed 2023) created a transitional benefits program, raising income
        limits from {metadata.baseline_desc.toLowerCase()} to{" "}
        {metadata.reform_desc.toLowerCase()}. This extends the income range
        over which households receive SNAP benefits. Below, we examine how
        this affects the distribution of marginal tax rates.
      </Text>

      {/* SNAP benefit: baseline vs reform */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.snap,
            type: "scatter",
            mode: "lines",
            name: "Baseline SNAP",
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings,
            y: reform.snap,
            type: "scatter",
            mode: "lines",
            name: "Reform SNAP",
            line: { color: chartColors.negative, width: 2, dash: "dash" },
          },
        ]}
        layout={{
          ...chartLayout,
          title: undefined,
          xaxis: {
            ...chartLayout.xaxis,
            title: "Employment income",
            tickformat: "$,.0f",
          },
          yaxis: {
            ...chartLayout.yaxis,
            title: "Annual SNAP benefit",
            tickformat: "$,.0f",
            rangemode: "tozero",
          },
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />

      {/* SNAP MTR: baseline vs reform */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.snap_mtr.map((m) =>
              Math.max(-1, Math.min(1, m)) * 100,
            ),
            type: "scatter",
            mode: "lines",
            name: "Baseline SNAP MTR",
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings.filter((_, i) => baseline.snap_mtr[i]! > 1.0),
            y: earnings
              .filter((_, i) => baseline.snap_mtr[i]! > 1.0)
              .map(() => 100),
            type: "scatter",
            mode: "markers",
            name: "Baseline cliff",
            marker: {
              color: chartColors.primary,
              size: 10,
              symbol: "circle-open",
              line: { width: 2 },
            },
          },
          {
            x: earnings,
            y: reform.snap_mtr.map((m) =>
              Math.max(-1, Math.min(1, m)) * 100,
            ),
            type: "scatter",
            mode: "lines",
            name: "Reform SNAP MTR",
            line: { color: chartColors.negative, width: 2, dash: "dash" },
          },
          {
            x: earnings.filter((_, i) => reform.snap_mtr[i]! > 1.0),
            y: earnings
              .filter((_, i) => reform.snap_mtr[i]! > 1.0)
              .map(() => 100),
            type: "scatter",
            mode: "markers",
            name: "Reform cliff",
            marker: {
              color: chartColors.negative,
              size: 10,
              symbol: "circle-open",
              line: { width: 2 },
            },
          },
          {
            x: [earnings[0], earnings[earnings.length - 1]],
            y: [0, 0],
            type: "scatter",
            mode: "lines",
            showlegend: false,
            line: { color: chartColors.neutral, width: 1, dash: "dot" },
          },
        ]}
        layout={{
          ...chartLayout,
          title: undefined,
          xaxis: {
            ...chartLayout.xaxis,
            title: "Employment income",
            tickformat: "$,.0f",
          },
          yaxis: {
            ...chartLayout.yaxis,
            title: "SNAP marginal tax rate (%)",
            range: [-105, 105],
          },
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />

      {/* Conservation integral box */}
      <Paper p="lg" withBorder bg="teal.0">
        <Title order={3} mb="xs">
          The MTR integral is conserved
        </Title>
        <Text size="sm" mb="sm">
          The integral of a program's marginal tax rate over income equals
          the maximum benefit (see <em>The math</em> tab). This means
          changing eligibility thresholds redistributes MTR across the
          income distribution, but does not change the total.
        </Text>
        <Group gap="xl">
          <div>
            <Text size="xl" fw={700} c={PE_TEAL}>
              ${baseline.snap_integral.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              baseline ∫MTR
            </Text>
          </div>
          <div>
            <Text size="xl" fw={700}>
              =
            </Text>
          </div>
          <div>
            <Text size="xl" fw={700} c={PE_TEAL}>
              ${reform.snap_integral.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              reform ∫MTR
            </Text>
          </div>
        </Group>
      </Paper>

      {/* PV of SNAP with extended eligibility */}
      <Title order={3} mt="md">
        Multi-year eligibility and the entry cliff
      </Title>

      <Text>
        If extended eligibility means a household qualifies for{" "}
        {1 + extensionPeriods} years of SNAP instead of 1, the entry cliff
        reflects all years of benefits combined rather than a single year.
      </Text>

      <Paper p="md" withBorder>
        <Stack gap="lg">
          <div>
            <Text fw={500} mb="xs">
              Extension periods: {extensionPeriods} year
              {extensionPeriods > 1 ? "s" : ""}
            </Text>
            <Slider
              color="teal"
              min={1}
              max={10}
              step={1}
              value={extensionPeriods}
              onChange={setExtensionPeriods}
              label={(v) => `${v} year${v > 1 ? "s" : ""}`}
            />
          </div>

        </Stack>
      </Paper>

      <Plot
        data={[
          {
            x: earnings,
            y: standardTotal,
            type: "scatter",
            mode: "lines",
            name: `Standard (${metadata.year} only)`,
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings,
            y: extendedTotal,
            type: "scatter",
            mode: "lines",
            name: `Extended (${metadata.year}–${metadata.year + extensionPeriods})`,
            line: { color: chartColors.negative, width: 2 },
          },
        ]}
        layout={{
          ...chartLayout,
          title: undefined,
          xaxis: {
            ...chartLayout.xaxis,
            title: "Employment income",
            tickformat: "$,.0f",
          },
          yaxis: {
            ...chartLayout.yaxis,
            title: "Total SNAP benefits",
            tickformat: "$,.0f",
            rangemode: "tozero",
          },
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "450px" }}
      />

      <Paper p="md" withBorder bg="gray.0">
        <Title order={4} mb="xs">
          Entry cliff at eligibility threshold
        </Title>
        <Group gap="xl">
          <div>
            <Text size="xl" fw={700} c={PE_TEAL}>
              ${maxStdCliff.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              standard (1 year)
            </Text>
          </div>
          <div>
            <Text size="xl" fw={700} c="red">
              ${maxExtCliff.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              extended ({1 + extensionPeriods} years)
            </Text>
          </div>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          Extending eligibility by {extensionPeriods} year
          {extensionPeriods > 1 ? "s" : ""} multiplies the largest cliff by{" "}
          {maxStdCliff > 0
            ? (maxExtCliff / maxStdCliff).toFixed(1)
            : "—"}
          x.
        </Text>
      </Paper>
    </Stack>
  );
}
