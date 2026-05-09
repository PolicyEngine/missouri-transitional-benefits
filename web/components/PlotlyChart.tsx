"use client";

// react-plotly.js is browser-only (depends on window). This wrapper exists so
// it can be imported via next/dynamic with ssr:false from server-rendered
// trees, while keeping a single import site for the chart component.
import Plot from "react-plotly.js";

export default Plot;
