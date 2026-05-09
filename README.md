# Claude Pet

macOS 데스크탑 위젯 — 여러 Claude Code 세션의 상태를 화면 모서리에서 한눈에 확인.

![Claude Pet 위젯 스크린샷](docs/screenshot.png)

## 기능

세션 카드 하나가 Claude Code 프로젝트 하나를 나타냅니다. 4가지 상태를 색상과 캐릭터 이미지로 구분합니다.

| 상태 | 의미 | 표시 |
|------|------|------|
| 🟡 working | Claude가 작업 중 | 노란색 |
| 🟠 permission | Permission 승인 대기 | 주황색 |
| 🟢 done | 작업 완료 | 초록색 |
| ⚫ aborted | 5분 이상 응답 없음 | 회색 |
| 🟣 interrupted | 사용자가 직접 중단 | 보라색 |

- `~/.claude/projects/*/*.jsonl` 실시간 감시 (chokidar)
- 마지막 메시지의 `stop_reason` 및 tool 상태로 세션 상태 자동 분류
- 기본 5시간 이내 수정된 세션만 표시 (설정에서 변경 가능)
- 우선순위 정렬: permission > working > done > aborted
- `waiting_permission` 세션에 호버 시 **working으로 무시** 버튼 표시
- 상태별 캐릭터 이미지를 사용자 이미지로 교체 가능
- 시스템 트레이 아이콘에서 Show / Hide / Quit

## 설치

### Homebrew (권장)

```bash
brew tap codefug/cask
brew install --cask claude-pet
```

> 첫 실행 시 Gatekeeper 경고가 뜨면:
> ```bash
> xattr -cr /Applications/Claude\ Pet.app
> ```

### 소스에서 빌드

Node.js 20+ 필요.

```bash
git clone https://github.com/codefug/claude-pet.git
cd claude-pet
npm install
npm run build:mac
# dist/claude-pet-x.x.x.dmg 생성됨
```

## 개발

```bash
npm install
npm run dev        # electron-vite dev 서버 + Electron
npm run typecheck  # TS 타입 검사
npm run lint       # Biome 린트
```

### 릴리즈

`package.json`의 `version`을 올린 뒤:

```bash
npm run release
# package.json 버전을 읽어 git tag 생성 후 origin에 push
# GitHub Actions가 DMG 빌드 및 Homebrew Cask 자동 업데이트
```

## 기술 스택

- Electron 39 + electron-vite 5
- React 19 + TypeScript 5
- UnoCSS
- chokidar 5 (파일 감시)
- Biome (lint/format)

## 라이선스

MIT
