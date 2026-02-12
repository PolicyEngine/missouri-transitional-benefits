"""PolicyEngine-US microsimulation integration.

Computes cliff shares and marginal-tax-rate distributions using
the Enhanced CPS via policyengine-us.  All heavy imports are
guarded so the core package works without policyengine-us.
"""

from __future__ import annotations

try:
    from policyengine_us import Microsimulation

    HAS_POLICYENGINE = True
except ImportError:
    Microsimulation = None  # type: ignore[assignment,misc]
    HAS_POLICYENGINE = False

import numpy as np


def _require_policyengine() -> None:
    if not HAS_POLICYENGINE:
        raise ImportError(
            "policyengine-us is required for microsimulation. "
            "Install with: pip install benefits-cliffs[microsim]"
        )


def compute_cliff_share(
    state: str | None = None,
    year: int = 2025,
) -> float:
    """Fraction of tax units facing a benefits cliff.

    A cliff is defined as a marginal tax rate exceeding 100 %,
    meaning the household loses more in benefits than it gains
    in additional earnings.

    Parameters
    ----------
    state
        Two-letter state code to filter to (e.g. ``"CT"``).
        ``None`` means the full national sample.
    year
        Tax year (default 2025).

    Returns
    -------
    float
        Share of tax units with MTR > 100 %.
    """
    _require_policyengine()
    sim = Microsimulation(dataset_year=year)

    mtr = sim.calculate("marginal_tax_rate", period=year).values

    if state is not None:
        state_code = sim.calculate("state_code_str", period=year).values
        mask = state_code == state
        mtr = mtr[mask]

    if len(mtr) == 0:
        return 0.0

    return float((mtr > 1.0).mean())


def compute_mtr_distribution(
    state: str | None = None,
    year: int = 2025,
    bins: list[float] | None = None,
) -> dict:
    """Histogram of marginal tax rates.

    Parameters
    ----------
    state
        Two-letter state code (``None`` = national).
    year
        Tax year (default 2025).
    bins
        Bin edges in percentage points.  Defaults to
        ``[0, 25, 50, 75, 100, 125, 150]``.

    Returns
    -------
    dict
        ``bins`` (edges) and ``counts`` (number of tax units
        in each bin).
    """
    _require_policyengine()
    if bins is None:
        bins = [0, 25, 50, 75, 100, 125, 150]

    sim = Microsimulation(dataset_year=year)

    mtr = sim.calculate("marginal_tax_rate", period=year).values

    if state is not None:
        state_code = sim.calculate("state_code_str", period=year).values
        mask = state_code == state
        mtr = mtr[mask]

    # Convert from decimal to percentage points.
    mtr_pct = mtr * 100.0
    counts, _ = np.histogram(mtr_pct, bins=bins)

    return {
        "bins": bins,
        "counts": counts.tolist(),
    }
