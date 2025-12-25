#!/bin/bash

# Python virtual environment setup script for AI Interactive Book Backend

echo "Setting up Python environment for AI Interactive Book Backend..."

# Check Python version
python_version=$(python3 --version 2>/dev/null || echo "Not found")
if [[ $python_version == *"Not found"* ]]; then
    echo "Error: Python 3 not found. Please install Python 3.11+"
    exit 1
fi
echo "Python version: $python_version"

# Install pyenv if available
if command -v pyenv &> /dev/null; then
    echo "pyenv is available"
    pyenv install 3.11.0 --skip-existing
    pyenv local 3.11.0
else
    echo "pyenv not found, using system Python"
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit .env file with your actual API keys and configuration"
fi

# Create necessary directories
echo "Creating data directories..."
mkdir -p data/{books,embeddings,logs}

# Initialize database
echo "Setting up the database..."
alembic upgrade head

echo "Setup complete! To activate the environment:"
echo "source venv/bin/activate"