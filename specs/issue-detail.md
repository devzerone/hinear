# Issue Detail Spec

## Goal

Implement a Linear-style issue management system with a Kanban board and detailed issue page for managing project issues.

The MVP focuses on the Kanban board as the primary interface with full-page issue detail for deep dives. List views, filters, team switching, project overview, and keyboard shortcut parity are out of scope for the first implementation.

For the current desktop baseline, the primary implementation surface is the **Kanban board** with draggable issue cards between status columns. Full-page issue detail is available for individual issue management.

## Design Source

UI 디자인은 `pen/Hinear.pen` 파일에 정의된 Pen 디자인을 기반으로 구현한다. 이 파일에는 다음 구성요소들이 포함되어 있으며, 색상, 폰트, 간격, 컴포넌트 구조 등의 디자인 토큰을 추출하여 React 컴포넌트로 변환한다:

- **Issue Create Page** - 이슈 생성 전용 페이지/모달
- **Kanban Board** - Triage, Backlog, Todo, In Progress, Done, Canceled 컬럼
- **Issue Cards** - identifier, 제목, 우선순위, 라벨, 담당자 표시
- **Sidebar** - 프로젝트 네비게이션
- **Linear Header** - 프로젝트 경로 표시
- **Create Issue Modal** - 마크다운 도구모음 포함

## Primary User Outcome

A user can open one issue and complete the full triage and execution workflow without leaving the detail page.

## Core Scope

### Kanban Board
- Display issues in status columns: `Triage`, `Backlog`, `Todo`, `In Progress`, `Done`, `Canceled`
- Issue cards showing: identifier, title, priority, labels, assignee
- If board-card labels can overflow horizontally, implement them with a vertical wrapper that can contain one or more tag rows so the card grows taller instead of clipping or overlapping content.
- Drag-and-drop to move issues between columns
- Create new issue from the board

### Issue Creation
- Create Issue Modal/Page with title, description, priority
- Markdown toolbar for formatting
- Default status: `Triage`
- Success: open a compact drawer by default on desktop/tablet board flows, with a clear path to the full-page issue detail

### Issue Detail
- Edit issue title
- Change status: `Triage`, `Backlog`, `Todo`, `In Progress`, `Done`, `Canceled`
- Change priority
- Change assignee
- Add and remove labels
- Edit description
- Write comments
- View activity log

## Triage Workflow

`Triage` is the default status for newly created issues.

The `Triage` stage is used to clarify and route new work before it enters the execution queue.

While an issue is in `Triage`, the user should typically:

- confirm the title is clear
- set a priority
- assign an owner if known
- attach relevant labels
- expand or correct the description
- decide whether the issue moves to `Backlog` or directly to `Todo`

## Page Regions

### Header

- issue identifier
- editable title
- current status
- priority selector
- assignee selector
- labels selector

### Body

- description editor
- comments thread

### Sidebar or Secondary Section

- activity log
- creation and update metadata
- failure / rollback guidance or error support copy

The exact layout may be adjusted to match the app architecture, but all three content groups must be visible or reachable without navigation away from the page.

For desktop V1, the preferred layout is:

- full-page route as the primary detail surface
- main content column for editable issue content
- secondary column for metadata and full activity history

A drawer variant is allowed only if it stays compact and clearly delegates full metadata and full history to the full-page route.

## Breakpoint Model

### Desktop `>= 1280px`

- The primary issue detail surface is a full-page route.
- The drawer is optional and exploratory only.
- Create issue may open as a modal, and success should open the compact drawer first with a clear action to enter the full-page route.

### Tablet `768px - 1279px`

- The board may open issue detail in a compact drawer first.
- The tablet drawer should keep only compact fields, short description, recent activity, and metadata summary.
- Full metadata, full history, and long-form editing should move to the full-page route.
- Create issue success should also open the compact drawer first, with escalation to the full-page route when needed.

### Mobile `< 768px`

- The primary issue detail surface is a compact full-page route.
- Issue tap should open full-page detail directly.
- Create issue should use a mobile-first full-page form and land on full-page detail after success.

## Functional Requirements

### Title Editing

- The title is displayed on initial load.
- The title can be edited inline.
- Saving the title persists the latest value.
- An empty title is invalid.
- On save failure, the UI restores the previous persisted title.

### Status Changes

- Status options are limited to `Triage`, `Backlog`, `Todo`, `In Progress`, `Done`, and `Canceled`.
- A user can move an issue between statuses using a selector.
- Newly created issues default to `Triage`.
- Each status change appends an activity log entry.

### Priority Changes

- Priority is editable from the detail page.
- Priority changes persist immediately or on explicit save, depending on UI implementation.
- Each priority change appends an activity log entry.

### Assignee Changes

- The user can assign, replace, or clear an assignee.
- Each assignee change appends an activity log entry.

### Labels

- The user can add one or more labels.
- The user can remove an existing label.
- Duplicate labels are not allowed.
- Each label add or remove action appends an activity log entry.

### Description Editing

- The description supports empty and non-empty states.
- The user can edit and save the description.
- On save failure, the UI restores the previous persisted description.
- Each successful description change appends an activity log entry.

### Comments

- The user can write a new comment.
- Empty comments are invalid.
- A successful comment appears in the comment thread.
- A successful comment appends an activity log entry.

### Activity Log

- The activity log is read-only in the first version.
- Entries are ordered newest first.
- Entries must be shown for:
  - issue creation
  - title changes
  - status changes
  - priority changes
  - assignee changes
  - label add and remove
  - description changes
  - comment creation

### Route Model

- The main V1 interface is the **Kanban board** showing all issues in status columns.
- Full-page issue detail is available for individual issue management.
- **Create issue success opens in drawer by default** (more natural for Kanban workflow)
- Drawer exposes a clear action to open the full-page route for detailed editing.
- A board-linked drawer may exist later as a compact companion view.
- Tablet may use the compact drawer as its first exploration surface.
- Mobile should prefer direct full-page detail over drawer indirection.

## Non-Goals

- separate issue list view (board serves this purpose)
- project dashboard
- complex filtering (basic status filtering is OK)
- keyboard shortcut parity with Linear
- team management
- real-time collaboration
- offline support
- keyboard shortcut parity with Linear
- issue relationships, subtasks, or cycles

## Default UX Rules

- Optimistic updates are allowed for field edits if rollback is implemented on failure.
- Loading state must be visible on first page load.
- Failed mutations must present a visible error state.
- The page must remain usable when description or comments are empty.

## Acceptance Criteria

1. A new issue defaults to `Triage`.
2. A user can move an issue from `Triage` to `Backlog` or `Todo`.
3. A user can update title, priority, assignee, labels, and description from the same page.
4. A user can create a comment without leaving the page.
5. Each successful change produces a visible activity log entry.
6. Failed saves do not leave the UI in a permanently inconsistent state.
7. On desktop, the full-page detail route remains the primary implementation surface even if a compact drawer exploration exists.
8. On tablet, the drawer stays compact and exposes a clear path to the full-page route.
9. On mobile, issue open and issue create both resolve to a full-page detail flow.
10. A user can move an issue into `Canceled` when work is intentionally stopped.
