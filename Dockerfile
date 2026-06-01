# Dockerfile for firstten
# Multi-stage build: builder and runtime
FROM python:3.11-slim AS builder

# Install uv for fast package installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy the project files
COPY pyproject.toml .
COPY src/ ./src/

# Install dependencies in the builder stage
RUN uv sync --frozen --no-dev

# Runtime stage
FROM python:3.11-slim AS runtime

# Set working directory
WORKDIR /app

# Copy the installed packages from the builder
COPY --from=builder /app/.venv ./.venv

# Copy the source code
COPY src/ ./src/

# Set the PATH to include the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "firstten.main:app", "--host", "0.0.0.0", "--port", "8000"]