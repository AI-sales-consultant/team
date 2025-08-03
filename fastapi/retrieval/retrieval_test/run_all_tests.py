"""
Test Runner - Executes all tests at once and generates a comprehensive report.
Suitable for pre-commit validation.
"""

import subprocess
import sys
import time
from datetime import datetime

def run_test_file(test_file, description):
    """Runs a single test file and returns the result."""
    print(f"\n{'='*60}")
    print(f"Executing: {description}")
    print(f"File: {test_file}")
    print(f"{'='*60}")
    
    start_time = time.time()
    
    try:
        # Execute the test file
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=True,
            text=True,
            timeout=300  # 5-minute timeout
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Display output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("Error Output:")
            print(result.stderr)
        
        success = result.returncode == 0
        
        return {
            'file': test_file,
            'description': description,
            'success': success,
            'duration': duration,
            'return_code': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
        
    except subprocess.TimeoutExpired:
        print(f"[FAIL] Test timed out (> 5 minutes)")
        return {
            'file': test_file,
            'description': description,
            'success': False,
            'duration': 300,
            'return_code': -1,
            'stdout': '',
            'stderr': 'Test timed out'
        }
    except Exception as e:
        print(f"[FAIL] An error occurred while running the test: {e}")
        return {
            'file': test_file,
            'description': description,
            'success': False,
            'duration': 0,
            'return_code': -1,
            'stdout': '',
            'stderr': str(e)
        }

def generate_report(results):
    """Generates the test report."""
    print(f"\n{'='*80}")
    print(f"Test Execution Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['success'])
    failed_tests = total_tests - passed_tests
    total_duration = sum(r['duration'] for r in results)
    
    # Overall Statistics
    print(f"\n[STATS] Overall Statistics:")
    print(f"  Total Test Suites: {total_tests}")
    print(f"  Passed: {passed_tests}")
    print(f"  Failed: {failed_tests}")
    print(f"  Success Rate: {(passed_tests/total_tests*100):.1f}%")
    print(f"  Total Duration: {total_duration:.1f}s")
    
    # Detailed Results
    print(f"\n[RESULTS] Detailed Results:")
    for i, result in enumerate(results, 1):
        status = "[OK] Pass" if result['success'] else "[FAIL] Fail"
        print(f"  {i}. {result['description']}")
        print(f"     Status: {status}")
        print(f"     Duration: {result['duration']:.1f}s")
        if not result['success']:
            print(f"     Error: Return code {result['return_code']}")
    
    # Failure Details
    if failed_tests > 0:
        print(f"\n[DETAIL] Failure Details:")
        for result in results:
            if not result['success']:
                print(f"\n  [FAIL] {result['description']} ({result['file']})")
                if result['stderr']:
                    print(f"     Error Message: {result['stderr'][:200]}...")
    
    # Performance Analysis
    print(f"\n[PERF] Performance Analysis:")
    fastest = min(results, key=lambda x: x['duration'])
    slowest = max(results, key=lambda x: x['duration'])
    print(f"  Fastest: {fastest['description']} ({fastest['duration']:.1f}s)")
    print(f"  Slowest: {slowest['description']} ({slowest['duration']:.1f}s)")
    
    # Recommendations
    print(f"\n[TIPS] Recommendations:")
    if failed_tests == 0:
        print(f"  [SUCCESS] All tests passed! Code quality is good and ready for submission.")
    elif failed_tests == 1 and total_tests > 1:
        print(f"  [WARN] 1 test failed. It is recommended to review and re-run.")
    else:
        print(f"  [ERROR] Multiple tests failed. A thorough check of the code and environment configuration is required.")
    
    return passed_tests == total_tests

def main():
    """Main function - runs all tests."""
    print("Azure Cosmos DB Data Retrieval Module - Full Test Suite")
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Define the test files to be executed
    test_files = [
        ('comprehensive_test.py', 'Comprehensive Functionality Test'),
        ('error_test.py', 'Error Scenario Test'),
    ]
    
    results = []
    
    # Run tests one by one
    for test_file, description in test_files:
        result = run_test_file(test_file, description)
        results.append(result)
    
    # Generate report
    all_passed = generate_report(results)
    
    print(f"\n{'='*80}")
    
    # Exit code
    exit_code = 0 if all_passed else 1
    exit(exit_code)

if __name__ == "__main__":
    main()