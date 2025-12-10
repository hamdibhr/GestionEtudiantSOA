FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
# THIS LINE MUST NOT BE COMMENTED OUT
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Use 'python -m' to ensure uvicorn is found, and use Port 5000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]