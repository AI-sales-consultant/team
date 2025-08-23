#!/usr/bin/env python3
# run_tests.py - Test runner script

import subprocess
from pathlib import Path


def run_command(command, description):
    """Run command and display results"""
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}")
    print(f"Executing command: {command}")
    print("-" * 60)
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print("Output:")
            print(result.stdout)
        
        if result.stderr:
            print("Errors:")
            print(result.stderr)
        
        print(f"\nExit code: {result.returncode}")
        
        if result.returncode == 0:
            print("✅ Command executed successfully!")
        else:
            print("❌ Command execution failed!")
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error executing command: {e}")
        return False


def main():
    """Main function"""
    print("🧪 FastAPI Test Runner")
    print("=" * 60)
    
    # Get current directory
    current_dir = Path(__file__).parent
    project_root = current_dir.parent
    
    print(f"Project root: {project_root}")
    print(f"Test directory: {current_dir}")
    
    # Check if pytest is installed
    try:
        import importlib.util
        if importlib.util.find_spec("pytest"):
            print("✅ pytest is installed")
        else:
            print("❌ pytest is not installed")
    except ImportError:
        print("❌ pytest is not installed")
    
    # Check test files
    test_files = list(current_dir.glob("test_*.py"))
    print(f"\nFound test files: {len(test_files)}")
    for test_file in test_files:
        print(f"  - {test_file.name}")
    
    # Menu options
    while True:
        print("\n" + "="*60)
        print("Please select test option:")
        print("1. Run all tests")
        print("2. Run utility function tests")
        print("3. Run LLM advice tests")
        print("4. Run API endpoint tests")
        print("5. Run integration tests")
        print("6. Run specific test file")
        print("7. Run test coverage check")
        print("8. Run performance tests")
        print("0. Exit")
        
        choice = input("\nPlease enter your choice (0-8): ").strip()
        
        if choice == "0":
            print("👋 Goodbye!")
            break
        
        elif choice == "1":
            print("\n🔍 Running all tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir} -v",
                "Run all tests"
            )
            if success:
                print("🎉 All tests completed!")
        
        elif choice == "2":
            print("\n🔧 Running utility function tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir}/test_utils.py -v",
                "Run utility function tests"
            )
        
        elif choice == "3":
            print("\n🤖 Running LLM advice tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir}/test_llm_advice.py -v",
                "Run LLM advice tests"
            )
        
        elif choice == "4":
            print("\n🌐 Running API endpoint tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir}/test_api_endpoints.py -v",
                "Run API endpoint tests"
            )
        
        elif choice == "5":
            print("\n🔗 Running integration tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir}/test_integration.py -v",
                "Run integration tests"
            )
        
        elif choice == "6":
            print("\n📁 Running specific test file...")
            test_file = input("Please enter test filename (e.g., test_utils.py): ").strip()
            if test_file and Path(current_dir / test_file).exists():
                success = run_command(
                    f"cd {project_root} && python3 -m pytest {current_dir}/{test_file} -v",
                    f"Run test file: {test_file}"
                )
            else:
                print(f"❌ Test file {test_file} does not exist")
        
        elif choice == "7":
            print("\n📊 Running test coverage check...")
            # Check if coverage is installed
            try:
                import importlib.util
                if importlib.util.find_spec("coverage"):
                    print("✅ coverage is installed")
                else:
                    print("❌ coverage is not installed")
            except ImportError:
                print("❌ coverage is not installed")
            
            success = run_command(
                f"cd {project_root} && coverage run -m python3 -m pytest {current_dir}",
                "Run test coverage check"
            )
            if success:
                run_command(
                    f"cd {project_root} && coverage report",
                    "Generate coverage report"
                )
        
        elif choice == "8":
            print("\n⚡ Running performance tests...")
            success = run_command(
                f"cd {project_root} && python3 -m pytest {current_dir} --durations=10",
                "Run performance tests (show top 10 slowest tests)"
            )
        
        else:
            print("❌ Invalid choice, please enter 0-8")
        
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    main() 