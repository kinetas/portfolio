interface AboutProps {
  sectionRef: (el: HTMLElement | null) => void
}

export default function About({ sectionRef }: AboutProps) {
  return (
    <section className="page section" id="about" ref={sectionRef}>
      <div className="hero reveal-group">
        <div className="hero-copy reveal-group reveal">
          <p className="hero-kicker reveal">ABOUT ME</p>
          <h1 className="hero-title reveal">김정희</h1>
          <p className="hero-name-en reveal">Kim Jeong Hee</p>
          <p className="hero-tagline reveal">데이터 기술자 | 논리적이고 AI 접목 가능한 데이터 기술자입니다.</p>
          <p className="hero-lede reveal">
            데이터 모델 설계, 전처리 경험이 있으며 Amazon RDS, ec2, s3 와 github actions + code deploy로 CI/CD와
            백업과 파이프라이닝 가능하며 최근에는 AI 오케스트레이션, llm에 관심을 가지고 있습니다.
          </p>
          <div className="hero-contact reveal">
            <a href="mailto:kinetas7308@gmail.com" className="hero-contact-link">
              kinetas7308@gmail.com
            </a>
            <a href="https://github.com/kinetas" className="hero-contact-link" target="_blank" rel="noreferrer">
              github.com/kinetas
            </a>
          </div>
        </div>
        <div className="hero-photo-col reveal">
          <div className="avatar-placeholder" />
        </div>
      </div>
    </section>
  )
}
