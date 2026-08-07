import { useState } from 'react'
import { skillGroups, featuredSkillGroups, type SkillGroup } from '../data/skills'

interface SkillsProps {
  sectionRef: (el: HTMLElement | null) => void
}

function SkillGroupList({ groups, badgeClassName }: { groups: SkillGroup[]; badgeClassName?: string }) {
  return (
    <>
      {groups.map((group) => (
        <div className="skills-group" key={group.category}>
          <h3 className="skills-category">{group.category}</h3>
          <div className="skills-badges">
            {group.items.map((item) => (
              <span className={`badge${badgeClassName ? ` ${badgeClassName}` : ''}`} key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default function Skills({ sectionRef }: SkillsProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="page section" id="skills" ref={sectionRef}>
      <div className="section-header reveal reveal-heading">
        <h2 className="section-title">SKILLS</h2>
      </div>

      <div className="skills-body reveal-group">
        <div className="reveal">
          <p className="skills-subtitle">AI &amp; 데이터</p>
          <div className="skills-groups">
            <SkillGroupList groups={featuredSkillGroups} badgeClassName="badge-featured" />
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
          <p className="skills-subtitle">전체</p>
          <div className="skills-groups">
            <SkillGroupList groups={skillGroups} />
          </div>
        </div>
      </div>
    </section>
  )
}
