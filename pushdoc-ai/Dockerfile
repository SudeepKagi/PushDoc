FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv==0.8.22 && uv sync --frozen --no-dev
COPY src ./src

EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "pushdoc_ai.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
