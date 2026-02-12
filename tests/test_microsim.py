"""Tests for microsimulation integration.

All tests are marked with ``@pytest.mark.microsim`` so they
can be skipped when policyengine-us is not installed::

    pytest -m "not microsim"
"""

from __future__ import annotations

import pytest

try:
    from policyengine_us import Microsimulation  # noqa: F401

    HAS_PE = True
except ImportError:
    HAS_PE = False

from benefits_cliffs.microsim import (
    compute_cliff_share,
    compute_mtr_distribution,
)

pytestmark = pytest.mark.microsim


@pytest.mark.skipif(not HAS_PE, reason="policyengine-us not installed")
class TestCliffShare:
    def test_returns_float(self) -> None:
        result = compute_cliff_share()
        assert isinstance(result, float)

    def test_between_zero_and_one(self) -> None:
        result = compute_cliff_share()
        assert 0.0 <= result <= 1.0

    def test_state_filter(self) -> None:
        result = compute_cliff_share(state="CT")
        assert isinstance(result, float)
        assert 0.0 <= result <= 1.0


@pytest.mark.skipif(not HAS_PE, reason="policyengine-us not installed")
class TestMTRDistribution:
    def test_returns_dict(self) -> None:
        result = compute_mtr_distribution()
        assert isinstance(result, dict)
        assert "bins" in result
        assert "counts" in result

    def test_counts_length(self) -> None:
        result = compute_mtr_distribution()
        n_bins = len(result["bins"]) - 1
        assert len(result["counts"]) == n_bins

    def test_counts_non_negative(self) -> None:
        result = compute_mtr_distribution()
        assert all(c >= 0 for c in result["counts"])

    def test_custom_bins(self) -> None:
        bins = [0, 50, 100, 150]
        result = compute_mtr_distribution(bins=bins)
        assert result["bins"] == bins
        assert len(result["counts"]) == 3


@pytest.mark.skipif(not HAS_PE, reason="policyengine-us not installed")
class TestImportGuard:
    def test_has_policyengine_flag(self) -> None:
        from benefits_cliffs.microsim import (
            HAS_POLICYENGINE,
        )

        assert HAS_POLICYENGINE is True
