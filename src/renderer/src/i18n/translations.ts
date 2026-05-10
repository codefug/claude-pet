export type Language = 'en' | 'ko'

export const translations = {
  en: {
    header: {
      title: 'Claude Sessions'
    },
    settings: {
      title: 'Settings',
      system: 'System',
      launchAtLogin: 'Launch at Login',
      opacity: 'Opacity',
      sessionWindow: 'Session Window',
      characterImage: 'Character Image',
      pick: 'Pick',
      reset: 'Reset',
      imageFormats: 'Supports PNG, JPG, GIF, WebP, SVG',
      imageFallback: 'Default Yorkie character used if no image is set',
      language: 'Language'
    },
    status: {
      working: 'working',
      waiting_permission: 'permission',
      done: 'done',
      aborted: 'aborted'
    },
    characterStatus: {
      working: 'Working',
      waiting_permission: 'Permission',
      done: 'Done',
      aborted: 'Aborted'
    },
    sessions: {
      empty: 'No Claude Code sessions yet'
    },
    time: {
      justNow: 'just now',
      minutesAgo: (m: number) => `${m}m ago`,
      hoursAgo: (h: number) => `${h}h ago`,
      yesterday: 'yesterday',
      daysAgo: (d: number) => `${d}d ago`
    }
  },
  ko: {
    header: {
      title: 'Claude Sessions'
    },
    settings: {
      title: '설정',
      system: '시스템',
      launchAtLogin: '로그인 시 자동 시작',
      opacity: '불투명도',
      sessionWindow: '세션 표시 기간',
      characterImage: '캐릭터 이미지',
      pick: '선택',
      reset: '초기화',
      imageFormats: 'PNG, JPG, GIF, WebP, SVG 지원',
      imageFallback: '설정한 이미지가 없으면 기본 요키 캐릭터 사용',
      language: '언어'
    },
    status: {
      working: 'working',
      waiting_permission: 'permission',
      done: 'done',
      aborted: 'aborted'
    },
    characterStatus: {
      working: 'Working',
      waiting_permission: 'Permission',
      done: 'Done',
      aborted: 'Aborted'
    },
    sessions: {
      empty: '아직 Claude Code 세션이 없어요'
    },
    time: {
      justNow: '방금',
      minutesAgo: (m: number) => `${m}분 전`,
      hoursAgo: (h: number) => `${h}시간 전`,
      yesterday: '어제',
      daysAgo: (d: number) => `${d}일 전`
    }
  }
} as const satisfies Record<Language, object>

export type Translations = (typeof translations)['en']
