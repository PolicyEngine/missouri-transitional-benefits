import { useState, useMemo } from "react";
import { Stack, Title, Text, Paper, Slider, Group } from "@mantine/core";
import Plot from "react-plotly.js";

function computePvBenefits(
  income: number,
  benefitAmount: number,
  threshold: number,
  extensionPeriods: number,
  discountRate: number,
  extended: boolean,
): number {
  if (!extended) {
    return income <= threshold ? benefitAmount : 0;
  }

  if (income <= threshold) {
    let pv = 0;
    for (let t = 0; t < 1 + extensionPeriods; t++) {
      pv += benefitAmount / Math.pow(1 + discountRate, t);
    }
    return pv;
  }
  return 0;
}

export default function TwoPeriodModel() {
  const [extensionPeriods, setExtensionPeriods] = useState(3);
  const [discountRate, setDiscountRate] = useState(0.05);

  const benefitAmount = 5000;
  const threshold = 30000;

  const incomes = useMemo(() => {
    const arr: number[] = [];
    for (let y = 0; y <= 60000; y += 500) arr.push(y);
    return arr;
  }, []);

  const { standardPv, extendedPv, standardCliff, extendedCliff } = useMemo(() => {
    const stdPv = incomes.map((y) =>
      computePvBenefits(y, benefitAmount, threshold, 0, discountRate, false),
    );
    const extPv = incomes.map((y) =>
      computePvBenefits(y, benefitAmount, threshold, extensionPeriods, discountRate, true),
    );

    const stdCliff = benefitAmount;
    let extCliffVal = 0;
    for (let t = 0; t < 1 + extensionPeriods; t++) {
      extCliffVal += benefitAmount / Math.pow(1 + discountRate, t);
    }

    return {
      standardPv: stdPv,
      extendedPv: extPv,
      standardCliff: stdCliff,
      extendedCliff: extCliffVal,
    };
  }, [incomes, extensionPeriods, discountRate]);

  return (
    <Stack gap="md">
      <Title order={2}>Two-Period Model: Extended Eligibility</Title>

      <Text>
        Extending eligibility for additional periods does not eliminate cliffs.
        Instead, it capitalizes future benefits into a larger entry cliff at
        the eligibility threshold.
      </Text>

      <Paper p="md" withBorder>
        <Stack gap="lg">
          <div>
            <Text fw={500} mb="xs">
              Extension periods: {extensionPeriods}
            </Text>
            <Slider
              min={1}
              max={10}
              step={1}
              value={extensionPeriods}
              onChange={setExtensionPeriods}
              label={(v) => `${v} periods`}
            />
          </div>

          <div>
            <Text fw={500} mb="xs">
              Discount rate: {(discountRate * 100).toFixed(1)}%
            </Text>
            <Slider
              min={0}
              max={0.15}
              step={0.005}
              value={discountRate}
              onChange={setDiscountRate}
              label={(v) => `${(v * 100).toFixed(1)}%`}
            />
          </div>
        </Stack>
      </Paper>

      <Plot
        data={[
          {
            x: incomes,
            y: standardPv,
            type: "scatter",
            mode: "lines",
            name: "Standard (1 period)",
            line: { color: "#2C6496", width: 2 },
          },
          {
            x: incomes,
            y: extendedPv,
            type: "scatter",
            mode: "lines",
            name: `Extended (${1 + extensionPeriods} periods)`,
            line: { color: "#e74c3c", width: 2 },
          },
        ]}
        layout={{
          title: "Present Value of Benefits vs Income",
          xaxis: { title: "Income ($)", tickformat: "$,.0f" },
          yaxis: { title: "PV of Benefits ($)", tickformat: "$,.0f" },
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 40, r: 20 },
          autosize: true,
        }}
        config={{ responsive: true }}
        style={{ width: "100%", height: 450 }}
      />

      <Paper p="md" withBorder bg="gray.0">
        <Title order={4} mb="xs">
          Entry Cliff Sizes
        </Title>
        <Group gap="xl">
          <Text>
            <strong>Standard:</strong> ${standardCliff.toLocaleString()}
          </Text>
          <Text>
            <strong>Extended ({1 + extensionPeriods} periods):</strong> $
            {extendedCliff.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          Extending eligibility by {extensionPeriods} period{extensionPeriods > 1 ? "s" : ""} multiplies
          the cliff by {(extendedCliff / standardCliff).toFixed(2)}x (accounting for
          discounting at {(discountRate * 100).toFixed(1)}%).
        </Text>
      </Paper>
    </Stack>
  );
}
