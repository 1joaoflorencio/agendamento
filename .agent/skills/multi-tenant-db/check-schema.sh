#!/bin/bash
# Script for Antigravity to quickly read the Prisma schema

PRISMA_FILE="prisma/schema.prisma"

if [ -f "$PRISMA_FILE" ]; then
  echo "=== Reading Prisma Models ==="
  # Filters to show only model and enum definitions, ignoring comments
  grep -E "^(model|enum) " "$PRISMA_FILE" -A 20 | grep -v "//"
else
  echo "Error: schema.prisma file not found in the project root."
fi