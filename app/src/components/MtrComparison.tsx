import { useState, useMemo } from "react";
import { Stack, Title, Text, Paper, Group, Slider } from "@mantine/core";
import Plot from "react-plotly.js";

function computeBenefit(
  income: number,
  benefitAmount: number,
  threshold: number,
  phaseOutRate: number,
  design: "cliff" | "phase_out" | "universal",
): number {
  switch (design) {
    case "cliff":
      return income <= threshold ? benefitAmount : 0;
    case "phase_out": {
      if (income <= threshold) return benefitAmount;
      const reduced = benefitAmount - phaseOutRate * (income - threshold);
      return Math.max(reduced, 0);
    }
    case "universal":
      return benefitAmount;
  }
}

function computeMtr(
  incomes: number[],
  benefitAmount: number,
  threshold: number,
  phaseOutRate: number,
  design: "cliff" | "phase_out" | "universal",
): number[] {
  const dy = 100;
  return incomes.map((y) => {
    const b1 = computeBenefit(y, benefitAmount, threshold, phaseOutRate, design);
    const b2 = computeBenefit(y + dy, benefitAmount, threshold, phaseOutRate, design);
    const mtr = -(b2 - b1) / dy;
    return mtr * 100;
  });
}

function computeIntegral(
  incomes: number[],
  mtrPcts: number[],
): number {
  let sum = 0;
  for (let i = 0; i < incomes.length - 1; i++) {
    const x0 = incomes[i]!;
    const x1 = incomes[i + 1]!;
    const m = mtrPcts[i]!;
    sum += (m / 100) * (x1 - x0);
  }
  return sum;
}

export default function MtrComparison() {
  const [benefitAmount, setBenefitAmount] = useState(5000);
  const [threshold, setThreshold] = useState(30000);
  const [phaseOutRate, setPhaseOutRate] = useState(0.5);

  const incomes = useMemo(() => {
    const arr: number[] = [];
    for (let y = 0; y <= 80000; y += 200) arr.push(y);
    return arr;
  }, []);

  const { cliffMtr, phaseOutMtr, universalMtr } = useMemo(() => {
    return {
      cliffMtr: computeMtr(incomes, benefitAmount, threshold, phaseOutRate, "cliff"),
      phaseOutMtr: computeMtr(incomes, benefitAmount, threshold, phaseOutRate, "phase_out"),
      universalMtr: computeMtr(incomes, benefitAmount, threshold, phaseOutRate, "universal"),
    };
  }, [incomes, benefitAmount, threshold, phaseOutRate]);

  const cliffIntegral = computeIntegral(incomes, cliffMtr);
  const phaseOutIntegral = computeIntegral(incomes, phaseOutMtr);
  const universalIntegral = computeIntegral(incomes, universalMtr);

  return (
    <Stack gap="md">
      <Title order={2}>MTR Comparison Across Designs</Title>

      <Text>
        Adjust the parameters below to see how different benefit designs
        distribute marginal tax rates across the income distribution.
      </Text>

      <Paper p="md" withBorder>
        <Stack gap="lg">
          <div>
            <Text fw={500} mb="xs">
              Benefit amount: ${benefitAmount.toLocaleString()}
            </Text>
            <Slider
              min={0}
              max={20000}
              step={500}
              value={benefitAmount}
              onChange={setBenefitAmount}
              label={(v) => `$${v.toLocaleString()}`}
            />
          </div>

          <div>
            <Text fw={500} mb="xs">
              Income threshold: ${threshold.toLocaleString()}
            </Text>
            <Slider
              min={0}
              max={80000}
              step={1000}
              value={threshold}
              onChange={setThreshold}
              label={(v) => `$${v.toLocaleString()}`}
            />
          </div>

          <div>
            <Text fw={500} mb="xs">
              Phase-out rate: {(phaseOutRate * 100).toFixed(0)}%
            </Text>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={phaseOutRate}
              onChange={setPhaseOutRate}
              label={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </Stack>
      </Paper>

      <Plot
        data={[
          {
            x: incomes,
            y: cliffMtr,
            type: "scatter",
            mode: "lines",
            name: "Cliff",
            line: { color: "#e74c3c", width: 2 },
          },
          {
            x: incomes,
            y: phaseOutMtr,
            type: "scatter",
            mode: "lines",
            name: "Phase-out",
            line: { color: "#2C6496", width: 2 },
          },
          {
            x: incomes,
            y: universalMtr,
            type: "scatter",
            mode: "lines",
            name: "Universal",
            line: { color: "#27ae60", width: 2 },
          },
        ]}
        layout={{
          title: "Marginal Tax Rates by Design",
          xaxis: { title: "Income ($)", tickformat: "$,.0f" },
          yaxis: { title: "MTR (%)", rangemode: "tozero" },
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 40, r: 20 },
          autosize: true,
        }}
        config={{ responsive: true }}
        style={{ width: "100%", height: 450 }}
      />

      <Paper p="md" withBorder bg="gray.0">
        <Title order={4} mb="xs">
          Conservation Integral Values
        </Title>
        <Group gap="xl">
          <Text>
            <strong>Cliff:</strong> ${cliffIntegral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
          <Text>
            <strong>Phase-out:</strong> ${phaseOutIntegral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
          <Text>
            <strong>Universal:</strong> ${universalIntegral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          Each integral should approximate the benefit amount (${benefitAmount.toLocaleString()})
          for means-tested designs. Universal design has no phase-out MTR.
        </Text>
      </Paper>
    </Stack>
  );
}
