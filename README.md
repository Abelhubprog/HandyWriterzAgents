# HandyWriterz - AI-Powered Academic Writing Assistant

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-green" alt="Status">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue" alt="License">
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Python-3.11+-blue" alt="Python">
</div>

HandyWriterz is a sophisticated AI-powered academic writing platform that combines multi-agent orchestration with a modern chat interface to help users create high-quality academic content including essays, reports, dissertations, and research papers.

## 🎯 Features

### Core Capabilities
- **Multi-Agent AI Workflow**: Orchestrated agents powered by Gemini 2.5 Pro, Claude 4, and OpenAI O3
- **Academic Research**: Deep research using Perplexity, Claude, and O3 APIs for credible sources
- **Citation Management**: Automatic source verification and citation formatting
- **Plagiarism Detection**: Integrated Turnitin API for originality verification
- **Real-time Chat**: Streaming interface with live progress updates
- **File Upload**: Support for PDF, DOCX, MD, and TXT documents
- **Crypto Payments**: Dynamic.xyz integration for USDC payments on Solana/Base
- **Quality Assurance**: Multi-model evaluation and human tutor review

### Academic Excellence
- Support for multiple document types (essays, reports, dissertations, case studies)
- Harvard, APA, MLA, Chicago, and Vancouver citation styles
- Learning outcome mapping and quality reports
- Regional academic standards (UK, US, AU, CA, EU)
- Field-specific expertise across nursing, law, medicine, social work, and more

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + Shadcn/UI components
- **Authentication**: Dynamic.xyz wallet integration
- **Real-time**: Server-Sent Events for streaming updates

### Backend (FastAPI + LangGraph)
- **Framework**: FastAPI with LangGraph agent orchestration
- **Database**: PostgreSQL with pgvector for embeddings
- **Caching**: Redis for pub/sub and session management
- **Storage**: Cloudflare R2 for document storage
- **Queue**: Background jobs for Turnitin processing

### Agent Workflow
1. **UserIntent**: Authentication, file processing, parameter extraction
2. **Planner**: Outline generation and research agenda creation
3. **Search Agents**: Parallel research using Perplexity, O3, and Claude
4. **SourceFilter**: Source verification and credibility scoring
5. **Writer**: Academic content generation with citations
6. **Evaluator**: Multi-model quality assessment
7. **TurnitinLoop**: Plagiarism and AI detection processing
8. **Formatter**: Final document formatting and learning outcome mapping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Docker and Docker Compose
- Required API keys (see Environment Variables)

### One-Command Setup
```bash
git clone <repository-url>
cd handywriterz
cp .env.example .env
# Edit .env with your API keys
./scripts/dev.sh
```

### Manual Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd handywriterz
   pnpm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development servers**:
   ```bash
   docker compose up -d postgres redis  # Start infrastructure
   pnpm dev:backend                     # Start FastAPI backend
   pnpm dev:web                        # Start Next.js frontend
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Environment Variables

### Required API Keys
```bash
# AI Model APIs
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key  
ANTHROPIC_API_KEY=your_claude_key
PERPLEXITY_API_KEY=your_perplexity_key

# Database & Infrastructure
DATABASE_URL=postgresql://handywriterz:password@localhost:5432/handywriterz
REDIS_URL=redis://localhost:6379

# File Storage (Cloudflare R2)
R2_BUCKET_NAME=handywriterz-docs
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret

# Authentication & Payments (Dynamic.xyz)
DYNAMIC_ENV_ID=your_dynamic_env_id
DYNAMIC_PUBLIC_KEY=your_dynamic_public_key

# External Services
TURNITIN_API_KEY=your_turnitin_key
TURNITIN_WEBHOOK_URL=your_turnitin_webhook
```

### Optional Configuration
```bash
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Pricing Configuration
PRICE_PER_PAGE_GBP=12
WORDS_PER_PAGE=275
SUBSCRIPTION_MONTHLY_GBP=20
```

## 🧪 Testing

### Backend Tests
```bash
cd backend && pytest
```

### Frontend Tests  
```bash
cd web && pnpm test
```

### Integration Tests
```bash
pnpm test:e2e
```

## 📦 Deployment

### Production Build
```bash
docker build -t handywriterz .
docker run -p 3000:3000 --env-file .env handywriterz
```

### Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
The application is designed to deploy on:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Fly.io, Railway, or any container platform
- **Database**: Supabase, AWS RDS, or any PostgreSQL provider
- **Storage**: Cloudflare R2, AWS S3, or any S3-compatible storage

## 🏛️ Project Structure

```
handywriterz/
├── web/                      # Next.js frontend
│   ├── app/                  # App router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── chat/page.tsx    # Main chat interface
│   │   ├── pricing/page.tsx # Pricing information
│   │   └── layout.tsx       # Root layout
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   └── ...              # Feature components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── styles/              # Global styles
├── backend/                  # FastAPI + LangGraph backend
│   ├── src/
│   │   ├── agent/           # LangGraph agents
│   │   │   ├── nodes/       # Individual agent nodes
│   │   │   ├── base.py      # Base node classes
│   │   │   ├── handywriterz_graph.py  # Main workflow
│   │   │   └── handywriterz_state.py  # State management
│   │   ├── routes/          # API endpoints
│   │   ├── db/             # Database models
│   │   ├── workers/        # Background tasks
│   │   └── main.py         # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container
├── scripts/                 # Development and deployment scripts
│   ├── dev.sh              # Development setup script
│   └── init_db.sql         # Database initialization
├── docker-compose.yml      # Local development services
├── .env.example            # Environment variables template
└── README.md              # This file
```

## 🔄 Workflow Process

### 1. User Interaction
- User connects wallet via Dynamic.xyz
- Uploads context documents (PDF, DOCX, etc.)
- Sets parameters (word count, field, citation style)
- Submits academic writing prompt

### 2. AI Agent Orchestration
- **UserIntent**: Processes authentication and files
- **Planner**: Creates detailed outline and research agenda
- **Search Agents**: Parallel research across multiple AI providers
- **SourceFilter**: Verifies and scores academic sources
- **Writer**: Generates content with proper citations
- **Evaluator**: Multi-model quality assessment
- **TurnitinLoop**: Plagiarism detection and revision
- **Formatter**: Final formatting and learning outcome mapping

### 3. Quality Assurance
- Multi-model evaluation (Gemini, O3, Claude)
- Automated plagiarism checking via Turnitin
- Optional human tutor review
- Learning outcome assessment and reporting

### 4. Delivery
- Download formatted documents (DOCX, TXT)
- Learning outcomes report with color-coded mapping
- Email delivery with conversation summary

## 🔌 API Reference

### Core Endpoints

#### Start Writing Process
```http
POST /api/write
Content-Type: application/json

{
  "prompt": "Write an essay about sustainable healthcare practices",
  "user_params": {
    "word_count": 2000,
    "field": "health-social-care",
    "writeup_type": "essay",
    "citation_style": "Harvard",
    "region": "UK"
  },
  "auth_token": "dynamic_jwt_token",
  "uploaded_file_urls": ["https://r2.example.com/doc1.pdf"]
}
```

#### Stream Updates
```http
GET /api/stream/{conversation_id}
Accept: text/event-stream
```

#### Upload Files
```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary data]
```

### Webhook Endpoints

#### Dynamic.xyz Payment Webhook
```http
POST /api/webhook/dynamic
```

#### Turnitin Status Webhook
```http
POST /api/webhook/turnitin
```

## 🛡️ Security Considerations

### Authentication
- Wallet-based authentication via Dynamic.xyz
- JWT token validation for API access
- Rate limiting on all endpoints

### Data Protection
- Encrypted file storage in Cloudflare R2
- Secure database connections with SSL
- PII data encryption at rest
- GDPR compliance for EU users

### API Security
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Request timeout limits

## 💰 Pricing Model

### Pay-per-Use
- £12 per page (275 words)
- Automatic calculation based on word count
- USDC payments on Solana/Base networks
- Instant processing after payment confirmation

### Monthly Subscription
- £20 per month for unlimited usage
- Priority processing
- Human expert reviews included
- Advanced analytics and reporting

### Free Trial
- 1000 words maximum
- IP-based limitation
- Full feature access
- No payment required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/Python type safety
- Write tests for new features
- Maintain API documentation
- Follow established code style
- Add proper error handling

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](http://localhost:8000/docs) (development)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [GitHub Issues](https://github.com/your-org/handywriterz/issues)
- [Discord Community](https://discord.gg/handywriterz)
- [Email Support](mailto:support@handywriterz.com)

### Status
- [System Status](https://status.handywriterz.com)
- [API Status](https://status.handywriterz.com/api)

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release with core academic writing features
- Multi-agent AI workflow implementation
- Dynamic.xyz payment integration
- Turnitin plagiarism detection
- Real-time streaming interface

### Roadmap
- [ ] Additional AI model integrations (Anthropic Haiku, Gemini Ultra)
- [ ] Advanced collaboration features
- [ ] Mobile application
- [ ] Integration with academic databases (PubMed, Google Scholar)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

Built with ❤️ for academic excellence by the HandyWriterz team.