# Hinear MCP Server - 배포 가이드

**버전**: 0.2.0
**배포 대상**: NPM Registry

---

## 1. NPM 패키지로 배포

### 1.1 사전 준비

```bash
# 1. 빌드
cd mcp/hinear
pnpm build

# 2. 버전 확인
cat package.json | grep version

# 3. 패키지 내용 확인
pnpm pack --dry-run
```

### 1.2 NPM에 배포

```bash
# NPM 로그인 (처음만)
npm login

# 패키지 배포
npm publish

# 또는 pnpm 사용
pnpm publish
```

### 1.3 사용자 설치 방법

```bash
# 전역 설치 (CLI처럼 사용)
npm install -g @hinear/mcp

# 또는 프로젝트에 로컬 설치
npm install @hinear/mcp
```

---

## 2. 바이너리 배포

### 2.1 빌드 후 바이너리 실행

```bash
# 1. TypeScript → JavaScript 컴파일
pnpm build

# 2. dist/ 폴더 생성 확인
ls dist/

# 3. 바이너리 테스트
node dist/index.js
```

### 2.2 단일 파일 번들 (추천)

**pkg 사용**:

```bash
# pkg 설치
pnpm add -D pkg

# 번들 생성
pnpm pkg src/index.ts -t node18 -o hinear-mcp

# 실행
./hinear-mcp
```

---

## 3. Docker 배포

### 3.1 Dockerfile 생성

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml ./
COPY src/ ./src/

# 의존성 설치
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 빌드
RUN pnpm build

# 실행
CMD ["node", "dist/index.js"]
```

### 3.2 Docker 이미지 빌드 및 실행

```bash
# 이미지 빌드
docker build -t hinear-mcp:0.2.0 .

# 컨테이너 실행
docker run -e SUPABASE_URL=xxx -e SUPABASE_KEY=yyy hinear-mcp:0.2.0
```

---

## 4. 클라이언트 설정 방법

### 4.1 NPM에서 설치 후 Claude Desktop 설정

```bash
# 전역 설치
npm install -g @hinear/mcp

# 또는 로컬 설치
npm install @hinear/mcp
```

**Claude Desktop 설정 (`.mcp.json`)**:

```json
{
  "mcpServers": {
    "hinear": {
      "type": "stdio",
      "command": "hinear-mcp"
    }
  }
}
```

### 4.2 로컬 개발 버전 사용

```bash
# 저장소 클론
git clone https://github.com/choiho/hinear.git

# 의존성 설치
cd hinear/mcp/hinear
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 편집

# 실행
pnpm dev
```

---

## 5. 환경 변수 설정

MCP 서버 실행을 위해 다음 환경 변수가 필요합니다:

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 인증 (둘 중 하나)
HINEAR_MCP_ACCESS_TOKEN=generated_token
HINEAR_MCP_USER_ID=your-user-uuid

# 선택사항
GITHUB_TOKEN=ghp_xxx  # GitHub 통합용
APP_ORIGIN=http://localhost:3000
```

---

## 6. 버전 관리

### 6.1 새 버전 배포

```bash
# 1. 버전 업데이트
npm version patch  # 0.2.0 → 0.2.1
npm version minor   # 0.2.0 → 0.3.0
npm version major   # 0.2.0 → 1.0.0

# 2. 변경사항 커밋
git add .
git commit -m "chore: release v0.2.1"

# 3. 태그 생성
git tag v0.2.1

# 4. 배포
npm publish
```

### 6.2 배포 후 검증

```bash
# 설치 테스트
npm install -g @hinear/mcp@0.2.1

# 버전 확인
hinear-mcp --version  # (bin 스크립트 필요)
```

---

## 7. CI/CD 통합

### 7.1 GitHub Actions 자동 배포

```yaml
name: Release MCP Server

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: cd mcp/hinear && pnpm install --frozen-lockfile

      - name: Build
        run: cd mcp/hinear && pnpm build

      - name: Publish to NPM
        run: cd mcp/hinear && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 8. 사용자 가이드 업데이트

사용자가 설치 후 사용할 수 있도록 README 업데이트:

```markdown
# Installation

## NPM (Recommended)

```bash
npm install -g @hinear/mcp
```

## From Source

```bash
git clone https://github.com/choiho/hinear.git
cd hinear/mcp/hinear
pnpm install
pnpm build
```

## Configuration

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
HINEAR_MCP_ACCESS_TOKEN=xxx  # or HINEAR_MCP_USER_ID
```

## Usage

```bash
# Start server
hinear-mcp

# Or with source
cd mcp/hinear
pnpm dev
```
```

---

## 9. 릴리스 주의사항

### ⚠️ 중요

1. **민감 정보 보호**:
   - `.env.local`은 절대 커밋하지 말 것
   - `.npmignore`와 `.gitignore` 확인

2. **버전 호환성**:
   - Semver 준수 (Major.Minor.Patch)
   - Breaking change시 Major 버전 업

3. **테스트**:
   - 배포 전 `pnpm smoke` 실행
   - `pnpm typecheck` 통과 확인

4. **문서화**:
   - README 최신화
   - CHANGELOG.md 유지

---

## 10. 다음 단계

1. ✅ **NPM 배포 테스트** (로컬에서 먼저 테스트)
2. **GitHub Packages 배포** (Private 패키지)
3. **Docker 이미지 배포** (Docker Hub)
4. **릴리스 자동화** (GitHub Actions)

---

**마지막 업데이트**: 2026-03-26
**현재 버전**: 0.2.0
**다음 버전**: 0.3.0 (개발 중)
