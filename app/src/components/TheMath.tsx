import { Stack, Title, Text, Paper } from "@mantine/core";
import katex from "katex";
import "katex/dist/katex.min.css";

function Tex({
  children,
  display = false,
}: {
  children: string;
  display?: boolean;
}) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          displayMode: display,
          throwOnError: false,
        }),
      }}
    />
  );
}

export default function TheMath() {
  return (
    <Stack gap="md">
      <Title order={2}>The conservation law</Title>

      <Text>
        Any means-tested benefit of value <Tex>b</Tex> must impose cumulative
        marginal tax rates that integrate to exactly <Tex>b</Tex>:
      </Text>

      <Paper p="lg" withBorder bg="gray.0">
        <Tex display>
          {String.raw`\int_0^{\infty} \text{MTR}_{\text{program}}(y) \, dy = b`}
        </Tex>
      </Paper>

      <Title order={3}>Three designs, same integral</Title>

      <Text>
        <strong>Cliff:</strong> The full benefit is withdrawn at a single
        threshold — <Tex>{String.raw`\text{MTR} \to \infty`}</Tex> at one
        point, zero everywhere else.
      </Text>

      <Text>
        <strong>Phase-out:</strong> Benefits are reduced at rate <Tex>r</Tex>{" "}
        over an income range of width{" "}
        <Tex>{String.raw`\frac{b}{r}`}</Tex>, so{" "}
        <Tex>{String.raw`r \times \frac{b}{r} = b`}</Tex>. SNAP uses ~24%
        (30% of net income after deductions).
      </Text>

      <Text>
        <strong>Universal:</strong> No means-testing, so zero additional MTR.
        The benefit is financed through general taxation instead of
        program-specific phase-outs.
      </Text>

      <Title order={3}>Capitalization of entry cliffs</Title>

      <Text>
        If eligibility locks in benefits for <Tex>T</Tex> additional periods,
        the entry cliff equals the total benefits at stake:
      </Text>

      <Paper p="lg" withBorder bg="gray.0">
        <Tex display>
          {String.raw`\text{Entry cliff} = b \times (1 + T)`}
        </Tex>
      </Paper>

      <Text>
        Extended eligibility doesn't reduce the conservation integral — it
        capitalizes it. The longer the eligibility window, the larger the stake
        at the entry threshold, and the stronger the disincentive to cross it.
      </Text>
    </Stack>
  );
}
