/**
 * 포트폴리오 소개 페이지
 */

const MOBILE_BREAKPOINT_PX = 768;

function isMobileViewport() {
    return window.matchMedia && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
}

// ===== GitHub API 연동 =====
const GITHUB_CACHE_KEY = 'portfolio_github_cache_v1';
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;
const GITHUB_DEFAULT_USERNAME = 'kinetas';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGithubPage();
});

// ===== 네비게이션 =====
function initNavigation() {
    const links = Array.from(document.querySelectorAll('.nav-link'))
        .filter(a => (a.getAttribute('href') || '').startsWith('#'));

    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileClose = document.getElementById('mobileNavClose');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const mobileDrawer = document.getElementById('mobileNavDrawer');

    const openMobileNav = () => {
        if (!isMobileViewport()) return;
        document.body.classList.add('mobile-nav-open');
        if (mobileOverlay) mobileOverlay.hidden = false;
        if (mobileDrawer) mobileDrawer.setAttribute('aria-hidden', 'false');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMobileNav = () => {
        document.body.classList.remove('mobile-nav-open');
        if (mobileOverlay) mobileOverlay.hidden = true;
        if (mobileDrawer) mobileDrawer.setAttribute('aria-hidden', 'true');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    };

    // 초기 상태
    closeMobileNav();

    mobileToggle?.addEventListener('click', () => {
        if (!isMobileViewport()) return;
        if (document.body.classList.contains('mobile-nav-open')) closeMobileNav();
        else openMobileNav();
    });
    mobileClose?.addEventListener('click', () => closeMobileNav());
    mobileOverlay?.addEventListener('click', () => closeMobileNav());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
    });

    const getHeaderOffset = () => {
        const nav = document.querySelector('.main-nav');
        const h2 = nav ? nav.offsetHeight : 0;
        return h2 + 12;
    };

    const scrollToSection = (el, behavior = 'smooth') => {
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
        window.scrollTo({ top: Math.max(0, y), behavior });
    };

    const setActive = (id) => {
        links.forEach(l => {
            const href = l.getAttribute('href') || '';
            l.classList.toggle('active', href === `#${id}`);
        });
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            const id = decodeURIComponent(href.slice(1));
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            closeMobileNav();
            scrollToSection(target, 'smooth');
            history.replaceState(null, '', `#${id}`);
            setActive(id);
        });
    });

    const sectionIds = links
        .map(l => decodeURIComponent((l.getAttribute('href') || '').slice(1)))
        .filter(Boolean);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
            if (visible?.target?.id) setActive(visible.target.id);
        }, {
            root: null,
            threshold: [0.12, 0.25, 0.4, 0.6],
            rootMargin: `-${getHeaderOffset()}px 0px -60% 0px`
        });

        sections.forEach(s => observer.observe(s));

        window.addEventListener('resize', () => {
            if (!isMobileViewport()) closeMobileNav();
            observer.disconnect();
            sections.forEach(s => observer.observe(s));
        });
    }

    requestAnimationFrame(() => {
        const raw = (location.hash || '').slice(1);
        const id = raw ? decodeURIComponent(raw) : '';
        const target = id ? document.getElementById(id) : null;
        if (target) {
            scrollToSection(target, 'auto');
            setActive(id);
        } else if (sections[0]?.id) {
            setActive(sections[0].id);
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== GitHub 페이지 =====
function initGithubPage() {
    const input = document.getElementById('githubUsername');
    if (!input) return;

    const refreshBtn = document.getElementById('githubRefreshBtn');

    input.value = GITHUB_DEFAULT_USERNAME;

    const run = async (force = false) => {
        await loadAndRenderGithub(GITHUB_DEFAULT_USERNAME, { force });
    };

    refreshBtn?.addEventListener('click', () => run(true));
    run(false);
}

function readGithubCache() {
    try {
        const raw = localStorage.getItem(GITHUB_CACHE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeGithubCache(cache) {
    try {
        localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cache || {}));
    } catch {
        // ignore
    }
}

function setGithubStatus(message, tone = 'info') {
    const el = document.getElementById('githubStatus');
    if (!el) return;
    el.textContent = message || '';
    el.dataset.tone = tone;
}

function setGithubLoading(isLoading) {
    const page = document.getElementById('page-github');
    if (!page) return;
    page.classList.toggle('github-loading', !!isLoading);
}

function renderGithubPlaceholder() {
    const profile = document.getElementById('githubProfileBody');
    const repos = document.getElementById('githubReposBody');
    const act = document.getElementById('githubActivityBody');
    if (profile) profile.innerHTML = '<p class="github-placeholder">불러오는 중...</p>';
    if (repos) repos.innerHTML = '<p class="github-placeholder">불러오는 중...</p>';
    if (act) act.innerHTML = '<p class="github-placeholder">불러오는 중...</p>';
}

async function loadAndRenderGithub(username, { force = false } = {}) {
    const now = Date.now();
    const cache = readGithubCache();
    const cached = cache[username];
    const isFresh = cached && typeof cached === 'object' && (now - (cached.fetchedAt || 0) < GITHUB_CACHE_TTL_MS);

    if (!force && isFresh && cached.profile && cached.repos && cached.events) {
        renderGithubAll({ username, profile: cached.profile, repos: cached.repos, events: cached.events, fetchedAt: cached.fetchedAt });
        setGithubStatus(`캐시된 데이터 표시 중 · ${formatRelativeTime(cached.fetchedAt)} 업데이트`, 'muted');
        return;
    }

    setGithubLoading(true);
    renderGithubPlaceholder();
    setGithubStatus('GitHub 데이터를 불러오는 중...', 'info');

    try {
        const [profile, repos, events] = await Promise.all([
            fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
            fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`),
            fetchGithubJson(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=20`)
        ]);

        cache[username] = { fetchedAt: Date.now(), profile, repos, events };
        writeGithubCache(cache);

        renderGithubAll({ username, profile, repos, events, fetchedAt: cache[username].fetchedAt });
        setGithubStatus(`업데이트 완료 · ${formatRelativeTime(cache[username].fetchedAt)}`, 'success');
    } catch (err) {
        const msg = (err && err.message) ? err.message : '불러오기에 실패했습니다.';

        if (cached && cached.profile && cached.repos && cached.events) {
            renderGithubAll({ username, profile: cached.profile, repos: cached.repos, events: cached.events, fetchedAt: cached.fetchedAt });
            setGithubStatus(`API 실패로 캐시 표시 · ${msg}`, 'warn');
        } else {
            renderGithubError(msg);
            setGithubStatus(msg, 'error');
        }
    } finally {
        setGithubLoading(false);
    }
}

async function fetchGithubJson(url) {
    const res = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github+json'
        }
    });

    if (!res.ok) {
        const reset = res.headers.get('x-ratelimit-reset');
        const remaining = res.headers.get('x-ratelimit-remaining');
        if (res.status === 404) throw new Error('사용자를 찾을 수 없습니다. (404)');
        if (res.status === 403 && remaining === '0') {
            const resetMs = reset ? (parseInt(reset, 10) * 1000) : null;
            const when = resetMs ? new Date(resetMs).toLocaleTimeString('ko-KR') : '잠시 후';
            throw new Error(`GitHub API 호출 제한에 걸렸습니다. ${when} 이후 다시 시도해주세요.`);
        }
        throw new Error(`GitHub API 요청 실패 (${res.status})`);
    }
    return await res.json();
}

function renderGithubError(message) {
    const profile = document.getElementById('githubProfileBody');
    const repos = document.getElementById('githubReposBody');
    const act = document.getElementById('githubActivityBody');
    const html = `<div class="github-error"><strong>불러오기 실패</strong><p>${escapeHtml(message || '')}</p></div>`;
    if (profile) profile.innerHTML = html;
    if (repos) repos.innerHTML = html;
    if (act) act.innerHTML = html;
}

function renderGithubAll({ username, profile, repos, events, fetchedAt }) {
    renderGithubProfile(username, profile);
    renderGithubRepos(repos, fetchedAt);
    renderGithubActivity(events, fetchedAt);
}

function renderGithubProfile(username, profile) {
    const body = document.getElementById('githubProfileBody');
    const link = document.getElementById('githubProfileLink');
    if (!body) return;

    const htmlUrl = profile?.html_url || `https://github.com/${encodeURIComponent(username)}`;
    if (link) link.href = htmlUrl;

    const name = profile?.name || profile?.login || username;
    const bio = profile?.bio || '소개가 없습니다.';
    const avatar = profile?.avatar_url || '';
    const location = profile?.location || '';
    const company = profile?.company || '';
    const blog = profile?.blog || '';

    const metaParts = [];
    if (company) metaParts.push(escapeHtml(company));
    if (location) metaParts.push(escapeHtml(location));

    body.innerHTML = `
        <div class="github-profile">
            <div class="github-avatar-wrap">
                ${avatar ? `<img class="github-avatar" src="${avatar}" alt="GitHub 아바타" loading="lazy">` : ''}
            </div>
            <div class="github-profile-main">
                <div class="github-profile-title">
                    <div class="github-profile-name">${escapeHtml(name)}</div>
                    <div class="github-profile-login">@${escapeHtml(profile?.login || username)}</div>
                </div>
                <div class="github-profile-bio">${escapeHtml(bio)}</div>
                ${metaParts.length ? `<div class="github-profile-meta">${metaParts.join(' · ')}</div>` : ''}
                <div class="github-profile-stats">
                    <span><strong>${profile?.public_repos ?? '-'}</strong> Repos</span>
                    <span><strong>${profile?.followers ?? '-'}</strong> Followers</span>
                    <span><strong>${profile?.following ?? '-'}</strong> Following</span>
                </div>
                ${blog ? `<div class="github-profile-blog"><a class="github-link" href="${escapeHtml(blog)}" target="_blank" rel="noreferrer">${escapeHtml(blog)}</a></div>` : ''}
            </div>
        </div>
    `;
}

function renderGithubRepos(repos, fetchedAt) {
    const body = document.getElementById('githubReposBody');
    const meta = document.getElementById('githubRepoMeta');
    if (!body) return;

    const list = Array.isArray(repos) ? repos.filter(r => r && !r.fork) : [];
    const sorted = list.slice().sort((a, b) => (new Date(b.pushed_at).getTime() || 0) - (new Date(a.pushed_at).getTime() || 0));
    const top = sorted.slice(0, 8);

    if (meta) meta.textContent = `${top.length}개 표시 · ${formatRelativeTime(fetchedAt)} 업데이트`;

    if (top.length === 0) {
        body.innerHTML = '<p class="github-placeholder">표시할 레포가 없습니다.</p>';
        return;
    }

    body.innerHTML = `
        <div class="github-repo-list">
            ${top.map(repo => {
                const name = repo?.name || '';
                const full = repo?.full_name || name;
                const desc = repo?.description || '';
                const lang = repo?.language || '';
                const stars = repo?.stargazers_count ?? 0;
                const url = repo?.html_url || '#';
                const pushed = repo?.pushed_at ? formatRelativeTime(repo.pushed_at) : '';

                return `
                    <a class="github-repo" href="${url}" target="_blank" rel="noreferrer">
                        <div class="github-repo-top">
                            <div class="github-repo-name">${escapeHtml(full)}</div>
                            <div class="github-repo-badges">
                                ${lang ? `<span class="github-badge">${escapeHtml(lang)}</span>` : ''}
                                <span class="github-badge">★ ${stars}</span>
                            </div>
                        </div>
                        ${desc ? `<div class="github-repo-desc">${escapeHtml(desc)}</div>` : ''}
                        ${pushed ? `<div class="github-repo-meta">마지막 푸시 · ${escapeHtml(pushed)}</div>` : ''}
                    </a>
                `;
            }).join('')}
        </div>
    `;
}

function renderGithubActivity(events, fetchedAt) {
    const body = document.getElementById('githubActivityBody');
    const meta = document.getElementById('githubActivityMeta');
    if (!body) return;

    const list = Array.isArray(events) ? events.slice(0, 12) : [];
    if (meta) meta.textContent = `${list.length}개 표시 · ${formatRelativeTime(fetchedAt)} 업데이트`;

    if (list.length === 0) {
        body.innerHTML = '<p class="github-placeholder">최근 활동이 없거나 GitHub에서 제공되지 않습니다.</p>';
        return;
    }

    body.innerHTML = `
        <ul class="github-activity">
            ${list.map(ev => {
                const repo = ev?.repo?.name || '';
                const repoUrl = repo ? `https://github.com/${repo}` : '#';
                const when = ev?.created_at ? formatRelativeTime(ev.created_at) : '';
                const summary = summarizeGithubEvent(ev);

                return `
                    <li class="github-activity-item">
                        <a class="github-activity-link" href="${repoUrl}" target="_blank" rel="noreferrer">
                            <span class="github-activity-summary">${escapeHtml(summary)}</span>
                            <span class="github-activity-meta">${escapeHtml(when)}</span>
                        </a>
                    </li>
                `;
            }).join('')}
        </ul>
    `;
}

function summarizeGithubEvent(ev) {
    const type = ev?.type || '';
    const repo = ev?.repo?.name || '';
    const payload = ev?.payload || {};

    if (type === 'PushEvent') {
        const n = Array.isArray(payload.commits) ? payload.commits.length : 0;
        return `${repo}에 커밋 ${n}개 푸시`;
    }
    if (type === 'PullRequestEvent') {
        const action = payload.action || '업데이트';
        const title = payload.pull_request?.title || '';
        return `${repo} PR ${action}${title ? ` · ${title}` : ''}`;
    }
    if (type === 'IssuesEvent') {
        const action = payload.action || '업데이트';
        const title = payload.issue?.title || '';
        return `${repo} Issue ${action}${title ? ` · ${title}` : ''}`;
    }
    if (type === 'CreateEvent') {
        const refType = payload.ref_type || '항목';
        const ref = payload.ref ? `(${payload.ref})` : '';
        return `${repo}에 ${refType} 생성 ${ref}`.trim();
    }
    if (type === 'WatchEvent') {
        return `${repo} Star`;
    }
    return `${repo} · ${type}`.trim();
}

function formatRelativeTime(input) {
    const t = (input instanceof Date) ? input.getTime() : new Date(input).getTime();
    if (!t || Number.isNaN(t)) return '';

    const diff = Date.now() - t;
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return '방금 전';
    if (sec < 60) return `${sec}초 전`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    const day = Math.floor(hour / 24);
    if (day < 14) return `${day}일 전`;
    return new Date(t).toLocaleDateString('ko-KR');
}
