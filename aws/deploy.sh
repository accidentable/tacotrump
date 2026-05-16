#!/bin/bash
set -euo pipefail

# ── SweetTACO AWS 배포 스크립트 ──
# 사전 요구사항: AWS CLI, SAM CLI, Node.js, Python 3.12

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
STACK_NAME="${STACK_NAME:-sweet-taco}"
REGION="${AWS_REGION:-ap-northeast-2}"

echo "=== SweetTACO AWS 배포 ==="
echo "Stack: $STACK_NAME | Region: $REGION"
echo ""

# ── 1. 프론트엔드 빌드 ──
echo "[1/4] 프론트엔드 빌드..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run build
echo "  ✓ frontend/dist 빌드 완료"

# ── 2. SAM 빌드 ──
echo "[2/4] SAM 빌드..."
cd "$SCRIPT_DIR"
sam build
echo "  ✓ SAM 빌드 완료"

# ── 3. SAM 배포 ──
echo "[3/4] SAM 배포..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset
echo "  ✓ Lambda + API Gateway 배포 완료"

# ── 4. 프론트엔드 S3 업로드 + CloudFront 무효화 ──
echo "[4/4] 프론트엔드 배포..."

BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

CF_DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

aws s3 sync "$PROJECT_ROOT/frontend/dist" "s3://$BUCKET_NAME" \
  --delete \
  --region "$REGION"

aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*" \
  --region "$REGION" > /dev/null

echo "  ✓ S3 업로드 + CloudFront 캐시 무효화 완료"

# ── 결과 출력 ──
echo ""
echo "=== 배포 완료 ==="

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

CF_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text)

echo "  API:       $API_URL"
echo "  Frontend:  $CF_URL"
echo ""
echo "커스텀 도메인 연결은 Route 53 + ACM 인증서 설정 후"
echo "template.yaml의 CloudFront ViewerCertificate를 수정하세요."
