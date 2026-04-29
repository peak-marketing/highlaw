const practiceData = {
  military: {
    eyebrow: 'Military Criminal & Disciplinary',
    title: '군형사 · 군징계',
    summary: '군 조직의 절차와 수사 구조를 이해하는 변호사가 초기 진술부터 징계, 형사 절차까지 함께 대응합니다.',
    hero: 'images/interior/conference.jpg',
    points: ['군형사 고소·피의자 조사 대응', '군징계 및 항고 절차', '전역 취소·인사 처분 대응', '초기 진술 전략 수립'],
    process: ['사실관계 정리', '군 절차 검토', '조사·징계 대응', '후속 구제 절차']
  },
  labor: {
    eyebrow: 'Labor & Employment',
    title: '노동법',
    summary: '해고, 임금, 징계, 단체교섭 등 노동 분쟁의 쟁점을 정리하고 기업과 근로자 모두에게 필요한 전략을 제시합니다.',
    hero: 'images/interior/office1.jpg',
    points: ['부당해고·징계 대응', '임금체불·퇴직금 분쟁', '인사노무 자문', '노동위원회 및 소송 대응'],
    process: ['근로관계 분석', '증거자료 정리', '기관 대응', '합의·소송 전략']
  },
  harassment: {
    eyebrow: 'Workplace Harassment',
    title: '직장 내 괴롭힘',
    summary: '신고, 조사, 징계, 손해배상까지 직장 내 괴롭힘 사건의 민감한 절차를 체계적으로 관리합니다.',
    hero: 'images/interior/hallway.jpg',
    points: ['피해자·가해자 대리', '사내 조사 절차 자문', '고용노동부 진정 대응', '징계 및 손해배상 분쟁'],
    process: ['사실관계 분류', '증거 및 진술 정리', '조사 대응', '구제 절차 진행']
  },
  safety: {
    eyebrow: 'Serious Accident Response',
    title: '중대재해처벌',
    summary: '중대재해 발생 전후의 리스크를 점검하고 수사 대응, 예방 컨설팅, 책임 구조 분석을 수행합니다.',
    hero: 'images/interior/lobby.jpg',
    points: ['중대재해처벌법 수사 대응', '안전보건관리체계 점검', '경영책임자 리스크 분석', '사고 발생 후 위기 대응'],
    process: ['현황 진단', '책임 구조 검토', '수사 대응', '재발 방지 체계 정비']
  },
  entertainment: {
    eyebrow: 'Entertainment & Game',
    title: '엔터테인먼트 · 게임',
    summary: '콘텐츠, 게임, 연예 산업의 계약과 권리 분쟁을 산업의 속도에 맞게 검토하고 대응합니다.',
    hero: 'images/interior/office1.png',
    points: ['전속계약·출연계약 검토', '저작권·초상권 분쟁', '게임사 법률 자문', '콘텐츠 수익배분 분쟁'],
    process: ['계약 구조 분석', '권리관계 정리', '협상 전략 수립', '분쟁 대응']
  },
  corporate: {
    eyebrow: 'Corporate & Criminal',
    title: '기업법무 · 형사',
    summary: '기업 운영 중 발생하는 계약, 내부 분쟁, 형사 리스크를 종합적으로 검토하고 실무적인 해결책을 제시합니다.',
    hero: 'images/interior/conference.jpg',
    points: ['계약서 검토 및 자문', '기업 형사 수사 대응', '내부 조사 및 컴플라이언스', '민형사 분쟁 대응'],
    process: ['리스크 진단', '자료 검토', '대응 전략 수립', '협상·소송 진행']
  }
};

const key = document.body.dataset.practice;
const data = practiceData[key] || practiceData.military;

document.title = `${data.title} | 법무법인 하이로`;
document.getElementById('practiceHeroPhoto').style.backgroundImage = `url('${data.hero}')`;
document.getElementById('practiceEyebrow').textContent = data.eyebrow;
document.getElementById('practiceTitle').textContent = data.title;
document.getElementById('practiceSummary').textContent = data.summary;
document.getElementById('practiceHeroLabel').textContent = data.eyebrow;
document.getElementById('practiceHeroTitle').textContent = data.title;

document.getElementById('practicePoints').innerHTML = data.points.map((point, index) => `
  <li><span>${String(index + 1).padStart(2, '0')}</span>${point}</li>
`).join('');

document.getElementById('practiceProcess').innerHTML = data.process.map((step, index) => `
  <li><span>STEP ${index + 1}</span><strong>${step}</strong></li>
`).join('');
