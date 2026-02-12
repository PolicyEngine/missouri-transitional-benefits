import { Stack, Title, Text, Paper, Group } from "@mantine/core";
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

export default function TheProblem() {
  const { earnings, baseline, metadata } = snapResults;

  const cliffCount = baseline.mtr.filter((m) => m > 1.0).length;
  const maxSnap = Math.max(...baseline.snap);

  // Identify cliff points and their causes
  const cliffLabels: { x: number; label: string }[] = [];
  for (let i = 1; i < earnings.length; i++) {
    if (baseline.mtr[i]! > 1.0) {
      const snapDrop = baseline.snap[i - 1]! - baseline.snap[i]!;
      const totalBenefitsDrop = baseline.benefits[i - 1]! - baseline.benefits[i]!;
      const otherDrop = totalBenefitsDrop - snapDrop;
      let label = "";
      if (snapDrop > otherDrop) {
        label = "SNAP";
      } else {
        label = "School meals";
      }
      cliffLabels.push({ x: earnings[i]!, label });
    }
  }

  return (
    <Stack gap="md">
      <Title order={2}>
        Current SNAP in Missouri has cliffs
      </Title>

      <Text>
        Consider a {metadata.household.toLowerCase()} in {metadata.state} (
        {metadata.year}). SNAP (the Supplemental Nutrition Assistance Program)
        provides up to ${maxSnap.toLocaleString()}/year in food benefits. But
        because eligibility is all-or-nothing at income thresholds, small
        earnings increases can trigger sudden benefit losses — cliffs where a
        household loses more than it gains.
      </Text>

      <Paper p="lg" withBorder>
        <Group gap="xl" align="flex-start">
          <div>
            <Text size="xl" fw={700} c={PE_TEAL}>
              ${maxSnap.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              maximum annual SNAP benefit
            </Text>
          </div>
          <div>
            <Text size="xl" fw={700} c={PE_TEAL}>
              {cliffCount}
            </Text>
            <Text size="sm" c="dimmed">
              earnings levels with MTR &gt; 100%
            </Text>
          </div>
        </Group>
      </Paper>

      {/* SNAP benefit vs earnings (baseline only) */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.snap,
            type: "scatter",
            mode: "lines",
            name: "SNAP benefit",
            line: { color: chartColors.primary, width: 2 },
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

      {/* Benefit breakdown */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.snap,
            type: "scatter",
            mode: "lines",
            name: "SNAP",
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings,
            y: baseline.eitc,
            type: "scatter",
            mode: "lines",
            name: "EITC",
            line: { color: chartColors.positive, width: 2 },
          },
          {
            x: earnings,
            y: baseline.ctc,
            type: "scatter",
            mode: "lines",
            name: "CTC",
            line: { color: chartColors.secondary, width: 2 },
          },
          {
            x: earnings,
            y: baseline.benefits,
            type: "scatter",
            mode: "lines",
            name: "Total benefits (SPM)",
            line: { color: chartColors.neutral, width: 1, dash: "dash" },
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
            title: "Annual amount",
            tickformat: "$,.0f",
            rangemode: "tozero",
          },
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />

      {/* Net income vs earnings with 45° line (baseline only) */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.net_income,
            type: "scatter",
            mode: "lines",
            name: "Net income",
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings,
            y: earnings,
            type: "scatter",
            mode: "lines",
            name: "45° line (no taxes/benefits)",
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
            title: "Net income",
            tickformat: "$,.0f",
          },
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />

      {/* Total MTR (baseline only) */}
      <Plot
        data={[
          {
            x: earnings,
            y: baseline.mtr.map((m) => Math.max(-1, Math.min(1, m)) * 100),
            type: "scatter",
            mode: "lines",
            name: "Marginal tax rate",
            line: { color: chartColors.primary, width: 2 },
          },
          {
            x: earnings.filter((_, i) => baseline.mtr[i]! > 1.0),
            y: earnings
              .filter((_, i) => baseline.mtr[i]! > 1.0)
              .map(() => 100),
            type: "scatter",
            mode: "markers",
            name: "Cliff (MTR > 100%)",
            marker: {
              color: chartColors.primary,
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
          {
            x: [earnings[0], earnings[earnings.length - 1]],
            y: [100, 100],
            type: "scatter",
            mode: "lines",
            name: "100% threshold",
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
            title: "Marginal tax rate (%)",
            range: [-105, 105],
          },
          annotations: cliffLabels.map((c, idx) => ({
            x: c.x,
            y: 100,
            text: c.label,
            showarrow: true,
            arrowhead: 0,
            ax: idx === 1 ? 40 : 0,
            ay: -30,
            font: { size: 12, family: INTER_FONT },
          })),
          legend: { ...chartLayout.legend, orientation: "h", y: -0.2 },
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "400px" }}
      />

      <Paper p="md" withBorder bg="gray.0">
        <Text size="sm">
          Source: {metadata.source}. Marginal tax rates calculated as 1 minus
          the change in net income per dollar of additional earnings ($
          {metadata.earnings_step} steps). Open circles indicate cliff points
          where the true MTR is effectively infinite. Net income includes
          employment income minus federal and state taxes plus all modeled
          benefits.
        </Text>
      </Paper>
    </Stack>
  );
}
