"""Analytical measures for benefit designs.

All functions operate on a *benefit_func* callable that
accepts an income value (scalar or array) and returns a dict
with at least ``benefit`` and ``net_income``.
"""

from __future__ import annotations

from typing import Callable

import numpy as np


def mtr(
    income_array: np.ndarray,
    benefit_func: Callable,
) -> np.ndarray:
    """Marginal tax rate from benefit withdrawal.

    Computed as the numerical derivative of the benefit loss
    with respect to income:

        MTR(y) = -dB/dy

    A positive MTR means the benefit is being withdrawn.
    MTR > 1 indicates a cliff (net income falls when gross
    income rises).

    Parameters
    ----------
    income_array
        Sorted array of gross-income values.
    benefit_func
        ``benefit_func(income) -> dict`` with key
        ``"benefit"``.

    Returns
    -------
    np.ndarray
        MTR at each income point (same length as
        *income_array*).
    """
    income_array = np.asarray(income_array, dtype=float)
    benefits = benefit_func(income_array)["benefit"]
    benefits = np.asarray(benefits, dtype=float)

    # Central differences in interior, forward/backward
    # at edges.
    d_benefit = np.gradient(benefits, income_array)
    return -d_benefit


def cliff_gap(
    income_array: np.ndarray,
    benefit_func: Callable,
) -> np.ndarray:
    """Discrete drop in net income at each income step.

    Returns the element-wise decrease in *net_income*
    compared to the previous income level.  Positive values
    indicate a net-income loss (a cliff).

    Parameters
    ----------
    income_array
        Sorted array of gross-income values.
    benefit_func
        ``benefit_func(income) -> dict`` with key
        ``"net_income"``.

    Returns
    -------
    np.ndarray
        Gap at each point (first element is 0).
    """
    income_array = np.asarray(income_array, dtype=float)
    net = benefit_func(income_array)["net_income"]
    net = np.asarray(net, dtype=float)
    diffs = np.diff(net)
    # A "gap" is where net income *decreases* as gross
    # income increases: gap = max(-diff, 0).
    gaps = np.maximum(-diffs, 0.0)
    return np.concatenate([[0.0], gaps])


def conservation_integral(
    income_array: np.ndarray,
    benefit_func: Callable,
) -> float:
    """Integral of MTR over the income range.

    For any design that fully withdraws a benefit of size *b*
    over some income range, this integral should equal *b*.

    Uses the trapezoidal rule.

    Parameters
    ----------
    income_array
        Sorted array of gross-income values.
    benefit_func
        Benefit-design callable.

    Returns
    -------
    float
        Approximate integral of MTR(y) dy.
    """
    rates = mtr(income_array, benefit_func)
    return float(np.trapezoid(rates, income_array))


def is_on_cliff(
    mtr_value: float | np.ndarray,
) -> bool | np.ndarray:
    """True where the marginal tax rate exceeds 1.

    An MTR > 1 means the person loses more than a dollar
    of net income for each additional dollar earned.

    Parameters
    ----------
    mtr_value
        Scalar or array of MTR values.

    Returns
    -------
    bool or np.ndarray
        Boolean indicator(s).
    """
    arr = np.asarray(mtr_value, dtype=float)
    result = arr > 1.0
    # Return a plain bool for scalar input.
    if result.ndim == 0:
        return bool(result)
    return result


def participation_tax_rate(
    income: float,
    benefit_func: Callable,
) -> float:
    """Effective tax rate from benefit withdrawal when
    moving from zero income to *income*.

    PTR = (B(0) - B(y)) / y

    Parameters
    ----------
    income
        Target gross income.
    benefit_func
        Benefit-design callable.

    Returns
    -------
    float
        Participation tax rate (0-1 for typical designs).
    """
    if income == 0.0:
        return 0.0
    b_zero = float(np.asarray(benefit_func(0.0)["benefit"]).item())
    b_income = float(np.asarray(benefit_func(income)["benefit"]).item())
    return (b_zero - b_income) / income
