#!/bin/bash

# HandyWriterz Setup Validation Script
set -e

echo "🔍 Validating HandyWriterz Setup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation results
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print results
print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "  ✅ $2"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "  ❌ $2"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
}

echo ""
echo "📁 File Structure Validation"

# Check essential files exist
files=(
    ".env.example"
    "package.json"
    "docker-compose.yml"
    "web/package.json"
    "web/app/layout.tsx"
    "web/app/page.tsx"
    "web/app/chat/page.tsx"
    "backend/requirements.txt"
    "backend/src/main.py"
    "backend/src/agent/handywriterz_graph.py"
    "backend/src/agent/nodes/user_intent.py"
    "backend/src/agent/nodes/planner.py"
    "backend/src/agent/nodes/writer.py"
    "scripts/init_db.sql"
    "scripts/dev.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_check 0 "$file exists"
    else
        print_check 1 "$file missing"
    fi
done

echo ""
echo "🐳 Docker Configuration"

# Check Docker files
docker_files=(
    "backend/Dockerfile"
    "web/Dockerfile"
    "docker-compose.yml"
)

for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        print_check 0 "$file exists"
    else
        print_check 1 "$file missing"
    fi
done

echo ""
echo "📦 Package Dependencies"

# Check if package.json files are valid
if [ -f "package.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        print_check 0 "Root package.json is valid JSON"
    else
        print_check 1 "Root package.json is invalid JSON"
    fi
fi

if [ -f "web/package.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('web/package.json', 'utf8'))" 2>/dev/null; then
        print_check 0 "Web package.json is valid JSON"
    else
        print_check 1 "Web package.json is invalid JSON"
    fi
fi

# Check if requirements.txt exists and is readable
if [ -f "backend/requirements.txt" ]; then
    if [ -r "backend/requirements.txt" ]; then
        print_check 0 "Backend requirements.txt is readable"
    else
        print_check 1 "Backend requirements.txt is not readable"
    fi
fi

echo ""
echo "🔧 Environment Configuration"

# Check if .env.example is properly formatted
if [ -f ".env.example" ]; then
    # Check for required environment variables
    required_vars=(
        "GEMINI_API_KEY"
        "PERPLEXITY_API_KEY"
        "DATABASE_URL"
        "REDIS_URL"
        "DYNAMIC_ENV_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.example; then
            print_check 0 "$var defined in .env.example"
        else
            print_check 1 "$var missing from .env.example"
        fi
    done
fi

echo ""
echo "🏗️ Backend Structure"

# Check backend Python structure
backend_files=(
    "backend/src/__init__.py"
    "backend/src/agent/__init__.py"
    "backend/src/agent/base.py"
    "backend/src/agent/handywriterz_state.py"
    "backend/src/agent/handywriterz_graph.py"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ] || [[ "$file" == *"__init__.py" ]]; then
        if [[ "$file" == *"__init__.py" ]]; then
            # Create empty __init__.py if it doesn't exist
            mkdir -p "$(dirname "$file")" && touch "$file"
        fi
        print_check 0 "$(basename "$file") structure OK"
    else
        print_check 1 "$(basename "$file") missing"
    fi
done

echo ""
echo "🌐 Frontend Structure"

# Check frontend TypeScript structure
frontend_files=(
    "web/tsconfig.json"
    "web/tailwind.config.ts"
    "web/next.config.js"
    "web/app/globals.css"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        print_check 0 "$(basename "$file") exists"
    else
        print_check 1 "$(basename "$file") missing"
    fi
done

echo ""
echo "🛠️ Tool Dependencies"

# Check if required tools are available
tools=(
    "node:Node.js"
    "docker:Docker"
    "git:Git"
)

for tool_spec in "${tools[@]}"; do
    tool=$(echo "$tool_spec" | cut -d: -f1)
    name=$(echo "$tool_spec" | cut -d: -f2)
    
    if command -v "$tool" &> /dev/null; then
        version=$($tool --version 2>/dev/null | head -n1 || echo "unknown")
        print_check 0 "$name available ($version)"
    else
        print_check 1 "$name not found"
    fi
done

# Check for pnpm specifically
if command -v pnpm &> /dev/null; then
    version=$(pnpm --version)
    print_check 0 "pnpm available ($version)"
else
    if command -v npm &> /dev/null; then
        print_check 0 "npm available (pnpm can be installed)"
    else
        print_check 1 "No package manager found"
    fi
fi

echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "✅ Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "❌ Checks failed: ${RED}$CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All validation checks passed!${NC}"
    echo -e "✨ HandyWriterz is ready for development"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.example to .env and add your API keys"
    echo "2. Run ./scripts/dev.sh to start the development environment"
    echo "3. Open http://localhost:3000 in your browser"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some validation checks failed${NC}"
    echo "Please fix the issues above before proceeding"
    exit 1
fi