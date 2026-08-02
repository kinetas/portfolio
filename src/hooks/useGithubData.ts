import { useCallback, useEffect, useState } from 'react'
import { fetchGithubJson, formatRelativeTime, type GithubEvent, type GithubProfile, type GithubRepo } from '../lib/github'

const GITHUB_CACHE_KEY = 'portfolio_github_cache_v1'
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000
export const GITHUB_DEFAULT_USERNAME = 'kinetas'

interface CacheEntry {
  fetchedAt: number
  profile: GithubProfile
  repos: GithubRepo[]
  events: GithubEvent[]
}

type CacheMap = Record<string, CacheEntry>

function readCache(): CacheMap {
  try {
    const raw = localStorage.getItem(GITHUB_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeCache(cache: CacheMap) {
  try {
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cache || {}))
  } catch {
    // ignore
  }
}

export type StatusTone = 'info' | 'success' | 'warn' | 'error' | 'muted'

export function useGithubData(username: string = GITHUB_DEFAULT_USERNAME) {
  const [profile, setProfile] = useState<GithubProfile | null>(null)
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [events, setEvents] = useState<GithubEvent[]>([])
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ message: string; tone: StatusTone }>({ message: '', tone: 'info' })

  const load = useCallback(
    async (force = false) => {
      const now = Date.now()
      const cache = readCache()
      const cached = cache[username]
      const isFresh = cached && now - (cached.fetchedAt || 0) < GITHUB_CACHE_TTL_MS

      if (!force && isFresh && cached.profile && cached.repos && cached.events) {
        setProfile(cached.profile)
        setRepos(cached.repos)
        setEvents(cached.events)
        setFetchedAt(cached.fetchedAt)
        setError(null)
        setStatus({ message: `캐시된 데이터 표시 중 · ${formatRelativeTime(cached.fetchedAt)} 업데이트`, tone: 'muted' })
        return
      }

      setLoading(true)
      setProfile(null)
      setRepos([])
      setEvents([])
      setStatus({ message: 'GitHub 데이터를 불러오는 중...', tone: 'info' })

      try {
        const [p, r, e] = await Promise.all([
          fetchGithubJson<GithubProfile>(`https://api.github.com/users/${encodeURIComponent(username)}`),
          fetchGithubJson<GithubRepo[]>(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`),
          fetchGithubJson<GithubEvent[]>(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=20`),
        ])

        const newFetchedAt = Date.now()
        cache[username] = { fetchedAt: newFetchedAt, profile: p, repos: r, events: e }
        writeCache(cache)

        setProfile(p)
        setRepos(r)
        setEvents(e)
        setFetchedAt(newFetchedAt)
        setError(null)
        setStatus({ message: `업데이트 완료 · ${formatRelativeTime(newFetchedAt)}`, tone: 'success' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : '불러오기에 실패했습니다.'

        if (cached && cached.profile && cached.repos && cached.events) {
          setProfile(cached.profile)
          setRepos(cached.repos)
          setEvents(cached.events)
          setFetchedAt(cached.fetchedAt)
          setError(null)
          setStatus({ message: `API 실패로 캐시 표시 · ${msg}`, tone: 'warn' })
        } else {
          setError(msg)
          setStatus({ message: msg, tone: 'error' })
        }
      } finally {
        setLoading(false)
      }
    },
    [username],
  )

  useEffect(() => {
    load(false)
  }, [load])

  const refresh = useCallback(() => load(true), [load])

  return { profile, repos, events, fetchedAt, loading, error, status, refresh }
}
