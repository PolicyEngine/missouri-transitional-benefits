"use client";

import { Container, Title, Tabs, Space } from "@mantine/core";
import TheProblem from "./TheProblem";
import TheReform from "./TheReform";
import TheMath from "./TheMath";

export default function App() {
  return (
    <Container component="main" size="lg" py="xl" role="main">
      <header>
        <Title order={1} mb="lg">
          How Missouri&apos;s Transitional Benefits Program reshapes cliffs
        </Title>
      </header>

      <Tabs defaultValue="current" color="teal">
        <Tabs.List aria-label="Analysis sections">
          <Tabs.Tab value="current">Current law</Tabs.Tab>
          <Tabs.Tab value="reform">The reform</Tabs.Tab>
          <Tabs.Tab value="math">The math</Tabs.Tab>
        </Tabs.List>

        <Space h="md" />

        <Tabs.Panel value="current">
          <section aria-label="Current SNAP benefit structure">
            <TheProblem />
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="reform">
          <section aria-label="Reform analysis">
            <TheReform />
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="math">
          <section aria-label="Mathematical framework">
            <TheMath />
          </section>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
