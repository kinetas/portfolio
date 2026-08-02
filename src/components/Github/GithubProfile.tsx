import type { GithubProfile as GithubProfileType } from '../../lib/github'

interface GithubProfileProps {
  username: string
  profile: GithubProfileType | null
  loading: boolean
  error: string | null
}

export default function GithubProfile({ username, profile, loading, error }: GithubProfileProps) {
  const htmlUrl = profile?.html_url || `https://github.com/${encodeURIComponent(username)}`

  return (
    <section className="github-card" aria-label="GitHub 프로필">
      <div className="github-card-header">
        <h3>프로필</h3>
        <a id="githubProfileLink" className="github-link" href={htmlUrl} target="_blank" rel="noreferrer">
          GitHub에서 보기
        </a>
      </div>
      <div id="githubProfileBody" className="github-card-body">
        {error && !profile ? (
          <div className="github-error">
            <strong>불러오기 실패</strong>
            <p>{error}</p>
          </div>
        ) : loading && !profile ? (
          <p className="github-placeholder">불러오는 중...</p>
        ) : profile ? (
          <div className="github-profile">
            <div className="github-avatar-wrap">
              {profile.avatar_url ? <img className="github-avatar" src={profile.avatar_url} alt="GitHub 아바타" loading="lazy" /> : null}
            </div>
            <div className="github-profile-main">
              <div className="github-profile-title">
                <div className="github-profile-name">{profile.name || profile.login || username}</div>
                <div className="github-profile-login">@{profile.login || username}</div>
              </div>
              <div className="github-profile-bio">{profile.bio || '소개가 없습니다.'}</div>
              {(profile.company || profile.location) && (
                <div className="github-profile-meta">
                  {[profile.company, profile.location].filter(Boolean).join(' · ')}
                </div>
              )}
              <div className="github-profile-stats">
                <span>
                  <strong>{profile.public_repos ?? '-'}</strong> Repos
                </span>
                <span>
                  <strong>{profile.followers ?? '-'}</strong> Followers
                </span>
                <span>
                  <strong>{profile.following ?? '-'}</strong> Following
                </span>
              </div>
              {profile.blog ? (
                <div className="github-profile-blog">
                  <a className="github-link" href={profile.blog} target="_blank" rel="noreferrer">
                    {profile.blog}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="github-placeholder">GitHub 아이디를 입력 후 "불러오기"</p>
        )}
      </div>
    </section>
  )
}
