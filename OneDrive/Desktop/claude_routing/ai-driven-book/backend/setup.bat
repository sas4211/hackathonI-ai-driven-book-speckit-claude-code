@echo off
echo Setting up Python environment for AI Interactive Book Backend...

:: Check Python version
python --version 2>nul
if %errorlevel% neq 0 (
    echo Error: Python not found. Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

:: Create virtual environment
echo Creating virtual environment...
python -m venv venv

:: Activate virtual environment
call venv\Scripts\activate

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

:: Create .env file from example if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy ".env.example" ".env"
    echo Please edit .env file with your actual API keys and configuration
)

:: Create necessary directories
echo Creating data directories...
if not exist "data" mkdir data
if not exist "data\books" mkdir data\books
if not exist "data\embeddings" mkdir data\embeddings
if not exist "data\logs" mkdir data\logs

echo Setup complete! To activate the environment:
echo Run: venv\Scripts\activate