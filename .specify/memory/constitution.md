<!--
 Sync Impact Report:
 Version: N/A → 1.0.0
 Modified Principles: N/A (initial creation)
 Added Sections: All sections (initial creation)
 Removed Sections: N/A
 Templates Updated:
   ✅ plan-template.md - Constitution Check section already present
   ✅ spec-template.md - User story priorities align with MVP-first approach
   ✅ tasks-template.md - Task organization supports independent story implementation
 Follow-up TODOs: None
-->

# Hinear 프로젝트 헌법

## 핵심 원칙

### I. 프로젝트 우선 (Project-First)

Hinear의 최상위 도메인 경계는 `workspace`가 아니라 `project`입니다. 모든 데이터와 권한은 프로젝트를 중심으로 구성됩니다.

- 각 프로젝트는 `personal` 또는 `team` 유형을 가집니다
- 이슈는 반드시 하나의 프로젝트에 속하며 프로젝트 범위를 벗어날 수 없습니다
- 접근 제어와 권한 관리는 프로젝트 단위로 이루어집니다

**근거**: 혼자 쓰는 개인 프로젝트와 팀과 함께하는 팀 프로젝트를 동일한 제품 경험에서 운영할 수 있어야 합니다. 프로젝트가 최상위 경계가 되어야 권한 관리와 데이터 격리가 명확해집니다.

### II. 이슈 중심 설계 (Issue-Centric Design)

제품의 핵심 가치는 이슈 상세 화면에서 완성됩니다. 리스트, 필터, 대시보드는 이슈 상세를 보완하는 보조 수단입니다.

- 이슈 상세 화면이 진리의 원천(Source of Truth)입니다
- 한 화면에서 이슈 생성부터 처리 완료까지 모든 작업을 완료할 수 있어야 합니다
- 드로어(Drawer)와 전체 페이지(Full Page)는 동일한 데이터 모델을 공유합니다

**근거**: 사용자는 이슈를 관리하기 위해 제품을 사용합니다. 이슈 상세 화면에서 제공되는 경험이 탁월해야 전체 제품의 가치가 확보됩니다.

### III. 도메인 주도 설계 (Domain-Driven Design)

각 도메인 기능은 명확한 계층 구조를 따릅니다.

- `contracts.ts` - 입력/출력 타입 정의
- `types.ts` - 도메인 모델 타입
- `lib/` - 순수 비즈니스 로직
- `repositories/` - 데이터 접근 계층 (Supabase 구현)
- `actions/` - Next.js 서버 액션
- `components/` - React 컴포넌트

**근거**: 관심사의 분리와 명확한 계층 구조는 코드의 유지보수성을 높이고, 테스트 가능성을 보장합니다.

### IV. 점진적 완성 (Incremental Completeness)

기능은 우선순위에 따라 점진적으로 완성되며, 각 단계는 독립적으로 사용 가능해야 합니다.

- MVP 1: 개인 프로젝트 + 이슈 보드 + 이슈 관리 기본 기능
- MVP 2: 팀 프로젝트 + 초대 + 권한 관리 + 낙관적 잠금
- MVP 3: 알림 + 멘션 + 구독

각 MVP 단계는 독립적으로 가치를 제공해야 하며, 이전 단계에 의존하여 완성되어서는 안 됩니다.

**근거**: 사용자 가치를 빠르게 전달하고, 피드백을 통해 다음 단계로 나아갈 수 있습니다. 완성되지 않은 기능을 미리 만드는 것은 낭비입니다.

### V. 테스트 주도 개발 (Test-Driven Development)

핵심 도메인 로직은 반드시 테스트와 함께 작성됩니다.

- Vitest + Testing Library를 사용합니다
- 도메인 로직(`lib/`)은 단위 테스트로 검증합니다
- 사용자 시나리오는 통합 테스트로 검증합니다
- 테스트는 구현 전에 작성되며, 실패한 상태를 확인한 후 구현을 시작합니다

**근거**: 이슈 관리 앱은 상태 변경과 입력 편집이 많아 도메인 테스트의 가치가 높습니다. 테스트는 리팩토링을 안전하게 만들고, 코드의 신뢰성을 보장합니다.

### VI. 보안과 무결성 (Security & Data Integrity)

RLS(Row Level Security)와 낙관적 잠금(Optimistic Locking)으로 데이터 무결성을 보장합니다.

- 서버 액션은 세션 인식 클라이언트를 사용해야 합니다
- `service-role` 클라이언트는 개발용으로만 사용되며, 프로덕션에서는 제거됩니다
- 팀 협업 시 충돌 방지를 위해 낙관적 잠금을 사용합니다

**근거**: 팀 프로젝트에서 다른 사용자의 데이터를 보호하는 것은 필수입니다. 동시 편집 시 데이터 무결성을 보장하지 않으면 사용자 신뢰를 잃게 됩니다.

### VII. 설치 가능한 PWA (Installable PWA)

웹 기술이지만 네이티브 앱 같은 경험을 제공합니다.

- PWA 매니페스트와 서비스 워커로 설치 가능성을 보장합니다
- 오프라인 기본 지원과 알림 권한 요청은 사용자 액션 후에만 수행합니다
- Firebase Cloud Messaging으로 웹 푸시 알림을 전송합니다

**근거**: 사용자는 언제 어디서나 이슈를 확인하고 업데이트할 수 있어야 합니다. PWA는 플랫폼 제약 없이 네이티브 앱 같은 경험을 제공합니다.

### VIII. 단순성 유지 (Simplicity)

YAGNI(You Aren't Gonna Need It) 원칙을 따릅니다.

- 필요하지 않은 기능은 미리 만들지 않습니다
- 복잡성은 명확한 필요성에 의해 정당화되어야 합니다
- 추상화는 실제 중복이 발생할 때만 도입합니다

**근거**: 과한 엔지니어링은 유지보스 비용을 높이고, 변경을 어렵게 만듭니다. 단순한解决方案이 항상 우선입니다.

## 기술 표준

### 언어와 프레임워크

- **언어**: TypeScript
- **프레임워크**: Next.js (App Router)
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **테스트**: Vitest + Testing Library
- **코드 품질**: Biome (Linter + Formatter)

### 아키텍처 원칙

- **서버 컴포넌트 우선**: 가능한 서버 컴포넌트를 사용하여 클라이언트 자바스크립트를 최소화합니다
- **서버 액션**: 데이터 변경은 서버 액션을 통해 수행합니다
- **타입 안전성**: 프론트엔드와 백엔드 간 타입 공유를 통해 타입 안전성을 보장합니다

### 성능 기준

- 페이지 로드: 2초 이내 (3G 환경)
- 인터랙션 반응: 100ms 이내
- 빌드 크기: 초기 번들 200KB 이하 (gzip)

## 개발 워크플로우

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `feature/###-feature-name`: 기능 브랜치
- `fix/###-bug-fix`: 버그 수정 브랜치

### 코드 리뷰

- 모든 변경은 Pull Request를 통해 제출됩니다
- PR은 최소 한 명의 승인을 받아야 머지됩니다
- CI 테스트가 통과해야 머지가 가능합니다

### 커밋 컨벤션

- Conventional Commits를 따릅니다
- 타입: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- 예: `feat: add issue assignee change`

## 거버넌스

### 헌법의 우선순위

이 헌법은 다른 모든 개발 관행보다 우선합니다. 모든 PR과 코드 리뷰는 이 헌법을 준수하는지 확인해야 합니다.

### 개정 절차

1. 개정 제안: 문서화된 제안과 함께 이유를 설명합니다
2. 영향 평가: 변경이 기존 코드와 문서에 미치는 영향을 평가합니다
3. 승인: 프로젝트 유지관리자의 승인을 받습니다
4. 마이그레이션: 기존 코드를 새로운 표준에 맞춰 조정합니다
5. 버전 업데이트: 시맨틱 버전닝을 따라 버전을 업데이트합니다

### 버전 정책

- **MAJOR**: 헌법 원칙의 삭제 또는 호환되지 않는 변경
- **MINOR**: 새로운 원칙 또는 섹션 추가
- **PATCH**: 문구 수정, 오타 수정, 비의미적 개선

### 준수 검토

- 모든 PR은 헌법 준수 여부를 확인받아야 합니다
- 복잡성이 증가하는 결정은 명확한 정당성이 필요합니다
- CLAUDE.md를 런타임 개발 가이드로 참조합니다

---

**버전**: 1.0.0 | **제정일**: 2026-03-26 | **수정일**: 2026-03-26
