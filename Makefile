.PHONY: install test format lint app-dev app-build compute-ct-results

install:
	pip install -e ".[microsim]"
	cd app && npm install

test:
	pytest

test-core:
	pytest -m "not microsim"

format:
	ruff format .
	ruff check --fix .

lint:
	ruff check .

app-dev:
	cd app && npm run dev

app-build:
	cd app && npm run build

compute-ct-results:
	python scripts/compute_ct_results.py
