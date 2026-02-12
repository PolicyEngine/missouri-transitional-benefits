"""Tests for analytical measures.

Key mathematical properties verified here:

1. Conservation: integral of MTR over the income range
   equals the total benefit amount.
2. Phase-out MTR equals the phase-out rate inside the
   phase-out region and zero outside.
3. Universal benefit MTR is zero everywhere.
4. Cliff gap equals the benefit amount at the cliff point.
5. ``is_on_cliff`` is True iff MTR > 1.
"""

import numpy as np
import numpy.testing as npt
import pytest

from benefits_cliffs.designs import (
    cliff_benefit,
    phaseout_benefit,
    universal_benefit,
)
from benefits_cliffs.measures import (
    cliff_gap,
    conservation_integral,
    is_on_cliff,
    mtr,
    participation_tax_rate,
)

# ------------------------------------------------------------------
# Shared fixtures
# ------------------------------------------------------------------

STEP = 10  # finer grid for numerical accuracy
INCOME = np.arange(0, 100_001, STEP, dtype=float)
THRESHOLD = 30_000.0
BENEFIT = 5_000.0
PHASE_OUT_RATE = 0.5


def _cliff_func(income):
    return cliff_benefit(income, THRESHOLD, BENEFIT)


def _phaseout_func(income):
    return phaseout_benefit(income, THRESHOLD, BENEFIT, PHASE_OUT_RATE)


def _universal_func(income):
    return universal_benefit(income, BENEFIT)


# ------------------------------------------------------------------
# mtr tests
# ------------------------------------------------------------------


class TestMTR:
    """Marginal tax rate = numerical derivative of benefit
    withdrawal with respect to income."""

    def test_phaseout_mtr_in_region(self):
        """In the phase-out region the MTR equals the rate."""
        rates = mtr(INCOME, _phaseout_func)
        phaseout_end = THRESHOLD + BENEFIT / PHASE_OUT_RATE
        # Interior points of the phase-out region
        mask = (INCOME > THRESHOLD + STEP) & (INCOME < phaseout_end - STEP)
        npt.assert_array_almost_equal(
            rates[mask],
            PHASE_OUT_RATE,
            decimal=2,
        )

    def test_phaseout_mtr_outside_region(self):
        """Outside the phase-out region the MTR is zero."""
        rates = mtr(INCOME, _phaseout_func)
        phaseout_end = THRESHOLD + BENEFIT / PHASE_OUT_RATE
        mask_below = INCOME < THRESHOLD - STEP
        mask_above = INCOME > phaseout_end + STEP
        npt.assert_array_almost_equal(rates[mask_below], 0.0, decimal=2)
        npt.assert_array_almost_equal(rates[mask_above], 0.0, decimal=2)

    def test_universal_mtr_zero(self):
        """Universal benefit never withdraws: MTR = 0."""
        rates = mtr(INCOME, _universal_func)
        npt.assert_array_almost_equal(rates, 0.0, decimal=5)

    def test_cliff_mtr_contains_spike(self):
        """A cliff design produces at least one MTR > 1."""
        rates = mtr(INCOME, _cliff_func)
        assert np.any(rates > 1.0)


# ------------------------------------------------------------------
# cliff_gap tests
# ------------------------------------------------------------------


class TestCliffGap:
    """cliff_gap measures the discrete income loss at cliff
    points."""

    def test_cliff_gap_equals_benefit(self):
        """For a standard cliff the gap equals the benefit."""
        gaps = cliff_gap(INCOME, _cliff_func)
        assert np.max(gaps) == pytest.approx(BENEFIT, rel=0.01)

    def test_phaseout_no_large_gap(self):
        """A phase-out design has no large discrete jumps."""
        gaps = cliff_gap(INCOME, _phaseout_func)
        # Allow small numerical noise but nothing close to b
        assert np.max(gaps) < BENEFIT * 0.1

    def test_universal_no_gap(self):
        """Universal benefit has zero gap everywhere."""
        gaps = cliff_gap(INCOME, _universal_func)
        npt.assert_array_almost_equal(gaps, 0.0)


# ------------------------------------------------------------------
# conservation_integral tests
# ------------------------------------------------------------------


class TestConservationIntegral:
    """The integral of MTR over the full income range should
    equal the total benefit amount for designs that withdraw
    the full benefit."""

    def test_cliff_conservation(self):
        ci = conservation_integral(INCOME, _cliff_func)
        assert ci == pytest.approx(BENEFIT, rel=0.05)

    def test_phaseout_conservation(self):
        ci = conservation_integral(INCOME, _phaseout_func)
        assert ci == pytest.approx(BENEFIT, rel=0.05)

    def test_universal_conservation_zero(self):
        """Universal benefit is never withdrawn so integral
        is zero."""
        ci = conservation_integral(INCOME, _universal_func)
        assert ci == pytest.approx(0.0, abs=1.0)


# ------------------------------------------------------------------
# is_on_cliff tests
# ------------------------------------------------------------------


class TestIsOnCliff:
    """is_on_cliff(mtr_value) <=> MTR > 1."""

    def test_scalar_above(self):
        assert is_on_cliff(1.5) is True

    def test_scalar_below(self):
        assert is_on_cliff(0.5) is False

    def test_scalar_at_one(self):
        assert is_on_cliff(1.0) is False

    def test_array(self):
        vals = np.array([0.0, 0.5, 1.0, 1.01, 5.0])
        result = is_on_cliff(vals)
        expected = np.array([False, False, False, True, True])
        npt.assert_array_equal(result, expected)

    def test_cliff_design_has_cliff_points(self):
        rates = mtr(INCOME, _cliff_func)
        assert np.any(is_on_cliff(rates))

    def test_phaseout_no_cliff_points(self):
        rates = mtr(INCOME, _phaseout_func)
        assert not np.any(is_on_cliff(rates))


# ------------------------------------------------------------------
# participation_tax_rate tests
# ------------------------------------------------------------------


class TestParticipationTaxRate:
    """PTR = fraction of earnings lost to benefit withdrawal
    when moving from zero income to the given income."""

    def test_zero_income(self):
        ptr = participation_tax_rate(0.0, _cliff_func)
        assert ptr == pytest.approx(0.0, abs=1e-10)

    def test_above_cliff(self):
        """Above the cliff the person lost the full benefit
        relative to zero earnings."""
        ptr = participation_tax_rate(50_000.0, _cliff_func)
        expected = BENEFIT / 50_000.0
        assert ptr == pytest.approx(expected, rel=0.01)

    def test_universal_ptr_zero(self):
        """Universal benefit is never lost: PTR = 0."""
        ptr = participation_tax_rate(50_000.0, _universal_func)
        assert ptr == pytest.approx(0.0, abs=1e-10)
