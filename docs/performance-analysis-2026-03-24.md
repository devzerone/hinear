# Hinear 성능 분석 보고서

**날짜:** 2026-03-24
**환경:** 프로덕션 (hinear.vercel.app)
**프로젝트:** hinear.vercel.app

## 요약

> **주의 (2026-03-25 업데이트):**
> 이 문서는 2026-03-24 시점 측정치를 기반으로 한다.
> 이후 대부분의 request path는 세션 인식 Supabase client로 전환되었고, 일부 API/검색/필터 구조도 변경되었다.
> 다만 `loadIssueDetail()`는 현재도 `service-role + 명시적 멤버십 체크` 예외 경로를 사용하므로, 아래 `service-role` 관련 지적은 "완전 해소"가 아니라 "대부분 해소, 일부 예외 잔존"으로 읽는 것이 맞다.

현재 성능은 **응답 크기가 421바이트에 불과함에도 2초 이상의 응답 시간**을 보이고 있습니다. 분석 결과 다음과 같은 여러 가지 아키텍처 문제가 원인으로 밝혀졌습니다:

1. **반복되는 Supabase API 호출** (페이지 로드당 9개 호출)
2. **불필요한 데이터베이스 쓰기 연산** (모든 요청마다 발생)
3. **N+1 쿼리 패턴** (데이터 조회 방식 문제)
4. **중복 API 호출** (React 프리페칭 문제)

## 측정 방법

### 사용 도구
- **Playwright** - 브라우저 네트워크 캡처 및 타이밍 분석
- **Supabase API 로그** - 데이터베이스 쿼리 분석
- **Supabase MCP 서버** - 직접 로그 접근

### 테스트 시나리오
1. 프로젝트 보드 페이지 로딩
2. 이슈 상세 페이지 로딩
3. 페이지 간 네비게이션

## 분석 결과

### 1. 네트워크 성능

| API 엔드포인트 | 응답 시간 | 크기 | 중복 호출 |
|---------------|----------|------|----------|
| `/internal/projects/[projectId]/issues` | 2,150~2,272ms | 421 bytes | 있음 (2회) |

**핵심 문제:** 421바이트 작은 데이터에 2초 이상 응답 시간은 지나치게 느립니다.

### 2. Supabase API 호출 패턴

모든 페이지 로딩마다 **9개의 순차적 Supabase API 호출**이 발생합니다:

```
1. GET  /auth/v1/user                              (인증 확인)
2. POST /rest/v1/profiles?on_conflict=id          (프로필 upsert) ⚠️
3. GET  /rest/v1/project_members                   (프로젝트 멤버)
4. GET  /rest/v1/projects                          (프로젝트 정보)
5. GET  /rest/v1/project_invitations               (초대 목록)
6. GET  /rest/v1/issues?select=*&order=asc         (이슈 목록)
7. GET  /rest/v1/issue_labels                      (라벨 관계)
8. GET  /rest/v1/labels                            (라벨 상세)
9. GET  /rest/v1/profiles                          (사용자 프로필)
```

### 3. 주요 문제점

#### 🚨 문제 #1: 불필요한 데이터베이스 쓰기 연산

**문제:** 모든 요청마다 `POST /rest/v1/profiles?on_conflict=id` 호출

```
POST | 200 | /rest/v1/profiles?on_conflict=id | node
```

**영향:**
- 모든 페이지 로딩마다 불필요한 DB 쓰기 연산
- 프로필 데이터가 변경되지 않았어도 지연 발생
- `on_conflict=id`를 사용하지만 여전히 쓰기 잠금 필요

**증거:**
- 모든 페이지 로딩 순서에 나타남
- upsert 전에 조건부 확인 없음
- 사용자 데이터 변경 여부와 상관없이 호출됨

#### 🚨 문제 #2: N+1 쿼리 패턴

**문제:** 최적화된 조인 대신 순차적인 종속 쿼리 사용

**현재 패턴:**
```
issues → issue_labels → labels → profiles
```

**영향:**
- 데이터베이스에 4번의 순차적 라운드 트립
- 각 쿼리는 이전 쿼리 완료를 기다림
- 전체 지연 시간 = 모든 쿼리 시간의 합

**로그 예시:**
```
GET | 200 | /rest/v1/issues?select=*&project_id=eq.xxx&order=issue_number.asc
GET | 200 | /rest/v1/issue_labels?select=issue_id,label_id&project_id=eq.xxx&issue_id=in.(...)
GET | 200 | /rest/v1/labels?select=*&project_id=eq.xxx&id=in.(...)
GET | 200 | /rest/v1/profiles?select=*&id=in.(...)
```

#### 🚨 문제 #3: 중복 API 호출

**문제:** 페이지 로딩마다 같은 API 엔드포인트가 2번 이상 호출됨

**API 로그 증거:**
```
# 첫 번째 호출 (프리페치)
GET | 200 | /rest/v1/issues?select=*&project_id=eq.xxx&order=issue_number.asc | timestamp: 1774318165673000

# 두 번째 호출 (실제 로딩)
GET | 200 | /rest/v1/issues?select=*&project_id=eq.xxx&order=issue_number.asc | timestamp: 1774318168877000
```

**영향:**
- 데이터베이스 부하 2배
- React Server Components 프리페치 + 클라이언트 사이드 페치
- 호출 간 3초 이상 간격으로 불필요한 재페치 의심

#### 🚨 문제 #4: 순차적 데이터 가져오기

**문제:** 모든 API 호출이 순차적으로 실행되며 병렬 처리 안됨

**로그 타임라인:**
```
1774318165673000 - issues
1774318166029000 - issue_labels (+357ms)
1774318166390000 - labels (+361ms)
1774318166437000 - profiles (+47ms)
```

**영향:**
- 전체 시간 = 모든 개별 쿼리 시간의 합
- 독립적인 쿼리임에도 병렬 실행 없음
- 병렬 페칭 시 4배 더 빠를 수 있음

## 근본 원인 분석

### 아키텍처 이슈

1. **레포지토리 패턴 구현**
   - 당시 구현은 `service-role` 클라이언트 사용 비중이 높았음 (현재는 대부분 세션 인식 클라이언트로 전환, 일부 예외만 남음)
   - 각 레포지토리 메서드가 개별 Supabase 호출
   - 배칭 처리나 쿼리 최적화 없음

2. **서버 액션 설계**
   - 서버 액션이 레포지토리를 순차적으로 호출
   - 관련 데이터 페치 간 조율 없음
   - 각 액션이 독립적으로 사용자 프로필 페치

3. **React Server Components**
   - 프리페칭이 최적화되지 않음
   - 클라이언트 사이드에서 서버 페치 데이터를 중복 페치
   - 서버와 클라이언트 간 캐시 조율 없음

### 코드 위치

**조사 필요 파일:**

```
features/project-issues/
├── repositories/
│   └── supabase-issues-repository.ts    # N+1 쿼리 패턴
├── actions/
│   └── get-project-issues.ts            # 순차적 페칭
└── lib/
    └── issues-lib.ts                    # 비즈니스 로직

features/auth/
├── actions/
│   └── get-current-user.ts              # 프로필 upsert
└── repositories/
    └── supabase-auth-repository.ts     # 인증 체크

app/
└── projects/
    └── [projectId]/
        └── issues/
            └── page.tsx                 # RSC 프리페치
```

## 개선 권장사항

### 우선순위 1: 즉시 수정 (높은 영향, 낮은 노력)

#### 1. 불필요한 프로필 Upsert 제거

**현재:** 모든 요청이 `POST /rest/v1/profiles?on_conflict=id` 호출

**해결책:**
- upsert 전에 프로필 존재 여부 확인
- 프로필 데이터가 실제로 변경될 때만 upsert
- 세션/서버 컨텍스트에 프로필 데이터 캐싱

**예상 효과:** 요청당 -200~500ms

#### 2. 병렬 쿼리 실행 활성화

**현재:** 순차적 쿼리
```typescript
const issues = await getIssues(projectId);
const labels = await getLabels(issueIds);
const profiles = await getProfiles(userIds);
```

**해결책:** `Promise.all()` 사용
```typescript
const [issues, labels, profiles] = await Promise.all([
  getIssues(projectId),
  getLabels(issueIds),
  getProfiles(userIds)
]);
```

**예상 효과:** 쿼리 시간 -60~75% (4개 순차 → 1개 병렬)

#### 3. 중복 API 호출 제거

**현재:** 같은 엔드포인트 2회 이상 호출

**해결책:**
- React Server Components 프리페치 전략 검토
- 적절한 캐시 헤더 구현
- 서버 사이드 중복 제거를 위해 React의 `cache()` 함수 사용
- 불필요한 클라이언트 사이드 페치 제거

**예상 효과:** API 호출 -50%

### 우선순위 2: 중기 개선

#### 4. 데이터베이스 쿼리 최적화

**현재:** 여러 개별 쿼리

**해결책:**
- 복잡한 조인을 위한 Supabase RPC 함수 생성
- 일반적 쿼리를 위한 뷰 머티리얼라이제이션 구현
- 자주 필터링되는 컬럼에 DB 인덱스 추가
- 별도 쿼리 대신 `select()`와 조인 사용

**예상 효과:** 쿼리당 -40~60%

#### 5. 캐싱 전략 구현

**해결책:**
- 자주 변경되지 않는 데이터의 서버 사이드 캐싱 (프로젝트 정보, 라벨)
- SWR/React Query를 이용한 클라이언트 사이드 캐싱
- 공개 프로젝트 데이터의 CDN 캐싱
- 사용자 세션을 위한 Redis 캐시

**예상 효과:** 캐시된 데이터 -80%

### 우선순위 3: 장기 아키텍처

#### 6. Service-role 클라이언트 교체

**당시:** `service-role` 키 사용, RLS 우회

**현재(2026-03-25):** 대부분 세션 인식 서버 클라이언트로 교체되었고, 이슈 상세 읽기 경로만 예외적으로 남아 있음

**해결책:** 세션 인식 서버 클라이언트 구현

**영향:** 적절한 RLS + 연결 풀링

#### 7. GraphQL 또는 tRPC 구현

**현재:** 여러 엔드포인트를 가진 REST API

**해결책:** 중첩 데이터 페칭을 위한 단일 쿼리

**예상 효과:** 네트워크 라운드 트립 -70%

## 성능 목표

### 현재 상태
- **보드 페이지 로딩:** 2,150~2,272ms
- **페이지당 API 호출:** 9개 순차적 호출
- **요청당 DB 쓰기:** 1개 불필요한 upsert

### 목표 상태 (우선순위 1 수정 후)
- **보드 페이지 로딩:** <500ms (75% 개선)
- **페이지당 API 호출:** 3개 병렬 호출 (67% 감소)
- **요청당 DB 쓰기:** 0 (제거됨)

### 스트레치 목표 (모든 우선순위 후)
- **보드 페이지 로딩:** <200ms (90% 개선)
- **페이지당 API 호출:** 1개 최적화된 쿼리
- **캐시 적중률:** >80%

## 구현 계획

### 1단계: 빠른 수정 (1주차)
- [ ] 불필요한 프로필 upsert 제거
- [ ] 병렬 쿼리 실행 활성화
- [ ] 중복 API 호출 수정
- [ ] 기본 오류 모니터링 추가

### 2단계: 쿼리 최적화 (2주차)
- [ ] 복잡한 쿼리를 위한 Supabase RPC 함수 생성
- [ ] 데이터베이스 인덱스 추가
- [ ] 쿼리 결과 캐싱 구현
- [ ] React Server Components 최적화

### 3단계: 아키텍처 (3-4주차)
- [ ] 남아 있는 `loadIssueDetail()` 예외 경로까지 세션 인식 읽기 모델로 단순화 검토
- [ ] 포괄적인 캐싱 전략 구현
- [ ] 성능 모니터링 추가
- [ ] 로드 테스트 및 최적화

## 모니터링 및 지표

### 추적할 주요 지표

1. **응답 시간**
   - p50: <500ms
   - p95: <1s
   - p99: <2s

2. **데이터베이스 성능**
   - 쿼리 실행 시간
   - 요청당 쿼리 수
   - 캐시 적중률

3. **API 성능**
   - 페이지당 API 호출 수
   - 중복 요청율
   - 오류율

### 도구
- Vercel Analytics
- Supabase Query Performance
- 커스텀 성능 로깅

## 부록

### 테스트 환경
- **URL:** https://hinear.vercel.app
- **데이터베이스:** Supabase (pmyrrckkiomjwjqntymr)
- **테스트 날짜:** 2026-03-24
- **테스트 사용자:** 1개 프로젝트, 1개 이슈가 있는 인증된 사용자

### 관련 문서
- `docs/issue-detail/overview.md` - 기능 범위
- `docs/issue-detail/roadmap.md` - MVP 단계
- `CLAUDE.md` - 아키텍처 노트

### 다음 단계
1. 권장사항 검토 및 우선순위 지정
2. 1단계 구현 작업 생성
3. 성능 모니터링 설정
4. 우선순위 1 수정 사항 구현 시작
