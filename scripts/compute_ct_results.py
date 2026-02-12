#!/usr/bin/env python
"""Generate Connecticut microsimulation results for the app.

Writes app/src/data/ct_results.json with cliff_share,
mtr_distribution, and sample_size.
"""

from __future__ import annotations

import json
import os

from benefits_cliffs.microsim import (
    compute_cliff_share,
    compute_mtr_distribution,
)

try:
    from policyengine_us import Microsimulation
except ImportError as exc:
    raise SystemExit(
        "policyengine-us is required. "
        "Install with: pip install benefits-cliffs[microsim]"
    ) from exc

STATE = "CT"
YEAR = 2025


def main() -> None:
    cliff_share = compute_cliff_share(state=STATE, year=YEAR)
    mtr_dist = compute_mtr_distribution(state=STATE, year=YEAR)

    # Compute sample size from the simulation.
    sim = Microsimulation(dataset_year=YEAR)
    state_code = sim.calculate("state_code_str", period=YEAR).values
    sample_size = int((state_code == STATE).sum())

    results = {
        "cliff_share": round(cliff_share, 4),
        "mtr_distribution": mtr_dist,
        "sample_size": sample_size,
        "state": STATE,
        "year": YEAR,
    }

    out_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "app",
        "src",
        "data",
    )
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "ct_results.json")

    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
        f.write("\n")

    print(f"Wrote {out_path}")
    print(f"  cliff_share: {cliff_share:.4f}")
    print(f"  sample_size: {sample_size}")


if __name__ == "__main__":
    main()
