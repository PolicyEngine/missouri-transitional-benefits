"""Tests for benefit design functions.

Each design function takes income (scalar or array) plus
parameters and returns a dict with ``net_income`` and ``benefit``.
"""

import numpy as np
import numpy.testing as npt
import pytest

from benefits_cliffs.designs import (
    cliff_benefit,
    extended_eligibility_benefit,
    phaseout_benefit,
    universal_benefit,
)

# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

INCOME = np.arange(0, 100_001, 100, dtype=float)
THRESHOLD = 30_000.0
BENEFIT = 5_000.0
PHASE_OUT_RATE = 0.5


# ------------------------------------------------------------------
# cliff_benefit
# ------------------------------------------------------------------


class TestCliffBenefit:
    """Cliff design: full benefit below threshold, zero above."""

    def test_returns_dict_keys(self):
        out = cliff_benefit(INCOME, THRESHOLD, BENEFIT)
        assert "net_income" in out
        assert "benefit" in out

    def test_benefit_below_threshold(self):
        out = cliff_benefit(10_000.0, THRESHOLD, BENEFIT)
        assert out["benefit"] == BENEFIT

    def test_benefit_above_threshold(self):
        out = cliff_benefit(40_000.0, THRESHOLD, BENEFIT)
        assert out["benefit"] == 0.0

    def test_benefit_at_threshold(self):
        out = cliff_benefit(THRESHOLD, THRESHOLD, BENEFIT)
        assert out["benefit"] == 0.0

    def test_net_income_identity(self):
        """net_income == income + benefit everywhere."""
        out = cliff_benefit(INCOME, THRESHOLD, BENEFIT)
        npt.assert_array_equal(out["net_income"], INCOME + out["benefit"])

    def test_vectorised(self):
        out = cliff_benefit(INCOME, THRESHOLD, BENEFIT)
        assert isinstance(out["benefit"], np.ndarray)
        assert out["benefit"].shape == INCOME.shape


# ------------------------------------------------------------------
# phaseout_benefit
# ------------------------------------------------------------------


class TestPhaseoutBenefit:
    """Phase-out: benefit tapers linearly after threshold."""

    def test_full_benefit_below_threshold(self):
        out = phaseout_benefit(10_000.0, THRESHOLD, BENEFIT, PHASE_OUT_RATE)
        assert out["benefit"] == BENEFIT

    def test_zero_after_full_phaseout(self):
        # Phase-out ends at threshold + benefit / rate
        end = THRESHOLD + BENEFIT / PHASE_OUT_RATE
        out = phaseout_benefit(
            end + 1_000.0, THRESHOLD, BENEFIT, PHASE_OUT_RATE
        )
        assert out["benefit"] == 0.0

    def test_partial_phaseout(self):
        excess = 2_000.0
        inc = THRESHOLD + excess
        out = phaseout_benefit(inc, THRESHOLD, BENEFIT, PHASE_OUT_RATE)
        expected = BENEFIT - PHASE_OUT_RATE * excess
        assert out["benefit"] == pytest.approx(expected)

    def test_benefit_never_negative(self):
        out = phaseout_benefit(INCOME, THRESHOLD, BENEFIT, PHASE_OUT_RATE)
        assert np.all(out["benefit"] >= 0.0)

    def test_net_income_identity(self):
        out = phaseout_benefit(INCOME, THRESHOLD, BENEFIT, PHASE_OUT_RATE)
        npt.assert_array_almost_equal(
            out["net_income"], INCOME + out["benefit"]
        )

    def test_continuous(self):
        """Benefit should be continuous (no jumps)."""
        fine = np.arange(0, 100_001, 1, dtype=float)
        out = phaseout_benefit(fine, THRESHOLD, BENEFIT, PHASE_OUT_RATE)
        diffs = np.diff(out["benefit"])
        # Maximum change per $1 is the phase-out rate
        assert np.all(np.abs(diffs) <= PHASE_OUT_RATE + 1e-10)


# ------------------------------------------------------------------
# universal_benefit
# ------------------------------------------------------------------


class TestUniversalBenefit:
    """Universal: flat benefit regardless of income."""

    def test_constant_benefit(self):
        out = universal_benefit(INCOME, BENEFIT)
        npt.assert_array_equal(
            out["benefit"],
            np.full_like(INCOME, BENEFIT),
        )

    def test_net_income(self):
        out = universal_benefit(INCOME, BENEFIT)
        npt.assert_array_equal(out["net_income"], INCOME + BENEFIT)

    def test_scalar(self):
        out = universal_benefit(50_000.0, BENEFIT)
        assert out["benefit"] == BENEFIT


# ------------------------------------------------------------------
# extended_eligibility_benefit
# ------------------------------------------------------------------


class TestExtendedEligibilityBenefit:
    """Extended eligibility: keeps benefits for extra income
    range after exceeding the threshold.
    """

    def test_full_benefit_below_threshold(self):
        out = extended_eligibility_benefit(
            10_000.0, THRESHOLD, BENEFIT, 5_000.0
        )
        assert out["benefit"] == BENEFIT

    def test_full_benefit_in_extension(self):
        out = extended_eligibility_benefit(
            THRESHOLD + 2_000.0,
            THRESHOLD,
            BENEFIT,
            5_000.0,
        )
        assert out["benefit"] == BENEFIT

    def test_zero_after_extension(self):
        out = extended_eligibility_benefit(
            THRESHOLD + 10_000.0,
            THRESHOLD,
            BENEFIT,
            5_000.0,
        )
        assert out["benefit"] == 0.0

    def test_cliff_at_extension_end(self):
        """The cliff moves to threshold + extension."""
        ext = 5_000.0
        new_thresh = THRESHOLD + ext
        just_below = new_thresh - 1.0
        just_above = new_thresh
        b_below = extended_eligibility_benefit(
            just_below, THRESHOLD, BENEFIT, ext
        )["benefit"]
        b_above = extended_eligibility_benefit(
            just_above, THRESHOLD, BENEFIT, ext
        )["benefit"]
        assert b_below == BENEFIT
        assert b_above == 0.0

    def test_net_income_identity(self):
        out = extended_eligibility_benefit(INCOME, THRESHOLD, BENEFIT, 5_000.0)
        npt.assert_array_almost_equal(
            out["net_income"], INCOME + out["benefit"]
        )
