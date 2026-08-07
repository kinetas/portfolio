import { useState } from 'react'
import { skillGroups, featuredSkills } from '../data/skills'

interface SkillsProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function Skills({ sectionRef }: SkillsProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="page section" id="skills" ref={sectionRef}>
      <div className="section-header reveal reveal-heading">
        <h2 className="section-title">SKILLS</h2>
      </div>

      <div className="skills-body reveal-group">
        <div className="skills-group reveal">
          <h3 className="skills-category">AI &amp; 데이터</h3>
          <div className="skills-badges">
            {featuredSkills.map((item) => (
              <span className="badge badge-featured" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="skills-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? '전체 스킬 접기 −' : '전체 스킬 상세보기 +'}
        </button>

        <div className={`skills-detail${expanded ? ' skills-detail--open' : ''}`}>
          {skillGroups.map((group) => (
            <div className="skills-group" key={group.category}>
              <h3 className="skills-category">{group.category}</h3>
              <div className="skills-badges">
                {group.items.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
