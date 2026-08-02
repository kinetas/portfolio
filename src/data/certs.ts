export interface Cert {
  name: string
  org: string
  date: string
}

export const certs: Cert[] = [
  { name: '1종보통운전면허증', org: '대구경찰청', date: '2020.01.22' },
  { name: 'SQLD', org: '한국데이터산업진흥원', date: '2026.03.27' },
  { name: '정보처리기사', org: '한국산업인력공단', date: '2026.09.11(합격발표예정)' },
]
