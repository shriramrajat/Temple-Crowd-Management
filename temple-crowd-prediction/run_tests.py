#!/usr/bin/env python3
"""
Test runner for the temple crowd prediction system.

This script runs all integration and performance tests, providing
comprehensive validation of the system functionality and performance.
"""

import sys
import subprocess
import argparse
from pathlib import Path


def run_integration_tests(verbose: bool = False) -> bool:
    """Run integration tests."""
    print("Running integration tests...")
    
    cmd = [
        sys.executable, "-m", "pytest", 
        "tests/test_integration.py",
        "-v" if verbose else "-q",
        "--tb=short"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running integration tests: {e}")
        return False


def run_performance_tests(verbose: bool = False) -> bool:
    """Run performance tests."""
    print("Running performance tests...")
    
    cmd = [
        sys.executable, "-m", "pytest", 
        "tests/test_performance.py",
        "-v" if verbose else "-q",
        "-s",  # Show print statements for performance metrics
        "--tb=short"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running performance tests: {e}")
        return False


def run_all_tests(verbose: bool = False) -> bool:
    """Run all tests."""
    print("Running all tests...")
    
    cmd = [
        sys.executable, "-m", "pytest", 
        "tests/",
        "-v" if verbose else "-q",
        "-s",  # Show print statements
        "--tb=short"
    ]
    
    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running tests: {e}")
        return False


def check_dependencies() -> bool:
    """Check if required test dependencies are installed."""
    required_packages = ['pytest', 'psutil']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing required packages: {', '.join(missing_packages)}")
        print("Please install them with: pip install -r requirements.txt")
        return False
    
    return True


def main():
    """Main test runner."""
    parser = argparse.ArgumentParser(description="Run temple crowd prediction tests")
    parser.add_argument(
        "--test-type", 
        choices=["integration", "performance", "all"],
        default="all",
        help="Type of tests to run (default: all)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Run tests based on type
    success = True
    
    if args.test_type == "integration":
        success = run_integration_tests(args.verbose)
    elif args.test_type == "performance":
        success = run_performance_tests(args.verbose)
    elif args.test_type == "all":
        success = run_all_tests(args.verbose)
    
    if success:
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()