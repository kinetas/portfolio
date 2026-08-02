import { formatRelativeTime, summarizeGithubEvent, type GithubEvent } from '../../lib/github'

interface GithubActivityProps {
  events: GithubEvent[]
  fetchedAt: number | null
}

export default function GithubActivity({ events, fetchedAt }: GithubActivityProps) {
  const list = Array.isArray(events) ? events.slice(0, 5) : []

  return (
    <section className="github-card" aria-label="최근 활동">
      <div className="github-card-header">
        <h3>최근 활동</h3>
        <span className="github-meta">{list.length > 0 ? `${list.length}개 표시 · ${formatRelativeTime(fetchedAt ?? 0)} 업데이트` : ''}</span>
      </div>
      <div className="github-card-body">
        {list.length === 0 ? (
          <p className="github-placeholder">최근 활동이 없거나 GitHub에서 제공되지 않습니다.</p>
        ) : (
          <ul className="github-activity">
            {list.map((ev, i) => {
              const repo = ev?.repo?.name || ''
              const repoUrl = repo ? `https://github.com/${repo}` : '#'
              const when = ev?.created_at ? formatRelativeTime(ev.created_at) : ''
              const summary = summarizeGithubEvent(ev)
              return (
                <li className="github-activity-item" key={`${repo}-${ev.created_at}-${i}`}>
                  <a className="github-activity-link" href={repoUrl} target="_blank" rel="noreferrer">
                    <span className="github-activity-summary">{summary}</span>
                    <span className="github-activity-meta">{when}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
