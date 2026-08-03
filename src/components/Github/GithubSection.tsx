import { GITHUB_DEFAULT_USERNAME, useGithubData } from '../../hooks/useGithubData'
import GithubProfile from './GithubProfile'
import GithubRepoList from './GithubRepoList'
import GithubActivity from './GithubActivity'

interface GithubSectionProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function GithubSection({ sectionRef }: GithubSectionProps) {
  const { profile, repos, events, fetchedAt, loading, error, status, refresh } = useGithubData(GITHUB_DEFAULT_USERNAME)

  return (
    <section className="page section" id="github" ref={sectionRef}>
      <div className="page-header reveal reveal-heading">
        <h2>GITHUB</h2>
        <div className="github-controls">
          <div className="github-actions">
            <button id="githubRefreshBtn" className="modal-btn secondary" type="button" onClick={refresh} disabled={loading}>
              새로고침
            </button>
          </div>
          <div id="githubStatus" className="github-status" data-tone={status.tone} aria-live="polite">
            {status.message}
          </div>
        </div>
      </div>

      <div className="github-grid reveal-group">
        <GithubProfile username={GITHUB_DEFAULT_USERNAME} profile={profile} loading={loading} error={error} />
        <GithubRepoList repos={repos} fetchedAt={fetchedAt} />
        <GithubActivity events={events} fetchedAt={fetchedAt} />
      </div>
    </section>
  )
}
