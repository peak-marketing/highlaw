# HIGHLAW 홈페이지/예약관리

이 폴더는 법무법인 하이로 홈페이지와 상담 예약현황/관리자 기능을 포함합니다.

## 로컬 실행

```bash
cd highlaw
npm start
```

- 고객 홈페이지: `http://localhost:3000`
- 예약현황: `http://localhost:3000/reservation.html`
- 관리자: `http://localhost:3000/admin`

## 관리자 계정

기본값은 아래와 같습니다.

- 아이디: `admin`
- 비밀번호: `highlaw2026!`

운영 서버에서는 반드시 환경변수로 바꾸세요.

```bash
ADMIN_USER=admin ADMIN_PASSWORD='새비밀번호' SESSION_SECRET='긴랜덤문자열' npm start
```

## 데이터

- 예약 데이터는 `data/highlaw.sqlite`에 저장됩니다.
- 고객 화면에는 날짜, 시간, 상태만 노출됩니다.
- 고객명, 연락처, 사건 유형, 메모는 관리자 화면/API에서만 조회됩니다.

## Vultr 배포 메모

- Node.js 22.5 이상이 필요합니다. 현재 서버 코드는 Node 내장 SQLite를 사용합니다.
- 운영에서는 `PORT`, `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET` 환경변수를 설정하는 편이 좋습니다.
- Nginx를 앞단에 두고 Node 서버의 `localhost:3000`으로 프록시하면 됩니다.

## 주의할 점

- 실제 문의 폼 전송은 아직 연결되지 않았습니다. 현재는 데모 알림만 표시됩니다.
- 대표변호사 이름, 주소, 전화번호 등 placeholder 텍스트는 공개 전에 실제 값으로 바꾸는 편이 좋습니다.
- 예약관리 기능이 추가되어 GitHub Pages 같은 정적 호스팅만으로는 전체 기능을 사용할 수 없습니다.
