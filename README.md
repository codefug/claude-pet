# Claude Pet

macOS 데스크탑 위젯 — 여러 Claude Code 세션의 상태를 화면 모서리에서 한눈에 확인.

![Claude Pet 위젯 스크린샷](docs/screenshot.png)

## 기능

요크셔테리어 캐릭터가 4가지 상태를 표정·포즈로 표현합니다:

| 상태 | 의미 | 표시 |
|------|------|------|
| 🟡 working | Claude가 작업 중 | 키보드 치는 포즈 |
| 🟠 waiting | Permission 승인 대기 | 고개 갸우뚱 + 물음표 |
| 🟢 done | 작업 완료 | 편안하게 누운 포즈 |
| ⚫ aborted | 중단됨 | 처진 귀 + 풀죽은 표정 |

- `~/.claude/projects/*/*.jsonl`을 실시간 감지 (chokidar)
- 마지막 assistant 메시지의 `stop_reason`으로 상태 자동 분류
- 5시간 이내 수정된 세션만 표시
- 우선순위 정렬: waiting > working > done > aborted
- 시스템 트레이에서 Show/Hide/Quit

## 설치

### Homebrew

```bash
brew install --cask https://raw.githubusercontent.com/codefug/claude-pet/main/docs/claude-pet.rb
```

> 첫 실행 시 Gatekeeper 경고가 뜨면 Finder에서 우클릭 → 열기, 또는:
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
npm run dev      # 개발 서버 + Electron
npm run typecheck
npm run lint
```

## 기술 스택

- Electron 39 + electron-vite 5
- React 19 + TypeScript 5
- UnoCSS (Tailwind-compatible)
- chokidar (파일 감시)
- Biome (lint/format)

## 라이선스

MIT
