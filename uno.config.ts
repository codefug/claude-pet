import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Tailwind/Windi CSS 호환 유틸리티 클래스
    presetAttributify() // <div text-sm font-bold> 방식도 가능
  ]
})
