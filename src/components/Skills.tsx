import { skillGroups } from '../data/skills'

interface SkillsProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function Skills({ sectionRef }: SkillsProps) {
  return (
    <section className="page section" id="skills" ref={sectionRef}>
      <div className="section-header reveal reveal-heading">
        <h2 className="section-title">SKILLS</h2>
      </div>

      <div className="skills-body reveal-group">
        {skillGroups.map((group) => (
          <div className="skills-group reveal" key={group.category}>
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
    </section>
  )
}
