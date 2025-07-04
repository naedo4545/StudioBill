# 영상제작 견적서 서비스

영상제작 견적을 내고 견적서를 공유하는 전문적인 웹 서비스입니다.

## 주요 기능

### 📋 견적서 템플릿
- **대략의 예산 범위만**: 정확한 견적이 아닌 대략적인 예산 범위를 제시할 때 사용
- **대형 프로젝트 (TVC, 웹CF 등)**: TV 광고, 웹 광고 등 대형 프로젝트 제작 시 사용
- **모션그래픽 위주 제작**: 모션그래픽이 주가 되는 프로젝트 제작 시 사용
- **홍보영상 일반 (실사 포함)**: 기업 홍보영상, 제품 소개영상 등 실사 촬영 포함

### 🎯 견적서 구성
각 견적서는 다음 세 단계로 구성됩니다:
- **기획**: 프로젝트 기획, 스토리보드, 컨셉 개발
- **제작**: 촬영, 연출, 장비 및 인력
- **후반제작**: 편집, 색보정, 사운드 믹싱

### 🏢 회사 정보 관리
- 회사 로고 업로드 및 관리
- 회사 정보 설정 (주소, 연락처, 웹사이트 등)
- 견적서에 회사 정보 자동 반영

### 👥 사용자 관리
- 관리자, 매니저, 일반 사용자 권한 설정
- 다중 관리자 지원
- 사용자별 접근 권한 관리

### ✍️ 견적서 편집 기능
- 견적 내용 추가, 수정, 삭제
- 실시간 가격 계산
- 세율 설정 및 부가세 자동 계산
- 서명 및 도장 영역

## 기술 스택

- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router DOM
- **Styling**: Emotion (CSS-in-JS)

## 설치 및 실행

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치
```bash
# 프로젝트 클론
git clone [repository-url]
cd video-estimate-service

# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

### 빌드
```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── HomePage.tsx           # 메인 홈페이지
│   ├── TemplateSelectionPage.tsx  # 템플릿 선택 페이지
│   ├── EstimateEditorPage.tsx     # 견적서 편집 페이지
│   ├── EstimateViewPage.tsx       # 견적서 보기 페이지
│   └── CompanySettingsPage.tsx    # 설정 페이지
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── data/               # 정적 데이터
│   └── templates.ts    # 견적서 템플릿 데이터
└── App.tsx             # 메인 앱 컴포넌트
```

## 사용 방법

### 1. 견적서 작성 시작
- 홈페이지에서 원하는 템플릿 선택
- 또는 빈 견적서부터 시작

### 2. 견적서 편집
- 고객 정보 입력
- 견적 항목 추가/수정/삭제
- 가격 및 수량 조정
- 세율 설정

### 3. 견적서 완성
- 견적서 미리보기
- 인쇄 또는 PDF 다운로드
- 고객과 공유

### 4. 회사 설정
- 회사 정보 및 로고 설정
- 사용자 권한 관리
- 시스템 설정

## 주요 특징

### 🎨 직관적인 UI/UX
- Material Design 기반의 모던한 인터페이스
- 반응형 디자인으로 모바일/태블릿 지원
- 직관적인 네비게이션

### ⚡ 실시간 계산
- 견적 항목 변경 시 실시간 총액 계산
- 부가세 자동 계산
- 수량 및 단가 변경 시 즉시 반영

### 🔧 유연한 커스터마이징
- 템플릿 기반 시작으로 빠른 견적서 작성
- 완전한 커스터마이징 가능
- 회사별 브랜딩 지원

### 👥 협업 기능
- 다중 사용자 지원
- 권한 기반 접근 제어
- 견적서 공유 및 협업

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
