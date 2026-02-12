import { Stack, Title, Text, Paper, Group } from "@mantine/core";
import Plot from "react-plotly.js";
import ctResults from "../data/ct_results.json";

export default function CtResults() {
  const { cliff_share, mtr_distribution, sample_size, state, year } = ctResults;

  const binLabels = mtr_distribution.bins
    .slice(0, -1)
    .map((b, i) => `${b}%-${mtr_distribution.bins[i + 1]}%`);

  return (
    <Stack gap="md">
      <Title order={2}>{state} Microsimulation Results ({year})</Title>

      <Paper p="lg" withBorder>
        <Group gap="xl" align="flex-start">
          <div>
            <Text size="xl" fw={700} c="blue.5">
              {(cliff_share * 100).toFixed(1)}%
            </Text>
            <Text size="sm" c="dimmed">
              of households face a benefits cliff
            </Text>
          </div>
          <div>
            <Text size="xl" fw={700} c="blue.5">
              {sample_size.toLocaleString()}
            </Text>
            <Text size="sm" c="dimmed">
              households simulated
            </Text>
          </div>
        </Group>
      </Paper>

      <Plot
        data={[
          {
            x: binLabels,
            y: mtr_distribution.counts,
            type: "bar",
            marker: { color: "#2C6496" },
            name: "Households (%)",
          },
        ]}
        layout={{
          title: "Distribution of Marginal Tax Rates",
          xaxis: { title: "MTR Range" },
          yaxis: { title: "Share of Households (%)" },
          margin: { t: 40, r: 20 },
          autosize: true,
          bargap: 0.1,
        }}
        config={{ responsive: true }}
        style={{ width: "100%", height: 400 }}
      />

      <Paper p="md" withBorder bg="gray.0">
        <Title order={4} mb="xs">
          Methodology
        </Title>
        <Text size="sm">
          Results are based on a microsimulation of {sample_size.toLocaleString()} representative
          households in {state} using PolicyEngine-US. A benefits cliff is defined
          as a marginal tax rate exceeding 100% (i.e., net income decreases when
          gross income increases by $1). The MTR distribution shows the share of
          households in each MTR range, considering federal and state taxes and
          benefit programs.
        </Text>
      </Paper>
    </Stack>
  );
}
