import { MantineProvider, Container, Title, Tabs, Space } from "@mantine/core";
import theme from "./theme";
import ConservationLaw from "./components/ConservationLaw";
import MtrComparison from "./components/MtrComparison";
import TwoPeriodModel from "./components/TwoPeriodModel";
import CtResults from "./components/CtResults";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container size="lg" py="xl">
        <Title order={1} mb="lg">
          Benefits Cliffs Analysis
        </Title>

        <Tabs defaultValue="conservation">
          <Tabs.List>
            <Tabs.Tab value="conservation">Conservation Law</Tabs.Tab>
            <Tabs.Tab value="mtr">MTR Comparison</Tabs.Tab>
            <Tabs.Tab value="two-period">Two-Period Model</Tabs.Tab>
            <Tabs.Tab value="ct-results">CT Results</Tabs.Tab>
          </Tabs.List>

          <Space h="md" />

          <Tabs.Panel value="conservation">
            <ConservationLaw />
          </Tabs.Panel>

          <Tabs.Panel value="mtr">
            <MtrComparison />
          </Tabs.Panel>

          <Tabs.Panel value="two-period">
            <TwoPeriodModel />
          </Tabs.Panel>

          <Tabs.Panel value="ct-results">
            <CtResults />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </MantineProvider>
  );
}
