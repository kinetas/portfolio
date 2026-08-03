import { certs } from '../data/certs'

interface WorkProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function Work({ sectionRef }: WorkProps) {
  return (
    <section className="page section" id="work" ref={sectionRef}>
      <div className="section-header reveal reveal-heading">
        <h2 className="section-title">WORK</h2>
      </div>

      <div className="work-body reveal-group">
        <div className="work-block reveal">
          <h3 className="work-block-title">학력</h3>
          <div className="education-block">
            <div className="education-degree">학사</div>
            <div className="education-school">계명대학교</div>
            <div className="education-year">2020.03 — 2026.02</div>
          </div>
        </div>

        <div className="work-block reveal">
          <h3 className="work-block-title">자격증</h3>
          <ul className="cert-list" id="certList">
            {certs.map((cert) => (
              <li className="cert-item" key={cert.name}>
                <span className="cert-name">{cert.name}</span>
                <span className="cert-org">{cert.org}</span>
                <span className="cert-date">{cert.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="work-block reveal">
          <h3 className="work-block-title">교육</h3>
          <div className="education-block">
            <div className="education-degree">공공데이터E 풀스택-개발자</div>
            <div className="education-school">대구IT아카데미</div>
            <div className="education-year">2020.02.24 — 현재진행중(예상 : 2026.08.12)</div>
          </div>
        </div>
      </div>
    </section>
  )
}
