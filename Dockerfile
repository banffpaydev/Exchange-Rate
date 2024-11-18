# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to leverage Docker caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Set an environment variable (optional for identification or configuration)
ENV WORKER_ROLE=scraper

# Command to run your worker script
CMD ["python", "src/main.py"]
