export interface SkillGroup {
  category: string
  items: string[]
}

// AI/데이터 관련 대표 스킬 — SKILLS 섹션에서 항상 노출된다.
export const featuredSkills: string[] = [
  'Python', 'SQL',
  'Scikit-learn', 'Pandas', 'NumPy', 'PyTorch', 'LangChain', 'HuggingFace Transformers',
  'FastAPI', 'Statsmodels', 'PySpark', 'XGBoost', 'LightGBM', 'Imbalanced-learn', 'YData-profiling',
  'Matplotlib', 'Seaborn', 'Streamlit', 'SciPy',
  'ChromaDB', 'Jupyter',
  'MCP', 'RAG', 'CoT', 'AI 오케스트레이션', 'Ollama', 'Groq', 'OpenAI API', '모델 파인튜닝', 'Crawling',
]

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
