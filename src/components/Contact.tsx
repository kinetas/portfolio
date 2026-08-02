import { contact } from '../data/contact'

interface ContactProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function Contact({ sectionRef }: ContactProps) {
  return (
    <section className="page section" id="contact" ref={sectionRef}>
      <div className="page-header">
        <h2>CONTACT</h2>
        <p className="page-subtitle">협업/채용/프로젝트 문의는 아래로 연락 주세요.</p>
      </div>
      <div className="canvas-area contact-card" id="contactCard">
        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-label">Email</div>
            <div className="contact-value">
              <a className="contact-link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-label">GitHub</div>
            <div className="contact-value">
              <a className="contact-link" href={contact.githubUrl} target="_blank" rel="noreferrer">
                {contact.github}
              </a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-label">Phone</div>
            <div className="contact-value">
              <span className="contact-mono">{contact.phone}</span>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-label">Location</div>
            <div className="contact-value">{contact.location}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
