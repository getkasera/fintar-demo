#!/bin/sh
# Ships demo.fintar.id: builds the arm64 image, pushes it to ECR under the git
# sha, registers a task definition revision with that image and rolls the
# fintar-demo ECS service. Needs AWS credentials for the Fintar/Kasera Pay
# account (e.g. eval "$(aws configure export-credentials --profile pay-admin --format env)").
# ponytail: manual like the Kasera demo's `railway up`; a GitHub workflow with
# its own OIDC role when this ships often enough to matter.
set -eu
export AWS_REGION=ap-southeast-1
CLUSTER=kasera-pay
SERVICE=fintar-demo

cd "$(dirname "$0")/.."
[ -z "$(git status --porcelain)" ] || { echo "commit first: the image tag is the git sha" >&2; exit 1; }
TAG=$(git rev-parse --short=12 HEAD)
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO="$ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/fintar-demo"

aws ecr get-login-password | docker login --username AWS --password-stdin "${REPO%%/*}"
# No provenance/SBOM: ECR rejects Docker Desktop's attestation manifests
# against an immutable tag, leaving a 1.5 KB stub instead of the image.
docker buildx build --platform linux/arm64 --provenance=false --sbom=false -t "$REPO:$TAG" --push .

# Same definition as running, new image.
CUR=$(aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" --query 'services[0].taskDefinition' --output text)
aws ecs describe-task-definition --task-definition "$CUR" --query taskDefinition --output json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); d['containerDefinitions'][0]['image']='$REPO:$TAG'; print(json.dumps({k:d[k] for k in ('family','containerDefinitions','executionRoleArn','networkMode','requiresCompatibilities') if k in d}))" \
  > /tmp/fintar-demo-taskdef.json
NEW=$(aws ecs register-task-definition --cli-input-json file:///tmp/fintar-demo-taskdef.json --query taskDefinition.taskDefinitionArn --output text)
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --task-definition "$NEW" --query service.serviceName --output text
aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE"
echo "live: $NEW ($TAG)"
