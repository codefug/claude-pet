# Claude Pet — 유지보수 가이드

이 문서는 이 프로젝트를 유지보수할 때 어디를 봐야 하는지, 각 기술 스택의 공식 문서 출처와 함께 정리합니다.

---

## 프로젝트 구조

```
claude-pet/
├── src/
│   ├── main/          # Electron 메인 프로세스 (Node.js 환경)
│   │   ├── index.ts   # BrowserWindow, Tray, 앱 초기화
│   │   └── sessions/  # JSONL 파싱, chokidar 감시, 상태 분류
│   ├── preload/       # 메인 ↔ 렌더러 IPC 브리지
│   │   └── index.ts   # contextBridge 정의
│   └── renderer/      # React UI (브라우저 환경)
│       └── src/
│           ├── App.tsx
│           ├── components/
│           └── assets/yorkie/  # 요크셔테리어 SVG 4종
├── resources/         # 빌드 시 포함할 정적 자산 (tray icon 등)
├── build/             # electron-builder 빌드 설정 자산
├── docs/              # 이 파일이 있는 곳
├── electron.vite.config.ts  # Vite + Electron 빌드 설정
├── electron-builder.yml     # 패키징/배포 설정
└── biome.json         # lint/format 설정
```

---

## 기술 스택별 공식 문서

### Electron
- **공식 문서**: https://www.electronjs.org/docs/latest
- **BrowserWindow 옵션** (frameless, alwaysOnTop, transparent):
  https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
- **IPC 통신** (ipcMain / ipcRenderer):
  https://www.electronjs.org/docs/latest/tutorial/ipc
- **Tray**:
  https://www.electronjs.org/docs/latest/api/tray
- **보안 권고사항** (contextIsolation, sandbox):
  https://www.electronjs.org/docs/latest/tutorial/security

> 버전 변경 시 반드시 **Breaking Changes** 페이지 확인:
> https://www.electronjs.org/docs/latest/breaking-changes

---

### electron-vite
- **공식 문서**: https://electron-vite.org
- **설정 레퍼런스** (electron.vite.config.ts):
  https://electron-vite.org/config
- **Hot Reload 구조** (메인/프리로드/렌더러 각각):
  https://electron-vite.org/guide/hot-reloading
- **프리로드 스크립트 빌드**:
  https://electron-vite.org/guide/preload

---

### electron-builder (패키징 / dmg 빌드)
- **공식 문서**: https://www.electron.build
- **macOS 빌드 옵션** (dmg, notarize 설정):
  https://www.electron.build/mac
- **electron-builder.yml 전체 설정 레퍼런스**:
  https://www.electron.build/configuration/configuration
- **코드사이닝 없이 배포** (notarize: false + Gatekeeper 우회):
  https://www.electron.build/guides/code-signing#how-to-disable-code-signing-during-the-build-process-on-macos

---

### React 19
- **공식 문서**: https://react.dev
- **Hooks 레퍼런스** (useState, useEffect):
  https://react.dev/reference/react

---

### chokidar (파일 감시)
- **GitHub README** (= 공식 레퍼런스):
  https://github.com/paulmillr/chokidar
- **핵심 옵션** (`awaitWriteFinish`, `usePolling`, `ignoreInitial`):
  README의 "API" 섹션 참고
- **이 프로젝트에서 사용하는 설정 근거**:
  - `awaitWriteFinish: false` — `.jsonl`은 append-only라 쓰기 완료 대기 불필요
  - `ignoreInitial: true` — 앱 시작 시 기존 파일 스캔은 별도 로직으로 처리
  - `usePolling: false` — 로컬 디스크이므로 네이티브 이벤트 사용

---

### Biome (lint / format)
- **공식 문서**: https://biomejs.dev
- **설정 레퍼런스** (biome.json):
  https://biomejs.dev/reference/configuration
- **lint 규칙 목록**:
  https://biomejs.dev/linter/rules
- **CLI 명령어**:
  https://biomejs.dev/reference/cli

---

### TypeScript
- **공식 문서**: https://www.typescriptlang.org/docs
- **tsconfig 옵션 레퍼런스**:
  https://www.typescriptlang.org/tsconfig
- 이 프로젝트는 tsconfig를 3개로 분리:
  - `tsconfig.json` — 루트 (참조용)
  - `tsconfig.node.json` — 메인/프리로드 (Node 환경)
  - `tsconfig.web.json` — 렌더러 (브라우저 환경)

---

## 유지보수 시 주요 체크포인트

### Electron 버전 업그레이드
1. [Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) 먼저 읽기
2. `src/main/index.ts`의 BrowserWindow API 변경 여부 확인
3. `src/preload/index.ts`의 contextBridge API 확인
4. `npm run dev`로 동작 확인 후 `npm run build:mac`

### chokidar 동작이 이상할 때
- `awaitWriteFinish`가 의도치 않게 켜져 있지 않은지 확인 (`biome.json` 등 설정 파일)
- Docker/NFS 마운트 환경에서는 `usePolling: true`로 전환 필요
- macOS 파일 디스크립터 한계 초과 시: `ulimit -n 10240`으로 임시 해결

### JSONL 파싱 로직 변경 (Claude 데이터 형식 변경 대응)
- `src/main/sessions/classify.ts` — 상태 분류 기준
- `src/main/sessions/parseJsonl.ts` — 라인별 파싱
- 실제 `.jsonl` 파일 위치: `~/.claude/projects/<project-dir>/<session-id>.jsonl`
- 변경 여부 확인: `tail -5 ~/.claude/projects/<dir>/<session>.jsonl | jq .`

### SVG 캐릭터 수정
- 파일 위치: `src/renderer/src/assets/yorkie/`
- 컴포넌트: `src/renderer/src/components/Yorkie.tsx`
- 4종 모두 `viewBox="0 0 200 200"` 통일 (변경 시 레이아웃 깨짐 주의)

---

## 배포 흐름 (Step 13-14 완료 후)

```
git tag v0.x.0
git push origin v0.x.0
  ↓
GitHub Actions (.github/workflows/release.yml)
  ↓
electron-vite build → electron-builder --mac → .dmg 생성
  ↓
GitHub Releases에 .dmg 업로드
  ↓
homebrew-claude-pet repo의 Cask sha256 갱신 (수동 or 자동)
  ↓
brew install --cask codefug/claude-pet/claude-pet
```

> 코드사이닝 없이 배포된 앱은 첫 실행 시 Gatekeeper 경고가 뜹니다.
> 사용자에게 안내할 명령어: `xattr -cr "/Applications/Claude Pet.app"`
> 또는 Finder에서 우클릭 → 열기 → 확인.

---

## 참고: 로컬 개발 명령어

```bash
npm run dev          # 개발 서버 + Electron 실행
npm run typecheck    # TypeScript 타입 검사
npm run lint         # Biome lint 검사
npm run lint:fix     # Biome lint 자동 수정
npm run format       # Biome 포맷 적용
npm run build:mac    # macOS dmg 빌드
```
