import { spawn } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'

const demoPath = {
  vue2: fileURLToPath(new URL('./subApp', import.meta.url)),
  main: fileURLToPath(new URL('./mainApp', import.meta.url))
}

Object.values(demoPath).forEach(path => {
  spawn(`cd ${path} && pnpm dev`, { stdio: 'overlapped', shell: true })
})