# Gmail SMTP Setup Guide

이 문서는 Hinear의 프로젝트 초대 메일 발송을 위해 Gmail SMTP를 설정하는 방법을 정리한다.

현재 코드 기준으로 초대 메일은 아래 환경변수를 사용한다.

- `GMAIL_SMTP_USER`
- `GMAIL_SMTP_APP_PASSWORD`
- `EMAIL_FROM`

관련 구현 파일:

- `src/lib/email/send-project-invitation-email.ts`
- `src/features/projects/actions/invite-project-member-action.ts`
- `src/features/projects/actions/manage-project-invitation-action.ts`

## 개요

현재 초대 메일 발송 로직은 Gmail SMTP를 통해 동작한다.

동작 방식은 아래와 같다.

1. 프로젝트 초대 생성
2. 초대 링크 생성
3. Gmail SMTP 설정이 있으면 메일 전송 시도
4. Gmail SMTP 설정이 없으면 초대 레코드는 유지하고, UI에는 수동 공유 안내 표시

즉 Gmail SMTP는 "초대 메일 자동 발송"을 위한 설정이고, 설정이 없어도 초대 자체는 생성된다.

## 필요한 환경변수

`.env.local`에 아래 값을 넣는다.

```env
GMAIL_SMTP_USER=hinear.team@gmail.com
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

### `GMAIL_SMTP_USER`

의미:

- 실제 SMTP 로그인에 사용하는 Gmail 주소
- 메일을 보내는 발신 계정

예시:

```env
GMAIL_SMTP_USER=hinear.team@gmail.com
```

주의:

- 일반 회사 도메인 메일 주소를 넣는 값이 아니라, 현재는 Gmail SMTP로 로그인 가능한 Gmail 주소여야 한다
- 가능하면 서비스용 전용 Gmail 계정을 따로 만드는 것을 권장한다

### `GMAIL_SMTP_APP_PASSWORD`

의미:

- Gmail 계정의 일반 비밀번호가 아니라 Google에서 별도로 발급한 앱 비밀번호

예시:

```env
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop
```

중요:

- Gmail 로그인 비밀번호를 넣으면 안 된다
- 반드시 Google 계정의 `앱 비밀번호` 기능으로 발급한 값을 넣어야 한다
- 보통 16자리이며, Google UI에서는 공백이 포함되어 보일 수 있다
- `.env.local`에는 공백 없이 넣는 것을 권장한다

예:

- 화면 표시: `abcd efgh ijkl mnop`
- `.env.local` 저장값: `abcdefghijklmnop`

### `EMAIL_FROM`

의미:

- 수신자가 실제 메일 클라이언트에서 보게 되는 발신자 표시값

예시 1:

```env
EMAIL_FROM=hinear.team@gmail.com
```

예시 2:

```env
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

권장:

```env
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

주의:

- 가능하면 `GMAIL_SMTP_USER`와 같은 메일 주소를 쓰는 것이 안전하다
- 다른 주소를 넣으면 발신자 스푸핑처럼 보일 수 있고, Gmail 정책에 따라 표시가 깨지거나 전달성이 떨어질 수 있다

## 추천 설정 예시

서비스용 Gmail 계정을 `hinear.team@gmail.com` 으로 만든 경우:

```env
GMAIL_SMTP_USER=hinear.team@gmail.com
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

## Google 계정에서 앱 비밀번호 발급하는 방법

앱 비밀번호를 쓰려면 먼저 2단계 인증이 켜져 있어야 한다.

### 1. Gmail 계정 준비

초대 메일 발송용 Gmail 계정을 하나 준비한다.

권장 예시:

- `hinear.team@gmail.com`
- `hinear.app@gmail.com`

가능하면 개인용 Gmail이 아니라 서비스용 전용 계정을 따로 사용하는 편이 낫다.

### 2. Google 계정 보안 페이지 진입

1. Gmail 계정으로 로그인
2. `Google 계정 관리` 진입
3. 왼쪽 메뉴에서 `보안` 선택

### 3. 2단계 인증 활성화

`앱 비밀번호` 메뉴는 2단계 인증이 켜져 있어야만 나타난다.

설정 순서:

1. `보안`
2. `Google에 로그인`
3. `2단계 인증`
4. 안내에 따라 휴대폰 문자, OTP 앱 등으로 설정 완료

### 4. 앱 비밀번호 생성

2단계 인증을 켠 뒤 다시 `보안` 메뉴로 돌아가서:

1. `앱 비밀번호` 메뉴 진입
2. 앱 이름 입력
   - 예: `hinear smtp`
   - 예: `next invite mail`
3. 생성
4. 표시되는 16자리 비밀번호 복사

그 값을 `GMAIL_SMTP_APP_PASSWORD`에 넣으면 된다.

## `.env.local`에 값 넣는 위치

프로젝트 루트의 `.env.local` 파일에 넣는다.

예:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GMAIL_SMTP_USER=hinear.team@gmail.com
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

주의:

- `.env.example`는 예시 파일이다
- 실제 실행에 쓰는 값은 `.env.local`에 넣어야 한다
- 값을 바꾼 뒤에는 개발 서버를 재시작해야 한다

## 현재 코드에서 이 값이 어떻게 쓰이는가

`src/lib/email/send-project-invitation-email.ts` 기준으로:

- `GMAIL_SMTP_USER`: SMTP 인증 사용자
- `GMAIL_SMTP_APP_PASSWORD`: SMTP 인증 비밀번호
- `EMAIL_FROM`: 메일 헤더의 `from`

설정이 모두 있으면 아래 설정으로 메일이 발송된다.

- host: `smtp.gmail.com`
- port: `465`
- secure: `true`

즉 현재는 Gmail의 SSL SMTP 전송 방식이다.

## 설정 후 테스트 방법

### 기본 테스트 순서

1. `.env.local`에 값 입력
2. dev 서버 재시작
3. 앱 로그인
4. 프로젝트 설정 또는 멤버 초대 UI에서 초대 메일 발송
5. 초대받은 이메일 받은편지함 확인
6. 메일이 안 보이면 스팸함도 확인

### 기대 결과

정상 동작 시:

- 초대 생성 성공
- 메일 수신
- 메일 제목:
  - `You're invited to join {projectName} on Hinear`
- 메일 본문에 초대 링크 포함

### 실패 시 현재 앱 동작

SMTP 값이 없거나 발송이 생략되면:

- 초대 레코드는 생성될 수 있음
- UI에는 메일이 자동 발송되지 않았으니 링크를 수동 공유하라는 notice가 표시됨

즉 "메일 전송 실패"와 "초대 생성 실패"는 동일하지 않다.

## 자주 발생하는 문제

### 1. 일반 Gmail 비밀번호를 넣은 경우

증상:

- SMTP 인증 실패
- 메일이 전송되지 않음

해결:

- Gmail 로그인 비밀번호가 아니라 앱 비밀번호를 사용해야 한다

### 2. 2단계 인증을 켜지 않은 경우

증상:

- Google 계정에서 `앱 비밀번호` 메뉴가 보이지 않음

해결:

- 먼저 2단계 인증을 활성화한다

### 3. `.env.local` 수정 후 서버를 재시작하지 않은 경우

증상:

- 값을 넣었는데도 여전히 "SMTP is not configured"처럼 동작

해결:

- dev 서버를 완전히 재시작한다

### 4. `EMAIL_FROM`을 다른 주소로 넣은 경우

증상:

- 수신함 표시가 이상함
- 메일 전달성이 떨어질 수 있음

해결:

- `EMAIL_FROM` 주소를 `GMAIL_SMTP_USER`와 같은 주소로 맞춘다

권장 예:

```env
GMAIL_SMTP_USER=hinear.team@gmail.com
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

### 5. 메일이 스팸함으로 가는 경우

원인 후보:

- 새 Gmail 계정
- 반복적인 자동 발송
- 발신자 신뢰도 부족

해결:

- 스팸함 먼저 확인
- 서비스용 전용 계정 사용
- 향후 운영 환경에서는 SES / Resend 같은 전용 메일 서비스 고려

## 운영 시 주의사항

Gmail SMTP는 테스트나 저용량 운영에는 쓸 수 있지만 장기 운영용으로는 제한이 있다.

주의점:

- 발송량 제한 가능
- 자동화 메일로 판단되어 차단 가능
- 계정 보호 정책에 의해 일시 제한 가능
- 대량 발송에는 적합하지 않음

즉 현재 용도는:

- 개발 환경 테스트
- 초기 MVP
- 소규모 초대 메일

장기적으로는 아래 서비스로 옮기는 것이 낫다.

- AWS SES
- Resend
- Postmark

## 권장 운영 방침

초기:

- Gmail SMTP로 개발/테스트 진행

사용자 수가 늘어나면:

- Gmail SMTP 대신 전용 메일 서비스로 이전

추천 우선순위:

1. 비용 우선: AWS SES
2. 구현 속도 우선: Resend

## 체크리스트

설정 전에 확인:

- Gmail 계정 준비됨
- 2단계 인증 켜짐
- 앱 비밀번호 생성 완료

`.env.local` 확인:

- `GMAIL_SMTP_USER` 입력
- `GMAIL_SMTP_APP_PASSWORD` 입력
- `EMAIL_FROM` 입력

실행 전 확인:

- dev 서버 재시작

테스트 후 확인:

- 받은편지함 확인
- 스팸함 확인
- 초대 링크 클릭 가능 여부 확인

## 최종 예시

```env
GMAIL_SMTP_USER=hinear.team@gmail.com
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Hinear <hinear.team@gmail.com>
```

이 구성이 현재 코드 기준으로 가장 무난하고 안전한 설정이다.
