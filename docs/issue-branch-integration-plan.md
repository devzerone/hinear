# 이슈 기반 브랜치 관리 기능 구현 계획

## 개요

Hinear 프로젝트에 Jira 스타일의 이슈에서 직접 Git 브랜치를 생성하고 관리하는 기능을 구현합니다. 사용자는 이슈 상세 화면에서 버튼 클릭 하나로 브랜치 생성, GitHub Push, Pull Request 생성까지 일련 작업을 완료할 수 있습니다.

## 목표

### 사용자 경험 개선
- 이슈에서 직접 브랜치 생성으로 개발 워크플로우 간소화
- Jira와 Git 브랜치의 자동 연동으로 컨텍스트 전환 최소화
- PR 생성과 이슈 추적의 일관성 확보

### 개발 효율 향상
- 수동 브랜치 생성 과정 자동화
- 이슈 ↔ 브랜치 ↔ PR 연동으로 추적 용이성 향상
- 팀 협업 시 브랜치 관리의 일관성 유지

## 기능 요구사항

### 핵심 기능
1. **이슈 상세 화면에서 브랜치 생성**
   - 이슈 식별자 기반 자동 브랜치명 제안
   - 사용자 정의 브랜치명 입력 지원
   - 생성 버튼 클릭으로 원클 브랜치 생성 및 Push

2. **GitHub API 연동**
   - GitHub 브랜치 자동 생성
   - 원격 저장소에 Push
   - Pull Request 생성 페이지로 자동 이동

3. **이슈-브랜치 연동**
   - 데이터베이스에 이슈-브랜치 매핑 저장
   - 브랜치 상태 추적 (open, merged, closed)
   - 이슈 상세 화면에서 브랜치 정보 표시

4. **GitHub Webhook 처리**
   - PR 생성 시 이슈 자동 연결
   - PR Merge 시 브랜치 상태 업데이트
   - 이슈 상태 자동 전환 (옵션)

### 사용자 인터페이스

#### 브랜치 관리 컴포넌트 위치
```
이슈 상세 화면 (IssueDetailFullPageScreen)
├── 헤더 영역
│   ├── 이슈 제목 & 식별자
│   └── 브랜치 관리 (IssueBranchManager)
│       ├── 브랜치 상태 표시
│       ├── GitHub 링크
│       └── 생성/삭제 버튼
```

#### UI 요소
- **브랜치 없는 상태**:
  - "Create branch" 버튼 표시
  - 클릭 시 브랜치명 입력 모달
  - 자동 완성 제안: `feature/[PROJECT_KEY]-[ISSUE_NUMBER]-[설명]`

- **브랜치 있는 상태**:
  - 브랜치명 표시 (클릭 가능 → GitHub 이동)
  - PR 링크 (있는 경우)
  - 브랜치 상태 뱃지 (open/merged/closed)
  - "Delete branch" 버튼 (local 브랜치인 경우)

### 데이터베이스 설계

#### issue_branches 테이블
```sql
CREATE TABLE issue_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  pr_number INTEGER,
  pr_url TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open, merged, closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(issue_id, branch_name)
);

CREATE INDEX idx_issue_branches_issue_id ON issue_branches(issue_id);
CREATE INDEX idx_issue_branches_project_id ON issue_branches(project_id);
CREATE INDEX idx_issue_branches_branch_name ON issue_branches(branch_name);
```

#### Issue 테이블 변경
```sql
-- 브랜치 정보를 이슈에 저장하는 컬럼 추가 (선택사)
ALTER TABLE issues ADD COLUMN branch_name TEXT;
ALTER TABLE issues ADD COLUMN pr_url TEXT;
```

## 기술 아키텍처

### 계층 구조
```
Presentation Layer
├── IssueBranchManager (UI 컴포넌트)
└── IssueDetailFullPageScreen (기존 컴포넌트)

Application Layer
├── create-branch-action (서버 액션)
├── get-branch-action (조회 액션)
└── delete-branch-action (삭제 액션)

Domain Layer
├── branch-repository (레포지토리 인터페이스)
└── github-api (GitHub API 클라이언트)

Data Layer
└── Supabase (issue_branches 테이블)
```

### 핵심 컴포넌트

#### 1. IssueBranchManager (UI)
```typescript
// 역할: 브랜치 생성/관리 UI 제공
// 위치: src/features/issues/components/issue-branch-manager.tsx
// props: issueId, projectId, existingBranch
// 기능:
//   - 브랜치명 자동 생성 제안
//   - 생성 폼 표시/숨김
//   - 브랜치 상태 및 GitHub 링크 표시
```

#### 2. createBranchAction (서버 액션)
```typescript
// 역할: 브랜치 생성 비즈니스 로직
// 위치: src/features/git/actions/create-branch-action.ts
// 기능:
//   - Git 브랜치 생성
//   - GitHub API로 원격 브랜치 생성
//   - issue_branches 테이블에 기록
//   - 사용자 피드백 제공
```

#### 3. GitHubBranchService
```typescript
// 역할: GitHub API 연동
// 위치: src/features/git/lib/github-branch-service.ts
// 기능:
//   - GitHub 브랜치 생성
//   - Pull Request 생성
//   - 브랜치 삭제
//   - 브랜치 상태 조회
```

#### 4. BranchRepository
```typescript
// 역할: 데이터베이스 조작
// 위치: src/features/git/repositories/supabase-branch-repository.ts
// 기능:
//   - 브랜치 생성/조회/업데이트
//   - 이슈 관련 브랜치 조회
//   - PR 정보 업데이트
```

### GitHub API 연동

#### 사용 GitHub API
- **Create branch**: `POST /repos/{owner}/{repo}/git/refs`
- **Create PR**: `POST /repos/{owner}/{repo}/pulls`
- **Delete branch**: `DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}`
- **List branches**: `GET /repos/{owner}/{repo}/branches`

#### 인증 방식
- GitHub Personal Access Token (PAT)
- 환경 변수: `GITHUB_TOKEN`
- 권한: `repo` (전체 저장소 접근)

### Webhook 처리

#### Webhook 엔드포인트
```
POST /api/github/webhook
```

#### 처리할 이벤트
- **pull_request.opened**: PR 생성 시
- **pull_request.closed**: PR 닫힘 시
- **pull_request.merged**: PR 병합 시

#### 처리 로직
```typescript
if (event === 'pull_request' && action === 'opened') {
  // PR 번호로 이슈 찾기
  const issue = await findIssueByBranch(pr.head.ref)
  if (issue) {
    await updateIssueBranch(issue.id, {
      prNumber: pr.number,
      prUrl: pr.html_url,
      status: 'open'
    })
  }
}

if (event === 'pull_request' && action === 'closed' && pr.merged) {
  // PR 병합됨
  await updateIssueBranchStatus(pr.head.ref, 'merged')
  // 옵션: 이슈 상태 자동 'Done'으로 변경
}
```

## 브랜치 네이밍 규칙

### 자동 생성되는 브랜치명 형식
```
feature/[PROJECT_KEY]-[ISSUE_NUMBER]-[slug]

예시:
feature/WEB-1-add-login
feature/SAS-42-fix-navigation
feature/MOBILE-100-refactor-auth
```

### 네이밍 규칙
1. **소문자**: kebab-case (하이픈 구분)
2. **접두사**: `feature/` (기능 브랜치)
3. **프로젝트 키**: 대문자 (예: WEB, SAS)
4. **이슈 번호**: 숫자
5. **설명**: 짧은 영어 설명 (최대 50자 추천)

### 사용자 수정 가능
- 자동 생성된 브랜치명 편집 가능
- 중복 확인 기능
- 길이 제한 (255자)

## 사용자 시나리오

### 시나리오 1: 새 브랜치 생성 및 PR 생성
```
1. 사용자: 이슈 SAS-42 상세 페이지 접속
2. 시스템: 브랜치 정보 없음 확인
3. 사용자: "Create branch" 버튼 클릭
4. 시스템: 모달창에 브랜치명 입력 필드 표시
   자동 완성 제안: "feature/SAS-42-add-drawer"
5. 사용자: 생성 버튼 클릭
6. 시스템:
   - Git 브랜치 생성
   - GitHub에 push
   - PR 생성 페이지로 새 탭에서 열림
7. 사용자: PR 작성 후 생성
8. 시스템: Webhook으로 PR 정보 DB 저장
```

### 시나리오 2: 기존 브랜치 확인
```
1. 사용자: 이슈 SAS-42 상세 페이지 재접속
2. 시스템: 브랜치 정보 표시
   - 브랜치명: feature/SAS-42-add-drawer
   - 상태: open
   - PR 링크: #123
3. 사용자: "View on GitHub" 클릭 → GitHub 이동
```

### 시나리오 3: PR 병합 후 상태 업데이트
```
1. 개발자: GitHub에서 PR merge
2. GitHub: Webhook 발송
3. Hinear: Webhook 수신
4. 시스템:
   - 브랜치 상태 → 'merged' 변경
   - 이슈 상태 → 'Done' 자동 변경 (옵션)
5. 사용자: 이슈 상세 페이지 재접속 시 업데이트된 상태 확인
```

### 시나리오 4: 브랜치 정리
```
1. PR merged 후
2. 사용자: 이슈 상세 페이지에서 "Delete branch" 클릭
3. 시스템:
   - GitHub 브랜치 삭제
   - 로컬 브랜치 삭제 (옵션)
   - DB에서 브랜치 기록 삭제 또는 상태 유지
```

## 구현 단계

### 1단계: 데이터베이스 및 레포지토리 (Week 1)
- [ ] issue_branches 테이블 마이그레이션 작성
- [ ] BranchRepository 인터페이스 정의
- [ ] SupabaseBranchRepository 구현
- [ ] 기존 이슈 타입에 branch 필드 추가 (선택사)

### 2단계: GitHub API 연동 (Week 1-2)
- [ ] GitHub API 래� 구현
- [ ] Personal Access Token 발급 및 설정
- [ ] GitHubBranchService 구현
- [ ] 브랜치 생성/삭제/조회 함수 구현
- [ ] Pull Request 생성 함수 구현

### 3단계: 서버 액션 개발 (Week 2)
- [ ] createBranchAction 서버 액션 구현
- [ ] getBranchAction 서버 액션 구현
- [ ] deleteBranchAction 서버 액션 구현
- [ ] 입력 유효성 검증
- [ ] 에러 처리 및 사용자 피드백

### 4단계: UI 컴포넌트 개발 (Week 2-3)
- [ ] IssueBranchManager 컴포넌트 구현
- [ ] 브랜치 생성 모달창 UI
- [ ] 브랜치 상태 표시 컴포넌트
- [ ] IssueDetailFullPageScreen에 통합
- [ ] 로딩 상태 및 에러 처리

### 5단계: Webhook 구현 (Week 3)
- [ ] /api/github/webhook 엔드포인트 생성
- [ ] Webhook 시크릿 설정 가이드
- [ ] pull_request 이벤트 처리
- [ ] PR merge 시 이슈 상태 자동 변경 로직
- [ ] 보안 검증 (시크릿 검증)

### 6단계: 테스트 및 배포 (Week 4)
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 스테이징 환경 변수 설정
- [ ] 프로덕션 배포

### 7단계: 문서화 및 가이드 (Week 4)
- [ ] 사용자 매뉴얼 작성
- [ ] 개발자 문서 작성
- [ ] GitHub Webhook 설정 가이드
- [ ] 트러블슈팅 매뉴얼 작성

## 기술 스펥 (Tech Stack)

### 백엔드
- **언어**: TypeScript
- **프레임워크**: Next.js 15 (App Router)
- **DB**: Supabase (PostgreSQL)
- **ORM**: 직접 SQL (Supabase client)

### 프론트엔드
- **언어**: TypeScript
- **프레임워크**: React 19
- **스타일링**: Tailwind CSS v4
- **상태 관리**: React Server Components

### 인프라
- **Git 호스팅**: GitHub
- **CI/CD**: GitHub Actions
- **웹프레임워크**: Vercel (예정)

### 외부 API
- **GitHub REST API**: 브랜치/PR 관리
- **GitHub Webhooks**: 이벤트 수신

## 보안 고려사항

### GitHub Token 관리
- **저장**: 환경 변수로 저장 (`.env.local`)
- **권한**: 최소 필요 권한만 부여 (`repo` 스코프)
- **순환**: 주기적으로 토큰 로테이션
- **접근 제어**: 서버 전용으로 관리

### Webhook 보안
- **시크릿 검증**: GitHub 시크릿으로 서명 검증
- **IP 화이트리스팅**: GitHub IP만 허용 (옵션)
- **페이로드 검증**: 유효한 JSON만 처리
- **속도 제한**: 대용량 요청 방지

### Git 작업 보안
- **경로 검증**: 허용된 경로에서만 git 명령 실행
- **명령 화이트리스트**: 안전한 명령만 실행
- **에러 처리**: Git 실패 시 적절한 에러 메시지
- **롤백 기반**: 브랜치 생성 권한 확인

## 성능 최적화

### 비동기 처리
- 브랜치 생성: 백그라운드 작업으로 처리
- 사용자 피드백: 진행 상태 실시간 표시
- 타이머 표시: 생성 중 로딩 인디케이터

### 캐싱 전략
- GitHub API 응답 캐싱 (짧은 시간 내)
- 브랜치 정보 캐싱
- 이슈별 브랜치 정보 미리 로드

### 데이터베이스 최적화
- 인덱스 활용: issue_id, project_id, branch_name
- 쿼리 최적화: 자주 사용하는 쿼리 작성
- N+1 방지: join 효율화

## 에러 처리

### 사용자 에러 메시지
```typescript
// 브랜치 생성 실패
"브랜치 생성에 실패했습니다. 이미 존재하는 브랜치이거나
권한이 없을 수 있습니다."

// GitHub API 실패
"GitHub와 연결하는 데 문제가 발생했습니다. 잠시 후 다시 시도해주세요."

// 이름 중복
"이미 존재하는 브랜치입니다. 다른 이름을 사용해주세요."
```

### 에러 복구 전략
1. **GitHub API 실패**: 롤백 재시도
2. **Git 작업 실패**: 사용자에게 안내 후 수동 처리 유도
3. **DB 실패**: 트랜잭션 롤백
4. **Webhook 실패**: 재시도 전략 (큐 표)

## 롤백 기반 접근 제어

### 브랜치 생성 권한
- **프로젝트 소유자**: 생성 가능
- **프로젝트 멤버**: 생성 가능
- **외부 사용자**: 생성 불가

### 브랜치 삭제 권한
- **생성자**: 삭제 가능
- **프로젝트 소유자**: 삭제 가능
- **기타**: 삭제 불가

### 접근 제어 구현
```typescript
async function canCreateBranch(userId: string, projectId: string) {
  const member = await getProjectMember(userId, projectId)
  return member && (member.role === 'owner' || member.role === 'member')
}
```

## 확장 가능성

### 향후 추가 가능한 기능
1. **뷰 전략**
   - develop, release 브랜치 지원
   - 환경별로 다른 브랜치 전략

2. **자동화**
   - PR merge 시 브랜치 자동 삭제
   - 이슈 완료 시 관련 브랜치 정리

3. **협업 강화**
   - 팀원별 브랜치 할당
   - 코드 리뷰어어 자동 지정
   - CI/CD 파이프라인 연동

4. **모니터링**
   - 브랜치 생성 이력 추적
   - 개발 속도 분석
   - 병합 시간 측정

## 성공 지표

### 정량적 목표
- 브랜치 생성 시간: 10초 이내
- PR 생성 자동화율: 100%
- Webhook 처리 시간: 5초 이내
- 다운타임: 99.9% 가용성

### 정성적 목표
- 사용자 만족도: 개선
- 개발 경험 간소화
- 협업 효율 향상
- 일관성 유지

## 롤백아웃 (Rollout Plan)

### Phase 1: 개발 (Week 1-2)
- [ ] DB 스키마 및 레포지토리
- [ ] GitHub API 연동
- [ ] 기본 기능 구현

### Phase 2: UI/UX (Week 3-4)
- [ ] UI 컴포넌트 개발
- [ ] 사용자 경험 개선
- [ ] 피드백 메시지 최적화

### Phase 3: 통합 (Week 4)
- [ ] Webhook 구현
- [ ] 전체 테스트
- [� (옵션) 설정 추가

### Phase 4: 배포 및 안정화 (Week 5)
- [ ] 프로덕션 배포
- [ ] 사용자 교육
- [ ] 문서 최종 확정
- [ ] 피드백 수집 및 개선

## 위험 요소 및 완화 전략

### 위험 요소
1. **GitHub API 제한**: Rate limiting (5000 requests/hour)
   - 대응: 캐싱, 재시도 전략

2. **권한 문제**: Token 만료, 권한 부족
   - 대응: Token 갱신, 권한 검증

3. **Git 충돌**: 동시 브랜치 생성
   - 대응: 유니크한 브랜치명, 생성 실패 시 안내

4. **Webhook 누락**: 이벤트 수신 누락
   - 대응: 로그 추적, 모니터링

### 완화 전략
1. **단계적 롤아웃**: Phase별로 점진적 배포
2. **A/B 테스트**: 일부 사용자에게 먼저 적용
3. **피드백 수집**: 사용자 의견 적극 수렴
4. **롤백 계획**: 문제 발생 시 빠른 철수

## 참고 자료

### GitHub 문서
- [GitHub REST API](https://docs.github.com/en/rest)
- [Git References](https://git-scm.com/book/en/v2/Git-Internals/git-references)
- [Webhook Events](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

### Jira 통합
- [Jira Development](https://confluence.atlassian.com/jirakb/jirakb-development-integration)
- [Branch Creation](https://confluence.atlassian.com/jirakb/creating-branches)

### Hinear 프로젝트
- 도메인 용어사전: `/docs/domain-glossary.md`
- 네이밍 컨벤션: `/docs/naming-convention.md`
- 이슈 타입 정의: `/src/features/issues/types.ts`

---

## 다음 단계

이 계획을 검토하고 승인하면 다음 단계로 넘어갈 수 있습니다:

1. **1단계 시작**: 데이터베이스 마이그레이션 작성
2. **기술 스택 검토**: 사용 기술 및 라이브러리 확인
3. **UI/UX 설계**: 와이어프레임 작성
4. **개발 착수**: 구현 단계별 작업 시작

이 기능이 완성되면 Hinear 사용자들은 이슈에서 바로 개발을 시작할 수 있어 훨씬 효율적으로 일할 수 있을 것입니다!
