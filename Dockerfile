FROM python:3.11-slim
WORKDIR /app
COPY src/ ./src/
RUN pip install --no-cache-dir 'fastapi>=0.115' 'uvicorn[standard]>=0.32' 'pydantic>=2.9' 'pydantic-settings>=2.5' 'httpx>=0.27' 'aiosqlite>=0.20' 'loguru>=0.7' 'email-validator>=2.0'
ENV PYTHONPATH=/app/src
EXPOSE 8000
CMD ["uvicorn", "firstten.main:app", "--host", "0.0.0.0", "--port", "8000"]
