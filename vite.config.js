import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/4thYearOfLove/',   // <- your repo name, with slashes on both sides
})