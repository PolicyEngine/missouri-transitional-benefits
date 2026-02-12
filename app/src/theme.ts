import { createTheme, MantineColorsTuple } from "@mantine/core";

// PolicyEngine teal palette from @policyengine/design-system
const teal: MantineColorsTuple = [
  "#E6FFFA",
  "#B2F5EA",
  "#81E6D9",
  "#4FD1C5",
  "#38B2AC",
  "#319795",
  "#2C7A7B",
  "#285E61",
  "#234E52",
  "#1D4044",
];

const theme = createTheme({
  primaryColor: "teal",
  colors: { teal },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

export default theme;
