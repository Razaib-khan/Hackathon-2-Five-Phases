#!/bin/bash

# Validation script for GitHub Actions workflows
echo "Validating GitHub Actions workflows..."

# Check if required workflow files exist
WORKFLOW_FILES=(
    ".github/workflows/deploy-frontend.yml"
    ".github/workflows/deploy-backend-hf.yml"
    ".github/workflows/ci-tests.yml"
)

echo "Checking workflow files..."
for file in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

# Check if .github directory exists
if [ -d ".github" ]; then
    echo "✓ .github directory exists"
else
    echo "✗ .github directory missing"
    exit 1
fi

# Count workflow files
WORKFLOW_COUNT=$(ls .github/workflows/*.yml 2>/dev/null | wc -l)
if [ "$WORKFLOW_COUNT" -ge 3 ]; then
    echo "✓ Found $WORKFLOW_COUNT workflow files"
else
    echo "✗ Expected at least 3 workflow files, found $WORKFLOW_COUNT"
    exit 1
fi

echo "All validations passed! 🚀"