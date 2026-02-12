declare module "react-plotly.js" {
  import { Component } from "react";

  interface PlotParams {
    data: Array<Record<string, unknown>>;
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
    style?: React.CSSProperties;
    className?: string;
  }

  export default class Plot extends Component<PlotParams> {}
}

declare module "plotly.js-dist-min" {
  const Plotly: unknown;
  export default Plotly;
}

declare module "@policyengine/design-system/tokens/colors" {
  export const colors: {
    primary: Record<string, string> & {
      alpha: Record<string, string>;
    };
    secondary: Record<string, string>;
    blue: Record<string, string>;
    success: string;
    warning: string;
    error: string;
    info: string;
    white: string;
    black: string;
    gray: Record<string, string>;
    background: Record<string, string>;
    text: Record<string, string>;
    teal: Record<string, string>;
    border: Record<string, string>;
    shadow: Record<string, string>;
  };
  export const TEAL_PRIMARY: string;
  export const TEAL_ACCENT: string;
  export const SUCCESS_GREEN: string;
  export const WARNING_YELLOW: string;
  export const ERROR_RED: string;
  export const INFO_BLUE: string;
}

declare module "@policyengine/design-system/charts" {
  export const chartColors: {
    primary: string;
    secondary: string;
    baseline: string;
    positive: string;
    negative: string;
    neutral: string;
    series: string[];
  };
  export const chartLayout: Record<string, unknown> & {
    font: Record<string, unknown>;
    xaxis: Record<string, unknown>;
    yaxis: Record<string, unknown>;
    legend: Record<string, unknown>;
  };
  export const chartDimensions: Record<
    string,
    { width: number; height: number }
  >;
  export const chartLogo: Record<string, unknown>;
  export function getChartConfig(dimensions?: string): {
    layout: typeof chartLayout;
    config: Record<string, unknown>;
    style: Record<string, string>;
  };
  export function formatCurrency(value: number): string;
  export function formatPercent(value: number, decimals?: number): string;
}
