import { useCallback, useEffect, useRef, useState } from 'react'

export const SECTION_LINKS = [
  { id: 'about', label: 'ABOUT ME' },
  { id: 'work', label: 'WORK' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'project', label: 'PROJECT' },
  { id: 'github', label: 'GITHUB' },
  { id: 'contact', label: 'CONTACT' },
] as const

const SECTION_IDS = SECTION_LINKS.map((l) => l.id)
const MOBILE_BREAKPOINT_PX = 768

function isMobileViewport() {
  return window.matchMedia && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
}

export function useSectionNav() {
  const [activeId, setActiveId] = useState<string>(SECTION_IDS[0])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const sectionRefs = useRef<Partial<Record<string, HTMLElement | null>>>({})
  const refSetters = useRef<Partial<Record<string, (el: HTMLElement | null) => void>>>({})

  const registerSection = useCallback((id: string) => {
    if (!refSetters.current[id]) {
      refSetters.current[id] = (el: HTMLElement | null) => {
        sectionRefs.current[id] = el
      }
    }
    return refSetters.current[id]!
  }, [])

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const openMobileNav = useCallback(() => {
    if (isMobileViewport()) setMobileNavOpen(true)
  }, [])
  const toggleMobileNav = useCallback(() => {
    if (!isMobileViewport()) return
    setMobileNavOpen((v) => !v)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', mobileNavOpen)
  }, [mobileNavOpen])

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [closeMobileNav])

  const getHeaderOffset = useCallback(() => {
    const h = navRef.current?.offsetHeight ?? 0
    return h + 12
  }, [])

  const scrollToSection = useCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => {
      const el = sectionRefs.current[id]
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset()
      window.scrollTo({ top: Math.max(0, y), behavior })
    },
    [getHeaderOffset],
  )

  const suppressScrollSpyRef = useRef(false)
  const suppressTimerRef = useRef<number | null>(null)

  const goToSection = useCallback(
    (id: string) => {
      closeMobileNav()
      suppressScrollSpyRef.current = true
      if (suppressTimerRef.current) window.clearTimeout(suppressTimerRef.current)

      scrollToSection(id, 'smooth')
      history.replaceState(null, '', `#${id}`)
      setActiveId(id)

      const clearSuppress = () => {
        suppressScrollSpyRef.current = false
        window.removeEventListener('scrollend', clearSuppress)
      }
      window.addEventListener('scrollend', clearSuppress, { once: true })
      // Fallback for browsers without `scrollend` (Safari < 17.4) or if the
      // scroll is interrupted before firing it.
      suppressTimerRef.current = window.setTimeout(clearSuppress, 900)
    },
    [closeMobileNav, scrollToSection],
  )

  // Position-based scrollspy: pick the last section whose top has crossed
  // the header line. Ratio-based IntersectionObserver logic penalized tall
  // sections (e.g. GITHUB, which stacks three cards in one column) because
  // their intersection ratio rarely climbed high enough to "win" against
  // shorter neighboring sections.
  useEffect(() => {
    let ticking = false

    const computeActive = () => {
      const offset = getHeaderOffset() + 1
      let current: string = SECTION_IDS[0]

      for (const id of SECTION_IDS) {
        const el = sectionRefs.current[id]
        if (!el) continue
        if (el.getBoundingClientRect().top - offset <= 0) {
          current = id
        } else {
          break
        }
      }

      const doc = document.documentElement
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2
      if (atBottom) current = SECTION_IDS[SECTION_IDS.length - 1]

      setActiveId(current)
    }

    const onScroll = () => {
      if (suppressScrollSpyRef.current) return
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        computeActive()
        ticking = false
      })
    }

    const onResize = () => {
      if (!isMobileViewport()) closeMobileNav()
      computeActive()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    computeActive()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [getHeaderOffset, closeMobileNav])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const raw = (location.hash || '').slice(1)
      const id = raw ? decodeURIComponent(raw) : ''
      if (id && sectionRefs.current[id]) {
        scrollToSection(id, 'auto')
        setActiveId(id)
      } else {
        setActiveId(SECTION_IDS[0])
      }
    })
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    activeId,
    mobileNavOpen,
    navRef,
    registerSection,
    goToSection,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  }
}

export type UseSectionNav = ReturnType<typeof useSectionNav>
