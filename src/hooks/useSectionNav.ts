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

  const goToSection = useCallback(
    (id: string) => {
      closeMobileNav()
      scrollToSection(id, 'smooth')
      history.replaceState(null, '', `#${id}`)
      setActiveId(id)
    },
    [closeMobileNav, scrollToSection],
  )

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    let observer: IntersectionObserver | null = null

    const observeAll = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0]
          if (visible?.target?.id) setActiveId(visible.target.id)
        },
        {
          root: null,
          threshold: [0.12, 0.25, 0.4, 0.6],
          rootMargin: `-${getHeaderOffset()}px 0px -60% 0px`,
        },
      )
      SECTION_IDS.forEach((id) => {
        const el = sectionRefs.current[id]
        if (el) observer!.observe(el)
      })
    }

    observeAll()

    const onResize = () => {
      if (!isMobileViewport()) closeMobileNav()
      observeAll()
    }
    window.addEventListener('resize', onResize)

    return () => {
      observer?.disconnect()
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
