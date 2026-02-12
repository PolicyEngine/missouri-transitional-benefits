"""Two-period model of benefits cliffs.

Shows how extended eligibility capitalises the cliff into the
initial eligibility determination, making the *entry* cliff
larger rather than smaller.
"""

from __future__ import annotations

import numpy as np


def two_period_standard(
    income: float | np.ndarray,
    threshold: float,
    benefit_amount: float,
    discount_rate: float = 0.05,
) -> dict:
    """Compute benefits under standard (no-extension) rules.

    Parameters
    ----------
    income
        Earned income in each period.
    threshold
        Income threshold above which benefits are lost.
    benefit_amount
        Per-period benefit when eligible.
    discount_rate
        Per-period discount rate (default 0.05).

    Returns
    -------
    dict
        period_1_benefit, period_2_benefit, npv
    """
    income = np.asarray(income, dtype=float)
    eligible = income <= threshold
    benefit = np.where(eligible, benefit_amount, 0.0)
    npv = benefit + benefit / (1.0 + discount_rate)
    return {
        "period_1_benefit": benefit,
        "period_2_benefit": benefit,
        "npv": npv,
    }


def two_period_extended(
    income: float | np.ndarray,
    threshold: float,
    benefit_amount: float,
    extension_periods: int,
    discount_rate: float = 0.05,
) -> dict:
    """Compute benefits with extended eligibility.

    Once a household qualifies in period 1, it keeps the benefit
    for *extension_periods* additional periods even if income
    later exceeds the threshold.  This capitalises the cliff:
    the entry cliff equals the PV of benefit_amount over all
    extension periods.

    Parameters
    ----------
    income
        Earned income (determines period-1 eligibility only).
    threshold
        Income threshold for initial eligibility.
    benefit_amount
        Per-period benefit amount.
    extension_periods
        Number of additional periods the benefit persists
        after initial qualification (>= 1).
    discount_rate
        Per-period discount rate (default 0.05).

    Returns
    -------
    dict
        period_1_benefit, extended_benefits (list), npv
    """
    income = np.asarray(income, dtype=float)
    eligible = income <= threshold
    p1 = np.where(eligible, benefit_amount, 0.0)

    total_periods = 1 + extension_periods
    discount_factors = np.array(
        [1.0 / (1.0 + discount_rate) ** t for t in range(total_periods)]
    )
    npv = np.where(eligible, benefit_amount * discount_factors.sum(), 0.0)

    extended = [
        np.where(eligible, benefit_amount, 0.0)
        for _ in range(extension_periods)
    ]
    return {
        "period_1_benefit": p1,
        "extended_benefits": extended,
        "npv": npv,
    }


def entry_cliff_size(
    benefit_amount: float,
    extension_periods: int,
    discount_rate: float = 0.05,
) -> float:
    """Size of the capitalised entry cliff.

    When a programme extends eligibility for *extension_periods*
    extra periods, the entry cliff equals the present value of
    receiving *benefit_amount* for (1 + extension_periods) total
    periods.

    Parameters
    ----------
    benefit_amount
        Per-period benefit amount.
    extension_periods
        Additional periods of guaranteed eligibility.
    discount_rate
        Per-period discount rate (default 0.05).

    Returns
    -------
    float
        Present value of the entry cliff.
    """
    total_periods = 1 + extension_periods
    discount_factors = np.array(
        [1.0 / (1.0 + discount_rate) ** t for t in range(total_periods)]
    )
    return float(benefit_amount * discount_factors.sum())
