# HIGHLAW GitHub Pages 배포

이 저장소는 `highlaw` 폴더 안의 정적 사이트를 GitHub Pages로 배포하도록 구성되어 있습니다.

## 배포 방식

- 배포 대상: `highlaw/`
- 배포 도구: GitHub Actions
- 결과 URL 예시: `https://사용자이름.github.io/저장소이름/`

현재 HTML, CSS, JS 경로가 모두 상대경로로 작성되어 있어 GitHub Pages의 저장소 하위 경로 배포와 잘 맞습니다.

## 올리는 순서

1. GitHub에서 새 저장소를 만듭니다.
2. 이 작업 폴더 전체를 새 저장소에 올립니다.
3. 기본 브랜치를 `main` 또는 `master`로 사용합니다.
4. GitHub 저장소의 `Settings > Pages`에서 Source가 `GitHub Actions`인지 확인합니다.
5. `main` 또는 `master` 브랜치에 푸시하면 자동으로 배포됩니다.

## 첫 업로드 예시

```bash
git init
git add .
git commit -m "Initial site upload"
git branch -M main
git remote add origin https://github.com/사용자이름/저장소이름.git
git push -u origin main
```

## 주의할 점

- 실제 문의 폼 전송은 아직 연결되지 않았습니다. 현재는 데모 알림만 표시됩니다.
- 대표변호사 이름, 주소, 전화번호 등 placeholder 텍스트는 공개 전에 실제 값으로 바꾸는 편이 좋습니다.
- 커스텀 도메인을 쓸 경우 `highlaw/CNAME` 파일을 추가하면 됩니다.