import { MantineProvider, Container, Title, Tabs, Space } from "@mantine/core";
import theme from "./theme";
import TheProblem from "./components/TheProblem";
import TheReform from "./components/TheReform";
import TheMath from "./components/TheMath";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container size="lg" py="xl">
        <Title order={1} mb="lg">
          How Missouri's Transitional Benefits Program reshapes cliffs
        </Title>

        <Tabs defaultValue="current" color="teal">
          <Tabs.List>
            <Tabs.Tab value="current">Current law</Tabs.Tab>
            <Tabs.Tab value="reform">The reform</Tabs.Tab>
            <Tabs.Tab value="math">The math</Tabs.Tab>
          </Tabs.List>

          <Space h="md" />

          <Tabs.Panel value="current">
            <TheProblem />
          </Tabs.Panel>

          <Tabs.Panel value="reform">
            <TheReform />
          </Tabs.Panel>

          <Tabs.Panel value="math">
            <TheMath />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </MantineProvider>
  );
}
