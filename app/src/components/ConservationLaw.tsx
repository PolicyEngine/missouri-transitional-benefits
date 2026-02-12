import { Stack, Text, Title, Paper } from "@mantine/core";
import katex from "katex";
import "katex/dist/katex.min.css";

function tex(latex: string, displayMode = false): string {
  return katex.renderToString(latex, { displayMode, throwOnError: false });
}

function Tex({
  children,
  display = false,
}: {
  children: string;
  display?: boolean;
}) {
  return (
    <span dangerouslySetInnerHTML={{ __html: tex(children, display) }} />
  );
}

export default function ConservationLaw() {
  return (
    <Stack gap="md">
      <Title order={2}>The Conservation of Means-Testing</Title>

      <Text>
        Any means-tested benefit of value <Tex>b</Tex> must impose cumulative
        marginal tax rates that integrate to at least <Tex>b</Tex> somewhere
        across the income distribution. This is the fundamental conservation
        law of means-testing.
      </Text>

      <Paper p="lg" withBorder bg="gray.0">
        <Tex display>
          {String.raw`\int_0^{\infty} \text{MTR}(y) \, dy = b`}
        </Tex>
      </Paper>

      <Text>
        Intuitively, if a program provides a benefit worth <Tex>b</Tex> to
        low-income households, that benefit must be withdrawn as income rises.
        Whether it is withdrawn suddenly (a cliff) or gradually (a phase-out),
        the total area under the MTR curve imposed by the program must equal
        the benefit amount <Tex>b</Tex>.
      </Text>

      <Title order={3}>Three Design Approaches</Title>

      <Text>
        <strong>Cliff design:</strong> Benefits are withdrawn entirely at a
        single income threshold. This concentrates the full MTR into a single
        point, creating an effective MTR of infinity (or 100%+ over a narrow
        band). The integral is satisfied by{" "}
        <Tex>{String.raw`\text{MTR} \to \infty`}</Tex> at one point.
      </Text>

      <Text>
        <strong>Phase-out design:</strong> Benefits are reduced gradually at
        rate <Tex>r</Tex> over an income range of width{" "}
        <Tex>{String.raw`\frac{b}{r}`}</Tex>. The conservation law is
        satisfied by <Tex>{String.raw`r \times \frac{b}{r} = b`}</Tex>.
      </Text>

      <Text>
        <strong>Universal design:</strong> Benefits are provided to everyone
        regardless of income. No means-testing means zero additional MTR. The
        conservation law is satisfied trivially because the benefit is
        financed through the general tax system rather than program-specific
        phase-outs.
      </Text>

      <Title order={3}>Extended Eligibility and Entry Cliffs</Title>

      <Text>
        One policy response to cliffs is to extend eligibility further up the
        income distribution. However, this does not eliminate the fundamental
        constraint. Instead, it capitalizes the cliff into an{" "}
        <strong>entry cliff</strong>: households just above the new, higher
        threshold face a loss equal to the present value of benefits over the
        extended period.
      </Text>

      <Paper p="lg" withBorder bg="gray.0">
        <Tex display>
          {String.raw`\text{Entry cliff} = b \times T`}
        </Tex>
      </Paper>

      <Text>
        Where <Tex>T</Tex> is the number of additional periods of eligibility.
        Extending eligibility by <Tex>T</Tex> periods means the cliff at the
        boundary grows by a factor of <Tex>T</Tex>, making the eventual
        discontinuity even larger. The conservation law cannot be circumvented
        — only the distribution of MTRs across income can be changed.
      </Text>
    </Stack>
  );
}
