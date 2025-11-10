#!/bin/bash

# Test the authentication system locally

echo "Testing Authentication System"
echo "=============================="
echo ""
echo "1. Testing Client ID Login"
echo "---"

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"clientId":"MS3122"}'

echo ""
echo ""
echo "2. Testing OTP Verification"
echo "---"

curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "loginId":"MS3122",
    "otp":"123456",
    "referenceToken":"your_reference_token_here"
  }'

echo ""
echo ""
echo "3. Testing 2FA Verification"
echo "---"

curl -X POST http://localhost:3000/api/auth/verify-twofa \
  -H "Content-Type: application/json" \
  -d '{
    "loginId":"MS3122",
    "pin":"111111",
    "twoFAToken":"your_2fa_token_here",
    "questionId":22
  }'

echo ""
echo "=============================="
echo "Tests completed!"
