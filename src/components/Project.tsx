import { projects } from '../data/projects'

interface ProjectProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function Project({ sectionRef }: ProjectProps) {
  return (
    <section className="page section" id="project" ref={sectionRef}>
      <div className="page-header reveal reveal-heading">
        <h2>PROJECT</h2>
        <h3>참여 프로젝트</h3>
      </div>
      <div className="project-grid reveal-group">
        {projects.map((project) => (
          <a className="project-card reveal-card" href={project.href} target="_blank" rel="noreferrer" key={project.title}>
            <div className="project-thumb-wrap">
              <img className="project-thumb" src={project.thumb} alt={project.title} loading="lazy" />
            </div>
            <div className="project-card-body">
              <h3 className="project-card-title">{project.title}</h3>
              <p className="project-card-role">{project.role}</p>
              <p className="project-card-desc">{project.desc}</p>
              <p className="project-card-date">{project.date}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
