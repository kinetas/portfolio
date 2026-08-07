export interface SkillGroup {
  category: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: '언어',
    items: ['Python', 'Java', 'C', 'C++', 'C#', 'JavaScript', 'HTML/CSS', 'SQL', 'Shell Script'],
  },
  {
    category: '프레임워크 / 라이브러리',
    items: [
      'React', 'Node.js', 'Express', 'Scikit-learn', 'Pandas', 'NumPy',
      'Spring Boot', 'Spring MVC', 'Spring Data JPA', 'Spring Security', 'Spring Batch',
      'FastAPI', 'Matplotlib', 'Seaborn', 'Chart.js', 'Streamlit', 'Statsmodels', 'Pydantic',
      'Thymeleaf', 'MyBatis', 'Bootstrap 5', 'react-bootstrap', 'GSAP', 'ScrollMagic', 'Swiper',
      'Lodash', 'Leaflet', 'Selenium', 'Jsoup', 'LangChain', 'HuggingFace Transformers', 'PyTorch',
      'BeautifulSoup4', 'PySpark', 'SciPy', 'XGBoost', 'LightGBM', 'Imbalanced-learn', 'YData-profiling',
    ],
  },
  {
    category: '도구',
    items: [
      'MySQL', 'PostgreSQL', 'ChromaDB', 'SQLite', 'Redis', 'Linux', 'Docker', 'Git', 'GitHub',
      'GitHub Actions', 'JIRA', 'Slack', 'AWS ec2', 'RDS', 'S3', 'ERwin', 'draw.io', 'Figma',
      'VS Code', 'cursor', 'Claude Code', 'LM studio', 'Jupyter', 'GitHub Pages', 'Git Flow',
      'SourceTree', 'Jenkins', 'nginx', 'Ubuntu',
    ],
  },
  {
    category: '기타',
    items: [
      'MCP', 'MSA', 'Harness Engineering', 'AI 오케스트레이션', 'RAG', 'CoT', 'Crawling', 'JSON',
      'JSON Web Token', 'REST API', 'OAuth2', 'Ollama', 'Groq', 'OpenAI API', '모델 파인튜닝',
    ],
  },
]

// AI/데이터 관련 대표 스킬 이름 — SKILLS 섹션 기본 화면에 노출된다.
const featuredSkillNames = new Set([
  'Python', 'SQL',
  'Scikit-learn', 'Pandas', 'NumPy', 'PyTorch', 'LangChain', 'HuggingFace Transformers',
  'FastAPI', 'Statsmodels', 'PySpark', 'SciPy', 'XGBoost', 'LightGBM', 'Imbalanced-learn',
  'YData-profiling', 'Matplotlib', 'Seaborn', 'Streamlit',
  'MySQL', 'PostgreSQL', 'ChromaDB', 'SQLite', 'Redis', 'ERwin', 'Jupyter',
  'MCP', 'RAG', 'CoT', 'AI 오케스트레이션', 'Ollama', 'Groq', 'OpenAI API', '모델 파인튜닝', 'Crawling',
])

// skillGroups와 동일한 카테고리 구조를 유지하되, AI/데이터 관련 항목만 남긴 버전.
export const featuredSkillGroups: SkillGroup[] = skillGroups
  .map((group) => ({
    category: group.category,
    items: group.items.filter((item) => featuredSkillNames.has(item)),
  }))
  .filter((group) => group.items.length > 0)
