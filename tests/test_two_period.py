"""Tests for the two-period benefits-cliff model."""

from __future__ import annotations

import numpy as np
import pytest

from benefits_cliffs.two_period import (
    entry_cliff_size,
    two_period_extended,
    two_period_standard,
)

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

THRESHOLD = 30_000.0
BENEFIT = 5_000.0
DISCOUNT = 0.05
EXTENSION = 4  # 4 extra periods (5 total)


def _income_grid(n: int = 200) -> np.ndarray:
    return np.linspace(0, THRESHOLD * 2, n)


# ------------------------------------------------------------------
# Standard-cliff tests
# ------------------------------------------------------------------


class TestStandardCliff:
    """Standard (no extension) cliff equals one period of b."""

    def test_cliff_size_equals_benefit(self) -> None:
        below = THRESHOLD - 1.0
        above = THRESHOLD + 1.0
        res_below = two_period_standard(below, THRESHOLD, BENEFIT, DISCOUNT)
        res_above = two_period_standard(above, THRESHOLD, BENEFIT, DISCOUNT)
        # NPV drop at cliff == b * (1 + 1/(1+r))
        expected_npv = BENEFIT * (1.0 + 1.0 / (1.0 + DISCOUNT))
        actual_drop = float(res_below["npv"] - res_above["npv"])
        assert actual_drop == pytest.approx(expected_npv, rel=1e-8)

    def test_below_threshold_gets_benefit(self) -> None:
        res = two_period_standard(THRESHOLD - 1, THRESHOLD, BENEFIT, DISCOUNT)
        assert float(res["period_1_benefit"]) == BENEFIT
        assert float(res["period_2_benefit"]) == BENEFIT

    def test_above_threshold_gets_nothing(self) -> None:
        res = two_period_standard(THRESHOLD + 1, THRESHOLD, BENEFIT, DISCOUNT)
        assert float(res["period_1_benefit"]) == 0.0
        assert float(res["period_2_benefit"]) == 0.0


# ------------------------------------------------------------------
# Extended-cliff tests
# ------------------------------------------------------------------


class TestExtendedCliff:
    """Extended eligibility capitalises cliff into entry."""

    def test_entry_cliff_equals_b_times_T(self) -> None:
        """Entry cliff = b * (1 + T) with zero discount."""
        cliff = entry_cliff_size(BENEFIT, EXTENSION, discount_rate=0.0)
        total = BENEFIT * (1 + EXTENSION)
        assert cliff == pytest.approx(total)

    def test_entry_cliff_discounted(self) -> None:
        cliff = entry_cliff_size(BENEFIT, EXTENSION, DISCOUNT)
        total_periods = 1 + EXTENSION
        expected = sum(
            BENEFIT / (1.0 + DISCOUNT) ** t for t in range(total_periods)
        )
        assert cliff == pytest.approx(expected, rel=1e-10)

    def test_npv_conservation(self) -> None:
        """Eligible set is identical under both rules."""
        incomes = _income_grid()
        std = two_period_standard(incomes, THRESHOLD, BENEFIT, DISCOUNT)
        ext = two_period_extended(
            incomes, THRESHOLD, BENEFIT, EXTENSION, DISCOUNT
        )
        eligible = incomes <= THRESHOLD
        np.testing.assert_array_equal(std["period_1_benefit"] > 0, eligible)
        np.testing.assert_array_equal(ext["period_1_benefit"] > 0, eligible)

    def test_extended_npv_greater_than_standard(self) -> None:
        """More periods => higher NPV for eligible HH."""
        income = THRESHOLD - 1.0
        std = two_period_standard(income, THRESHOLD, BENEFIT, DISCOUNT)
        ext = two_period_extended(
            income, THRESHOLD, BENEFIT, EXTENSION, DISCOUNT
        )
        assert float(ext["npv"]) > float(std["npv"])

    def test_ineligible_gets_nothing(self) -> None:
        res = two_period_extended(
            THRESHOLD + 1,
            THRESHOLD,
            BENEFIT,
            EXTENSION,
            DISCOUNT,
        )
        assert float(res["npv"]) == 0.0


# ------------------------------------------------------------------
# Edge cases
# ------------------------------------------------------------------


class TestEdgeCases:
    def test_zero_income(self) -> None:
        res = two_period_standard(0.0, THRESHOLD, BENEFIT, DISCOUNT)
        assert float(res["period_1_benefit"]) == BENEFIT

    def test_at_threshold(self) -> None:
        """Income exactly at threshold is still eligible."""
        res = two_period_standard(THRESHOLD, THRESHOLD, BENEFIT, DISCOUNT)
        assert float(res["period_1_benefit"]) == BENEFIT

    def test_extension_one_period(self) -> None:
        cliff = entry_cliff_size(BENEFIT, 1, discount_rate=0.0)
        assert cliff == pytest.approx(BENEFIT * 2)

    def test_vectorised_input(self) -> None:
        incomes = np.array([0.0, THRESHOLD, THRESHOLD + 1])
        res = two_period_standard(incomes, THRESHOLD, BENEFIT, DISCOUNT)
        assert res["period_1_benefit"].shape == (3,)
        assert float(res["period_1_benefit"][2]) == 0.0
