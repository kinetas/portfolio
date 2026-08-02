import { useSectionNav } from './hooks/useSectionNav'
import Nav from './components/Nav'
import About from './components/About'
import Work from './components/Work'
import Skills from './components/Skills'
import Project from './components/Project'
import GithubSection from './components/Github/GithubSection'
import Contact from './components/Contact'

export default function App() {
  const nav = useSectionNav()

  return (
    <>
      <Nav
        activeId={nav.activeId}
        mobileNavOpen={nav.mobileNavOpen}
        navRef={nav.navRef}
        goToSection={nav.goToSection}
        closeMobileNav={nav.closeMobileNav}
        toggleMobileNav={nav.toggleMobileNav}
      />

      <main className="app-main">
        <About sectionRef={nav.registerSection('about')} />
        <Work sectionRef={nav.registerSection('work')} />
        <Skills sectionRef={nav.registerSection('skills')} />
        <Project sectionRef={nav.registerSection('project')} />
        <GithubSection sectionRef={nav.registerSection('github')} />
        <Contact sectionRef={nav.registerSection('contact')} />
      </main>
    </>
  )
}
