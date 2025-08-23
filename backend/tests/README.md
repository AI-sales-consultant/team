# 🧪 FastAPI Test Documentation

## 📁 Test File Structure

```
fastapi/tests/
├── conftest.py              # Test configuration and shared fixtures
├── test_utils.py            # Utility function tests
├── test_llm_advice.py      # LLM advice generation tests
├── test_api_endpoints.py   # API endpoint tests
├── test_integration.py     # Integration tests
├── run_tests.py            # Test runner script
├── requirements-test.txt    # Test dependencies
└── README.md               # This document
```

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
cd fastapi
pip install -r tests/requirements-test.txt
```

### 2. Run All Tests

```bash
# Method 1: Using pytest
pytest tests/ -v

# Method 2: Using test runner script
python tests/run_tests.py
```

## 📋 Test Coverage

### 🔧 **Utility Function Tests** (`test_utils.py`)
- **`load_score_rules()`**: CSV file loading, error handling
- **`check_weighting()`**: Weighting rule checking, multiple scenarios
- **`extract_business_profile()`**: Business profile extraction, smart matching

### 🤖 **LLM Advice Tests** (`test_llm_advice.py`)
- **`generate_advice_for_question()`**: Advice generation, error handling
- **Smart Answer Selection**: `answer` + `additionalText` combination logic
- **API Calls**: Success/failure scenarios, environment variable validation

### 🌐 **API Endpoint Tests** (`test_api_endpoints.py`)
- **Health Check**: `/healthz` endpoint
- **User Report**: `/api/save-user-report` endpoint
- **LLM Advice**: `/api/llm-advice` endpoint
- **CORS Configuration**: Cross-origin request handling
- **Error Handling**: Validation errors, 404, 405, etc.

### 🔗 **Integration Tests** (`test_integration.py`)
- **Complete Workflow**: End-to-end testing from request to response
- **Business Profile Integration**: Business profile passing throughout the workflow
- **Scoring and Categorization**: Weighting rules and categorization logic
- **Concurrent Processing**: Asynchronous LLM calls
- **Error Handling**: Missing files, service unavailability, etc.

## 🎯 Testing Strategy

### **Unit Tests**
- Each function tested independently
- Use mock objects to isolate dependencies
- Cover normal and exceptional cases

### **Integration Tests**
- Test component interactions
- Verify data flow and business logic
- Mock external service calls

### **End-to-End Tests**
- Test complete API request flow
- Verify response format and content
- Check error handling mechanisms

## 🛠️ Testing Tools

### **pytest**
- Main testing framework
- Supports async testing (`pytest-asyncio`)
- Rich assertion and fixture system

### **unittest.mock**
- Mock external dependencies
- Control test environment
- Verify function calls

### **coverage**
- Code coverage checking
- Identify untested code
- Generate coverage reports

## 📊 Running Tests

### **Basic Commands**

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_utils.py -v

# Run specific test class
pytest tests/test_utils.py::TestCheckWeighting -v

# Run specific test method
pytest tests/test_utils.py::TestCheckWeighting::test_check_weighting_single_rule_satisfied -v
```

### **Advanced Options**

```bash
# Show test coverage
pytest tests/ --cov=main --cov-report=html

# Run tests in parallel
pytest tests/ -n auto

# Generate HTML report
pytest tests/ --html=test_report.html

# Run only failed tests
pytest tests/ --lf

# Stop after first failure
pytest tests/ -x
```

## 🔍 Test Data

### **Test Fixtures**
- `sample_service_offering`: Sample service offering data
- `sample_assessment_data`: Sample assessment data
- `sample_score_rules`: Sample score rules
- `mock_openai_client`: Mock OpenAI client
- `mock_cosmos_retriever`: Mock Cosmos retriever

### **Mock Data**
- Use `unittest.mock` to create mock objects
- Isolate external dependencies (API calls, file operations)
- Control test environment consistency

## 🚨 Common Issues

### **1. Import Errors**
```bash
# Ensure running in correct directory
cd fastapi
python -m pytest tests/
```

### **2. Missing Dependencies**
```bash
# Install all test dependencies
pip install -r tests/requirements-test.txt
```

### **3. Async Test Issues**
```bash
# Ensure pytest-asyncio is installed
pip install pytest-asyncio
```

### **4. Coverage Reports**
```bash
# Install coverage
pip install coverage

# Run coverage check
coverage run -m pytest tests/
coverage report
coverage html  # Generate HTML report
```

## 📈 Continuous Integration

### **GitHub Actions**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r fastapi/requirements.txt
          pip install -r fastapi/tests/requirements-test.txt
      - name: Run tests
        run: |
          cd fastapi
          pytest tests/ --cov=main --cov-report=xml
```

## 🎉 Contributing Guidelines

### **Adding New Tests**
1. Add test methods in appropriate test files
2. Use descriptive test names
3. Include tests for normal and exceptional cases
4. Add appropriate assertions and validations

### **Test Naming Conventions**
- Test classes: `Test{ClassName}`
- Test methods: `test_{description}`
- Use clear, descriptive names

### **Test Documentation**
- Each test class and method has docstrings
- Explain test purpose and verification points
- Describe test data meaning

## 📞 Support

If you encounter test issues, please check:
1. Dependencies are correctly installed
2. Running in correct directory
3. Environment variables are properly set
4. Mock objects are correctly configured

---

**Happy Testing! 🧪✨** 