#!/bin/bash
# Script for Antigravity to test the WhatsApp API connection
# Usage: ./test-message.sh "5511999999999" "Test message from Antigravity"

PHONE=$1
MESSAGE=$2

if [ -z "$PHONE" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: ./test-message.sh <phone_number_with_country_code> <message>"
  exit 1
fi

echo "Sending test message to $PHONE..."

# NOTE FOR THE AGENT: Replace this curl with the actual API specification
curl -X POST "${WHATSAPP_API_URL:-http://localhost:3000/api/send}" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ${WHATSAPP_API_TOKEN:-local_test_token}" \
     -d '{
           "number": "'"$PHONE"'",
           "message": "'"$MESSAGE"'"
         }'

echo -e "\nRequest finished."