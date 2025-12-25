#!/usr/bin/env python3
"""
Test runner script for RAG service tests

This script provides a convenient way to run different test suites
with appropriate configurations and reporting.
"""

import subprocess
import sys
import argparse
from pathlib import Path


def run_command(cmd, description):
    """Run a command and handle output"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'='*60}")

    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {cmd[0]}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Run RAG service tests')
    parser.add_argument('--type', choices=['unit', 'integration', 'accuracy', 'all', 'performance'],
                       default='all', help='Type of tests to run')
    parser.add_argument('--coverage', action='store_true', help='Generate coverage report')
    parser.add_argument('--html', action='store_true', help='Generate HTML coverage report')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--parallel', '-n', type=int, help='Number of parallel workers')

    args = parser.parse_args()

    # Base pytest command
    base_cmd = ['python', '-m', 'pytest']

    if args.verbose:
        base_cmd.append('-v')

    if args.parallel:
        base_cmd.extend(['-n', str(args.parallel)])

    if args.coverage:
        base_cmd.extend(['--cov=src', '--cov-report=term-missing'])

    if args.html:
        base_cmd.extend(['--cov-report=html', '--cov-report=xml'])

    # Determine which tests to run
    if args.type == 'unit':
        test_pattern = 'tests/unit/'
    elif args.type == 'integration':
        test_pattern = 'tests/integration/'
    elif args.type == 'accuracy':
        base_cmd.extend(['-k', 'accuracy'])
        test_pattern = 'tests/'
    elif args.type == 'performance':
        base_cmd.extend(['-k', 'benchmark or performance'])
        test_pattern = 'tests/'
    else:  # all
        test_pattern = 'tests/'

    # Add test pattern
    cmd = base_cmd + [test_pattern]

    # Run the tests
    success = run_command(cmd, f"Running {args.type} tests")

    if success and args.coverage:
        print(f"\n{'='*60}")
        print("Coverage report generated")
        if args.html:
            print("HTML coverage report available at: htmlcov/index.html")
        print(f"{'='*60}")

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())