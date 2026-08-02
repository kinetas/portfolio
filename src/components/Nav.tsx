import { SECTION_LINKS, type UseSectionNav } from '../hooks/useSectionNav'

type NavProps = Pick<
  UseSectionNav,
  'activeId' | 'mobileNavOpen' | 'navRef' | 'goToSection' | 'closeMobileNav' | 'toggleMobileNav'
>

function NavLink({
  id,
  label,
  active,
  onClick,
}: {
  id: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <a
      href={`#${id}`}
      className={`nav-link${active ? ' active' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {label}
    </a>
  )
}

export default function Nav({ activeId, mobileNavOpen, navRef, goToSection, closeMobileNav, toggleMobileNav }: NavProps) {
  return (
    <>
      <nav className="main-nav" aria-label="섹션 이동" ref={navRef}>
        <div className="nav-inner">
          <a className="nav-brand" href="#about">
            Web Portfolio
          </a>
          <button
            id="mobileNavToggle"
            className="nav-toggle"
            type="button"
            aria-label="메뉴 열기"
            aria-controls="mobileNavDrawer"
            aria-expanded={mobileNavOpen}
            onClick={toggleMobileNav}
          >
            <span className="nav-toggle-icon" aria-hidden="true">
              ☰
            </span>
          </button>
          <div className="nav-links">
            {SECTION_LINKS.map((link) => (
              <NavLink key={link.id} id={link.id} label={link.label} active={activeId === link.id} onClick={() => goToSection(link.id)} />
            ))}
          </div>
        </div>
      </nav>

      <div className="mobile-nav-overlay" hidden={!mobileNavOpen} onClick={closeMobileNav} />
      <aside
        id="mobileNavDrawer"
        className="mobile-nav-drawer"
        aria-label="모바일 메뉴"
        aria-hidden={!mobileNavOpen}
      >
        <div className="mobile-nav-header">
          <div className="mobile-nav-title">Menu</div>
          <button className="mobile-nav-close" type="button" aria-label="메뉴 닫기" onClick={closeMobileNav}>
            ×
          </button>
        </div>
        <div className="mobile-nav-links" role="navigation" aria-label="섹션 이동">
          {SECTION_LINKS.map((link) => (
            <NavLink key={link.id} id={link.id} label={link.label} active={activeId === link.id} onClick={() => goToSection(link.id)} />
          ))}
        </div>
      </aside>
    </>
  )
}
