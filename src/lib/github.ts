export interface GithubProfile {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  location: string | null
  company: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
}

export interface GithubRepo {
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  pushed_at: string
  fork: boolean
}

export interface GithubEvent {
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: unknown[]
    action?: string
    pull_request?: { title?: string }
    issue?: { title?: string }
    ref_type?: string
    ref?: string
  }
}

export async function fetchGithubJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })

  if (!res.ok) {
    const reset = res.headers.get('x-ratelimit-reset')
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (res.status === 404) throw new Error('사용자를 찾을 수 없습니다. (404)')
    if (res.status === 403 && remaining === '0') {
      const resetMs = reset ? parseInt(reset, 10) * 1000 : null
      const when = resetMs ? new Date(resetMs).toLocaleTimeString('ko-KR') : '잠시 후'
      throw new Error(`GitHub API 호출 제한에 걸렸습니다. ${when} 이후 다시 시도해주세요.`)
    }
    throw new Error(`GitHub API 요청 실패 (${res.status})`)
  }
  return (await res.json()) as T
}

export function formatRelativeTime(input: string | number | Date): string {
  const t = input instanceof Date ? input.getTime() : new Date(input).getTime()
  if (!t || Number.isNaN(t)) return ''

  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 10) return '방금 전'
  if (sec < 60) return `${sec}초 전`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day < 14) return `${day}일 전`
  return new Date(t).toLocaleDateString('ko-KR')
}

export function summarizeGithubEvent(ev: GithubEvent): string {
  const type = ev?.type || ''
  const repo = ev?.repo?.name || ''
  const payload = ev?.payload || {}

  if (type === 'PushEvent') {
    const n = Array.isArray(payload.commits) ? payload.commits.length : 0
    return `${repo}에 커밋 ${n}개 푸시`
  }
  if (type === 'PullRequestEvent') {
    const action = payload.action || '업데이트'
    const title = payload.pull_request?.title || ''
    return `${repo} PR ${action}${title ? ` · ${title}` : ''}`
  }
  if (type === 'IssuesEvent') {
    const action = payload.action || '업데이트'
    const title = payload.issue?.title || ''
    return `${repo} Issue ${action}${title ? ` · ${title}` : ''}`
  }
  if (type === 'CreateEvent') {
    const refType = payload.ref_type || '항목'
    const ref = payload.ref ? `(${payload.ref})` : ''
    return `${repo}에 ${refType} 생성 ${ref}`.trim()
  }
  if (type === 'WatchEvent') {
    return `${repo} Star`
  }
  return `${repo} · ${type}`.trim()
}
