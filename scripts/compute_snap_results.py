#!/usr/bin/env python
"""Compute SNAP benefit schedules for Missouri: baseline vs extended.

Generates app/src/data/snap_results.json with real PE-US data
for a single parent with two children in Missouri, comparing:
  - Baseline: standard SNAP rules (130% gross / 100% net FPL)
  - Reform: extended eligibility (300% gross / 200% net FPL)

Demonstrates the conservation of means-testing: extending
eligibility moves the cliff but doesn't eliminate it.

Uses PE-US axes for efficient single-simulation sweeps.
"""

from __future__ import annotations

import json
import os

import numpy as np

try:
    from policyengine_us import Simulation
except ImportError as exc:
    raise SystemExit(
        "policyengine-us is required. "
        "Install with: pip install policyengine-us"
    ) from exc

BASE_YEAR = 2025
STATE = "MO"
N_POINTS = 161  # $0 to $80k in $500 steps
MAX_EARNINGS = 80_000
MAX_EXTENSION = 10  # years 2026-2035

# Base ages (in 2025)
PARENT_AGE = 35
CHILD1_AGE = 8
CHILD2_AGE = 5


def make_situation(year: int) -> dict:
    """Single parent + 2 kids with earnings axis for a given year."""
    yr = str(year)
    offset = year - BASE_YEAR
    return {
        "people": {
            "parent": {
                "age": {yr: PARENT_AGE + offset},
                "employment_income": {yr: 0},
            },
            "child1": {"age": {yr: CHILD1_AGE + offset}},
            "child2": {"age": {yr: CHILD2_AGE + offset}},
        },
        "spm_units": {
            "spm_unit": {
                "members": [
                    "parent",
                    "child1",
                    "child2",
                ],
            },
        },
        "tax_units": {
            "tax_unit": {
                "members": [
                    "parent",
                    "child1",
                    "child2",
                ],
            },
        },
        "families": {
            "family": {
                "members": [
                    "parent",
                    "child1",
                    "child2",
                ],
            },
        },
        "households": {
            "household": {
                "members": [
                    "parent",
                    "child1",
                    "child2",
                ],
                "state_code": {yr: STATE},
            },
        },
        "marital_units": {
            "marital_unit": {
                "members": ["parent"],
            },
        },
        "axes": [
            [
                {
                    "name": "employment_income",
                    "period": yr,
                    "min": 0,
                    "max": MAX_EARNINGS,
                    "count": N_POINTS,
                },
            ],
        ],
    }


def to_list(arr) -> list[float]:
    """Convert array to rounded float list."""
    return [round(float(x), 2) for x in arr]


def compute_mtrs(
    earnings: list[float],
    values: list[float],
) -> list[float]:
    """MTR = 1 - d(value) / d(earnings)."""
    mtrs = [0.0]
    for i in range(1, len(values)):
        d_earn = earnings[i] - earnings[i - 1]
        if d_earn == 0:
            mtrs.append(0.0)
            continue
        d_val = values[i] - values[i - 1]
        mtr = 1.0 - d_val / d_earn
        mtrs.append(round(mtr, 4))
    return mtrs


def main() -> None:
    yr = str(BASE_YEAR)
    situation = make_situation(BASE_YEAR)

    print("Computing baseline SNAP (MO)...")
    baseline = Simulation(situation=situation)

    print("Computing reform SNAP (300%/200% FPL)...")
    reform = Simulation(
        situation=situation,
        reform={
            "gov.usda.snap.income.limit.gross": {
                yr: 3.0,
            },
            "gov.usda.snap.income.limit.net": {
                yr: 2.0,
            },
        },
    )

    # Earnings (person-level, map to spm_unit)
    earnings = to_list(
        baseline.calculate(
            "employment_income", yr,
            map_to="spm_unit",
        )
    )

    # Baseline
    b_snap = to_list(baseline.calculate("snap", yr))
    b_net = to_list(
        baseline.calculate("spm_unit_net_income", yr)
    )
    b_benefits = to_list(
        baseline.calculate("spm_unit_benefits", yr)
    )
    b_taxes = to_list(
        baseline.calculate("spm_unit_taxes", yr)
    )
    b_eitc = to_list(
        baseline.calculate(
            "eitc", yr, map_to="spm_unit"
        )
    )
    b_ctc = to_list(
        baseline.calculate(
            "ctc", yr, map_to="spm_unit"
        )
    )
    b_mtr = compute_mtrs(earnings, b_net)

    # Reform
    r_snap = to_list(reform.calculate("snap", yr))
    r_net = to_list(
        reform.calculate("spm_unit_net_income", yr)
    )
    r_benefits = to_list(
        reform.calculate("spm_unit_benefits", yr)
    )
    r_mtr = compute_mtrs(earnings, r_net)

    # SNAP-only MTRs (for conservation integral)
    b_snap_mtr = compute_mtrs(earnings, [
        earnings[i] + b_snap[i]
        for i in range(len(earnings))
    ])
    r_snap_mtr = compute_mtrs(earnings, [
        earnings[i] + r_snap[i]
        for i in range(len(earnings))
    ])

    # Conservation integrals (trapezoid rule)
    step = earnings[1] - earnings[0]
    b_integral = round(
        sum(m * step for m in b_snap_mtr), 2
    )
    r_integral = round(
        sum(m * step for m in r_snap_mtr), 2
    )

    # Future years SNAP (for capitalization chart)
    future_snap: dict[str, list[float]] = {}
    for future_year in range(
        BASE_YEAR + 1, BASE_YEAR + MAX_EXTENSION + 1
    ):
        fyr = str(future_year)
        print(f"Computing baseline SNAP for {fyr}...")
        future_sit = make_situation(future_year)
        future_sim = Simulation(situation=future_sit)
        future_snap[fyr] = to_list(
            future_sim.calculate("snap", fyr)
        )

    results = {
        "earnings": earnings,
        "baseline": {
            "snap": b_snap,
            "net_income": b_net,
            "benefits": b_benefits,
            "taxes": b_taxes,
            "eitc": b_eitc,
            "ctc": b_ctc,
            "mtr": b_mtr,
            "snap_mtr": b_snap_mtr,
            "snap_integral": b_integral,
        },
        "reform": {
            "snap": r_snap,
            "net_income": r_net,
            "benefits": r_benefits,
            "mtr": r_mtr,
            "snap_mtr": r_snap_mtr,
            "snap_integral": r_integral,
        },
        "future_snap": future_snap,
        "metadata": {
            "state": STATE,
            "year": BASE_YEAR,
            "household": (
                "Single parent (age 35), "
                "2 children (ages 5 and 8)"
            ),
            "n_points": N_POINTS,
            "earnings_step": int(step),
            "source": "PolicyEngine-US microsimulation",
            "baseline_desc": (
                "Current law: 130% FPL gross / "
                "100% FPL net income limits"
            ),
            "reform_desc": (
                "Extended eligibility: 300% FPL gross / "
                "200% FPL net income limits"
            ),
        },
    }

    out_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "app",
        "src",
        "data",
    )
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "snap_results.json")

    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
        f.write("\n")

    print(f"Wrote {out_path}")
    print(f"  Max SNAP: ${max(b_snap):,.0f}")
    print(
        f"  Baseline cliff pts: "
        f"{sum(1 for m in b_mtr if m > 1.0)}"
    )
    print(
        f"  Reform cliff pts: "
        f"{sum(1 for m in r_mtr if m > 1.0)}"
    )
    print(f"  Baseline SNAP integral: ${b_integral:,.0f}")
    print(f"  Reform SNAP integral: ${r_integral:,.0f}")


if __name__ == "__main__":
    main()
