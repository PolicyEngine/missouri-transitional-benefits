import { describe, it, expect } from "vitest";
import snapResults from "@/data/snap_results.json";

describe("data integrity", () => {
  it("snap_results has required fields", () => {
    expect(snapResults).toHaveProperty("earnings");
    expect(snapResults).toHaveProperty("baseline");
    expect(snapResults).toHaveProperty("reform");
    expect(snapResults).toHaveProperty("future_snap");
    expect(snapResults).toHaveProperty("metadata");
    expect(Array.isArray(snapResults.earnings)).toBe(true);
    expect(snapResults.earnings.length).toBeGreaterThan(0);
  });

  it("baseline arrays align with earnings length", () => {
    const n = snapResults.earnings.length;
    expect(snapResults.baseline.snap.length).toBe(n);
    expect(snapResults.baseline.mtr.length).toBe(n);
    expect(snapResults.baseline.benefits.length).toBe(n);
    expect(snapResults.baseline.net_income.length).toBe(n);
  });

  it("reform arrays align with earnings length", () => {
    const n = snapResults.earnings.length;
    expect(snapResults.reform.snap.length).toBe(n);
    expect(snapResults.reform.snap_mtr.length).toBe(n);
  });

  it("conservation: snap_integral is positive", () => {
    expect(snapResults.baseline.snap_integral).toBeGreaterThan(0);
    expect(snapResults.reform.snap_integral).toBeGreaterThan(0);
  });
});
