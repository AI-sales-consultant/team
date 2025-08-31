# Business Assessment System

A Next.js and FastAPI-based enterprise assessment questionnaire system that provides personalized business recommendations and LLM-driven analysis.

## Features

- **Multi-dimensional Enterprise Assessment**: Comprehensive evaluation across 7 core business modules
- **Intelligent Score Calculation**: Dynamic score adjustment based on weighting rules
- **AI-Driven Recommendations**: Personalized business advice powered by Azure OpenAI
- **Modern UI**: Responsive design with dark/light theme support
- **Real-time Reports**: Dynamic generation of enterprise assessment reports and dashboards
- **Data Persistence**: Local storage of user progress and assessment results

## System Architecture

### Frontend
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Context + useReducer
- **Port**: 3000

### Backend
- **Tech Stack**: FastAPI, Python, Azure OpenAI
- **Database**: Azure Cosmos DB (optional)
- **API Services**: LLM recommendation generation, score calculation
- **Port**: 8000

## Installation and Configuration

### Requirements
- Node.js 18+
- Python 3.8+
- Azure OpenAI service (for LLM recommendations)

### 1. Clone Project
```bash
git clone <repository-url>
cd team
```

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT=your_deployment_name_here

# Cosmos DB Configuration (optional)
COSMOS_ENDPOINT=your_cosmos_endpoint_here
COSMOS_KEY=your_cosmos_key_here

# Server Configuration
PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
```

## Starting Services

### Start Backend
```bash
cd backend
python main.py
```
Backend will start at http://localhost:8000

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will start at http://localhost:3000

## Assessment Modules

The system includes 7 core assessment modules:

1. **Service Offering** - Service provision
2. **Base Camp for Success** - Success foundation (GTM)
3. **Tracking the Climb** - Progress tracking (PM)
4. **Scaling Essentials** - Scaling elements (CE)
5. **Streamlining the Climb** - Process optimization (OP)
6. **Assembling the Team** - Team building (PSC)
7. **Toolbox for Success** - Success toolkit (ST)

## Scoring System

### Score Mapping
- Strongly Disagree: -2
- Disagree: -1
- N/A: 0
- Agree: 1
- Strongly Agree: 2

### Weighting Rules
The system uses the `api/score_rule.csv` file to define weighting rules, dynamically adjusting question weights based on Service Offering responses.

### Classification System
- **Start_Doing** (score < -1): What needs to be started
- **Do_More** (-1 ≤ score ≤ 1): What needs to be done more
- **Keep_Doing** (score > 1): What needs to be continued

## API Interfaces

### Backend APIs

#### POST `/api/llm-advice`
Generate LLM-driven business recommendations

**Request Body**:
```json
{
  "userId": "user@example.com",
  "assessmentData": {
    "serviceOffering": {...},
    "base-camp": {...},
    ...
  }
}
```

**Response**:
```json
{
  "advice": "Detailed recommendations based on assessment results...",
  "timestamp": "2025-08-31T20:42:59.048252"
}
```

#### POST `/api/save-user-report`
Save user assessment report

### Frontend APIs

#### POST `/api/llm-advice`
Frontend proxy API that forwards requests to backend

## Complete Project Structure

```
team/
├── frontend/                    # Frontend application (Next.js 15 + React 19)
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin pages
│   │   │   └── page.tsx
│   │   ├── api/               # API routes
│   │   │   └── llm-advice/
│   │   │       └── route.ts     # LLM advice API proxy
│   │   ├── assessment/        # Assessment pages
│   │   │   └── page.tsx
│   │   ├── dashboard/         # Dashboard pages
│   │   │   └── page.tsx
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Layout component
│   │   └── page.tsx              # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (50 files)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── utils.ts
│   │   ├── assembling-team-questions.tsx    # Team assembly questions
│   │   ├── assessment-flow.tsx              # Assessment flow main component
│   │   ├── assessment-sidebar.tsx           # Assessment sidebar
│   │   ├── base-camp-questions.tsx          # Base camp questions
│   │   ├── business-dashboard.tsx           # Business dashboard
│   │   ├── login-form.tsx                  # Login form
│   │   ├── question-card.tsx               # Question card
│   │   ├── scaling-essentials-questions.tsx # Scaling essentials questions
│   │   ├── service-offering-questions.tsx  # Service offering questions
│   │   ├── streamlining-climb-questions.tsx # Streamlining climb questions
│   │   ├── terms-modal.tsx                 # Terms modal
│   │   ├── theme-provider.tsx              # Theme provider
│   │   ├── theme-switcher.tsx              # Theme switcher
│   │   ├── theme-toggle.tsx                # Theme toggle button
│   │   ├── toaster.tsx                     # Message toast
│   │   ├── toolbox-success-questions.tsx  # Toolbox success questions
│   │   └── tracking-climb-questions.tsx    # Tracking climb questions
│   ├── contexts/             # React Context
│   │   └── assessment-context.tsx # Assessment context
│   ├── data/                 # Data files
│   │   └── scores/
│   │       └── example_scores.json
│   ├── hooks/                # Custom Hooks
│   │   ├── use-mobile.tsx      # Mobile detection hook
│   │   └── use-toast.ts         # Toast hook
│   ├── lib/                  # Utility functions and config
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── pillar-advice.json  # Pillar advice data
│   │   ├── score-calculator.ts # Score calculator
│   │   └── utils.ts             # General utilities
│   ├── public/               # Static resources
│   │   └── images/
│   │       ├── ascent-logo-home.png
│   │       ├── ascent-logo.png
│   │       ├── dashboard-bg.png
│   │       ├── login-bg.png
│   │       ├── questionnaire-bg.png
│   │       ├── register-form.png
│   │       └── request-call-form.png
│   ├── styles/               # Style files
│   │   └── globals.css
│   ├── user-exports/         # User export data
│   │   ├── 953921736@qq.com.json
│   │   ├── user_default.json
│   │   └── yzx953921736@gmail.com.json
│   ├── backup/               # Backup files
│   │   ├── fastapi_backup/   # FastAPI backup
│   │   └── main_backup.py
│   ├── components.json          # Component config
│   ├── next-env.d.ts            # Next.js type definitions
│   ├── next.config.mjs         # Next.js config
│   ├── package.json             # Frontend dependency config
│   ├── postcss.config.mjs      # PostCSS config
│   ├── tailwind.config.ts      # Tailwind config
│   ├── tsconfig.json           # TypeScript config
│   ├── test-api.html           # API test page
│   ├── test-backend.html       # Backend test page
│   ├── test-json-format.html  # JSON format test page
│   ├── README.md               # Frontend documentation
│   └── UI_MODIFICATIONS_LOG.md # UI modification log
│
├── backend/                  # Backend application (FastAPI + Python)
│   ├── api/                  # API modules
│   │   ├── __init__.py
│   │   ├── api.py              # API route definitions
│   │   ├── cosmos_retriever.py # Cosmos DB retriever
│   │   ├── models.py            # Data models (Pydantic)
│   │   ├── prompts.py           # LLM prompt templates
│   │   └── score_rule.csv       # Weighting rules file
│   ├── retrieval/            # Data retrieval module
│   │   ├── answers.jsonl       # Answer data
│   │   ├── cosmos_retriever.py # Cosmos DB retriever
│   │   ├── data_load.py        # Data loader
│   │   ├── prepocess_to_json.py # Data preprocessing
│   │   ├── readme-EN.txt       # Retrieval module documentation
│   │   └── retrieval_test/  # Retrieval tests
│   │       ├── comprehensive_test.py
│   │       ├── error_test.py
│   │       └── TEST_README.txt
│   ├── tests/                # Test files
│   │   ├── conftest.py          # Test configuration
│   │   ├── README.md           # Test documentation
│   │   ├── requirements-test.txt # Test dependencies
│   │   ├── run_tests.py         # Test runner
│   │   ├── test_api_endpoints.py # API endpoint tests
│   │   ├── test_integration.py # Integration tests
│   │   ├── test_llm_advice.py  # LLM advice tests
│   │   └── test_utils.py       # Utility function tests
│   ├── main.py                  # Main application file
│   ├── requirements.txt        # Python dependencies
│   ├── README.md               # Backend documentation
│   └── env.example             # Environment variables example
│
├── api/                      # Shared resources
│   └── score_rule.csv        # Weighting rules file
│
├── test/                     # Project-level tests
│   ├── backend/              # Backend tests
│   │   ├── test_bias_stub.py
│   │   ├── test_integration_llm_advice.py
│   │   ├── test_llm_advice_contract_and_idempotency.py
│   │   ├── test_llm_fallback_and_phase_grouping.py
│   │   ├── test_perf_smoke.py
│   │   ├── test_privacy_redaction.py
│   │   ├── test_routes.py
│   │   ├── test_rules_parsing_edges.py
│   │   ├── test_unit.py
│   │   └── test_weighting_logic_edges.py
│   ├── frontend/             # Frontend tests
│   │   ├── e2e/             # End-to-end tests
│   │   │   ├── assessment-a11y.spec.ts
│   │   │   └── smoke-assessment.spec.ts
│   │   └── unit/            # Unit tests
│   │       ├── button.test.tsx
│   │       └── score-calculator.test.ts
│   ├── conftest.py              # Test configuration
│   ├── lighthouserc.json       # Lighthouse configuration
│   └── package.json             # Test dependencies
│
├── prompt/                   # Prompt documentation
│   ├── 1.4/                 # Version 1.4 prompts
│   │   ├── 1.4.1.md
│   │   ├── 1.4.2.md
│   │   └── 1.4.md
│   ├── 1.5/                 # Version 1.5 prompts
│   │   ├── 1.5.1.md
│   │   ├── 1.5.2.md
│   │   ├── 1.5.3.md
│   │   ├── 1.5.4.md
│   │   ├── 1.5.5.md
│   │   ├── 1.5.6.md
│   │   └── 1.5.7.md
│   ├── v1.1.md                 # Version 1.1
│   ├── v1.2.md                 # Version 1.2
│   └── v1.3.md                 # Version 1.3
│
├── .coveragerc                  # Code coverage configuration
├── .coverage                    # Code coverage data
├── .gitignore                   # Git ignore file
├── coverage.xml                 # Coverage report
├── locustfile.py               # Performance test configuration
├── pytest.ini                  # Pytest configuration
├── requirements.txt             # Project dependencies
├── requirements-dev.txt         # Development dependencies
└── README.md                    # Project main documentation
```

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Performance Tests
```bash
# Use Locust for performance testing
locust -f locustfile.py
```

## Troubleshooting

### Common Issues

1. **Dependency Installation Failure**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **LLM Recommendations Return Empty Content**
   - Check Azure OpenAI environment variable configuration
   - Verify API key and endpoint are correct

3. **Port Conflicts**
   - Check if ports 3000 and 8000 are occupied
   - Use `netstat -ano | findstr :3000` to check

4. **CORS Errors**
   - Ensure backend CORS configuration is correct
   - Check `FRONTEND_ORIGIN` environment variable

5. **Test Failures**
   - Ensure all dependencies are installed
   - Check test environment configuration

## Development Guide

### Adding New Questions
1. Add new questions in the corresponding question components
2. Update score calculation logic in `score-calculator.ts`
3. Update weighting rules in `score_rule.csv`

### Modifying LLM Prompts
Edit prompt templates in `backend/api/prompts.py`

### Customizing Styles
Use Tailwind CSS class names or modify `tailwind.config.ts`

### Adding New API Endpoints
1. Add new routes in `backend/api/`
2. Update data models in `backend/api/models.py`
3. Add corresponding tests

### Data Management
- User data stored in `frontend/user-exports/`
- Weighting rules in `api/score_rule.csv`
- Test data in `backend/retrieval/`

## Deployment

### Development Environment
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && python main.py
```

### Production Environment
```bash
# Frontend build
cd frontend && npm run build && npm start

# Backend deployment
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

## Monitoring and Maintenance

### Log Files
- Frontend logs: Browser developer tools
- Backend logs: Terminal output
- Test logs: `test/` directory

### Performance Monitoring
- Use `locustfile.py` for load testing
- Monitor API response times
- Check memory usage

### Data Backup
- User data: `frontend/user-exports/`
- Configuration data: `api/score_rule.csv`
- Code backup: `frontend/backup/`

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or suggestions, please create an Issue or contact the development team.
