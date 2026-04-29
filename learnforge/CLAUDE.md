# LearnForge — Context for AI Assistants

## Architecture
SPA, React 18 + Vite + TypeScript + Tailwind CSS (class dark mode)

## API Architecture
Direct connection to NVIDIA NIM API (OpenAI-compatible) at `https://integrate.api.nvidia.com/v1`.
Local dev: Uses `.env.local` for `VITE_NVIDIA_API_KEY`.

## Agents (`/src/agents`)
| File | Purpose |
|---|---|
| `roadmapAgent.ts` | Generates Day[] via NVIDIA NIM, pre-loads quizzes + resources + MNC projects |
| `quizAgent.ts` | Generates 5 MCQs per day, cached per day |
| `qaAgent.ts` | Fresh AI call per question, returns raw markdown |
| `resourceAgent.ts` | DuckDuckGo Instant Answer API (no key needed), 24h cache |
| `mncProjectAgent.ts` | Generates 3 FAANG-style project specs, cached per config |

## State (`/src/store`)
| Store | Persisted | Key |
|---|---|---|
| `roadmapStore` | LZ-string compressed | `learnforge:roadmap` |
| `progressStore` | JSON | `learnforge:progress` |
| `prefsStore` | JSON | `learnforge:prefs` |

## Storage
- `localStorage` with `lz-string` compression for roadmap
- All keys prefixed `learnforge:`
- `sessionStorage` for Pomodoro timer state per day

## Prompt versions
`src/utils/promptVersions.ts` — bump `PROMPT_VERSION` when changing any agent prompt to invalidate cache.

## Build order
Config form → Roadmap generation → Dashboard → DayView → Quiz → Q&A → Export

## Key utilities
- `src/utils/pdfExport.ts` — jsPDF + html2canvas
- `src/utils/markdownExport.ts` — blob download
- `src/utils/share.ts` — LZ-string URL encoding/decoding
- `src/utils/cache.ts` — read/write localStorage cache with LZ compression
- `src/utils/storageGuard.ts` — quota monitoring, pruning
- `src/utils/formatters.ts` — time, date, string formatting

## Deploy
- Frontend: Cloudflare Pages (build: `npm run build`, output: `dist`)
- Set `VITE_PROXY_URL` to `https://integrate.api.nvidia.com/v1/chat/completions`
- Set `VITE_NVIDIA_API_KEY` to your NVIDIA API Key
