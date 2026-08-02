import { useMemo } from 'react'
import { formatRelativeTime, type GithubRepo } from '../../lib/github'

interface GithubRepoListProps {
  repos: GithubRepo[]
  fetchedAt: number | null
}

export default function GithubRepoList({ repos, fetchedAt }: GithubRepoListProps) {
  const top = useMemo(() => {
    const list = Array.isArray(repos) ? repos.filter((r) => r && !r.fork) : []
    const sorted = list
      .slice()
      .sort((a, b) => (new Date(b.pushed_at).getTime() || 0) - (new Date(a.pushed_at).getTime() || 0))
    return sorted.slice(0, 5)
  }, [repos])

  return (
    <section className="github-card" aria-label="레포지토리">
      <div className="github-card-header">
        <h3>최근 업데이트 레포</h3>
        <span className="github-meta">{top.length > 0 ? `${top.length}개 표시 · ${formatRelativeTime(fetchedAt ?? 0)} 업데이트` : ''}</span>
      </div>
      <div className="github-card-body">
        {top.length === 0 ? (
          <p className="github-placeholder">표시할 레포가 없습니다.</p>
        ) : (
          <div className="github-repo-list">
            {top.map((repo) => {
              const pushed = repo.pushed_at ? formatRelativeTime(repo.pushed_at) : ''
              return (
                <a className="github-repo" href={repo.html_url || '#'} target="_blank" rel="noreferrer" key={repo.full_name || repo.name}>
                  <div className="github-repo-top">
                    <div className="github-repo-name">{repo.full_name || repo.name}</div>
                    <div className="github-repo-badges">
                      {repo.language ? <span className="github-badge">{repo.language}</span> : null}
                      <span className="github-badge">★ {repo.stargazers_count ?? 0}</span>
                    </div>
                  </div>
                  {repo.description ? <div className="github-repo-desc">{repo.description}</div> : null}
                  {pushed ? <div className="github-repo-meta">마지막 푸시 · {pushed}</div> : null}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
