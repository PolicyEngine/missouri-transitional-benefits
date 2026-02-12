"""Stylised benefit-design functions.

Each function accepts *income* (scalar or numpy array) plus
design parameters, and returns a dict with at least
``net_income`` and ``benefit``.
"""

from __future__ import annotations

import numpy as np


def cliff_benefit(
    income: float | np.ndarray,
    threshold: float,
    benefit_amount: float,
) -> dict:
    """Full benefit below *threshold*, zero at or above.

    Parameters
    ----------
    income
        Gross income (scalar or array).
    threshold
        Income level at which the benefit drops to zero.
    benefit_amount
        Benefit paid when income < threshold.

    Returns
    -------
    dict
        ``net_income``, ``benefit``.
    """
    income = np.asarray(income, dtype=float)
    benefit = np.where(income < threshold, benefit_amount, 0.0)
    return {
        "net_income": income + benefit,
        "benefit": benefit,
    }


def phaseout_benefit(
    income: float | np.ndarray,
    threshold: float,
    benefit_amount: float,
    phase_out_rate: float,
) -> dict:
    """Benefit tapers linearly above *threshold*.

    Parameters
    ----------
    income
        Gross income (scalar or array).
    threshold
        Income at which taper begins.
    benefit_amount
        Maximum benefit (at or below threshold).
    phase_out_rate
        Fraction of each dollar above threshold lost from
        the benefit (e.g. 0.5 means 50 cents per dollar).

    Returns
    -------
    dict
        ``net_income``, ``benefit``.
    """
    income = np.asarray(income, dtype=float)
    excess = np.maximum(income - threshold, 0.0)
    benefit = np.maximum(benefit_amount - phase_out_rate * excess, 0.0)
    return {
        "net_income": income + benefit,
        "benefit": benefit,
    }


def universal_benefit(
    income: float | np.ndarray,
    benefit_amount: float,
) -> dict:
    """Flat benefit paid regardless of income.

    Parameters
    ----------
    income
        Gross income (scalar or array).
    benefit_amount
        Benefit paid at every income level.

    Returns
    -------
    dict
        ``net_income``, ``benefit``.
    """
    income = np.asarray(income, dtype=float)
    benefit = np.full_like(income, benefit_amount)
    return {
        "net_income": income + benefit,
        "benefit": benefit,
    }


def extended_eligibility_benefit(
    income: float | np.ndarray,
    threshold: float,
    benefit_amount: float,
    extension: float,
) -> dict:
    """Cliff benefit with an extended eligibility window.

    The recipient keeps the full benefit until income reaches
    ``threshold + extension``, at which point it drops to
    zero (a shifted cliff).

    Parameters
    ----------
    income
        Gross income (scalar or array).
    threshold
        Original eligibility threshold.
    benefit_amount
        Benefit paid when eligible.
    extension
        Additional income range over which benefit is kept.

    Returns
    -------
    dict
        ``net_income``, ``benefit``.
    """
    return cliff_benefit(income, threshold + extension, benefit_amount)
