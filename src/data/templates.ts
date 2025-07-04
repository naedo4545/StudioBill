import { EstimateTemplate } from '../types';

export const estimateTemplates: EstimateTemplate[] = [
  {
    id: 'budget-template',
    name: '대략의 예산 범위만',
    description: '정확한 견적이 아닌 대략적인 예산 범위를 제시할 때 사용',
    category: 'budget',
    totalAmount: 0,
    items: [
      {
        id: 'budget-1',
        category: 'planning',
        name: '기획 및 컨셉 개발',
        description: '프로젝트 기획, 스토리보드, 컨셉 개발',
        quantity: 1,
        unit: '건',
        unitPrice: 500000,
        totalPrice: 500000
      },
      {
        id: 'budget-2',
        category: 'production',
        name: '촬영 및 제작',
        description: '기본 촬영, 연출, 장비 및 인력',
        quantity: 1,
        unit: '건',
        unitPrice: 1500000,
        totalPrice: 1500000
      },
      {
        id: 'budget-3',
        category: 'postProduction',
        name: '후반 제작',
        description: '편집, 색보정, 사운드 믹싱',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'budget-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'tvc-template',
    name: '대형 프로젝트 (TVC, 웹CF 등)',
    description: 'TV 광고, 웹 광고 등 대형 프로젝트 제작 시 사용',
    category: 'tvc',
    totalAmount: 20000000,
    items: [
      {
        id: 'tvc-1',
        category: 'planning',
        name: '기획 및 컨셉 개발',
        description: '브랜드 분석, 타겟 분석, 컨셉 개발',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'tvc-2',
        category: 'planning',
        name: '스토리보드 제작',
        description: '상세 스토리보드 및 시각화',
        quantity: 1,
        unit: '건',
        unitPrice: 600000,
        totalPrice: 600000
      },
      {
        id: 'tvc-3',
        category: 'production',
        name: '프리프로덕션',
        description: '캐스팅, 로케이션 스카우팅, 장비 준비',
        quantity: 1,
        unit: '건',
        unitPrice: 500000,
        totalPrice: 500000
      },
      {
        id: 'tvc-4',
        category: 'production',
        name: '촬영 (1일)',
        description: '감독, 촬영감독, 카메라맨, 조명, 음향',
        quantity: 1,
        unit: '일',
        unitPrice: 3000000,
        totalPrice: 3000000
      },
      {
        id: 'tvc-5',
        category: 'production',
        name: '추가 촬영일',
        description: '추가 촬영이 필요한 경우',
        quantity: 0,
        unit: '일',
        unitPrice: 2500000,
        totalPrice: 0
      },
      {
        id: 'tvc-6',
        category: 'postProduction',
        name: '편집',
        description: '기본 편집 및 컷 편집',
        quantity: 1,
        unit: '건',
        unitPrice: 1200000,
        totalPrice: 1200000
      },
      {
        id: 'tvc-7',
        category: 'postProduction',
        name: '색보정',
        description: '프로페셔널 색보정',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'tvc-8',
        category: 'postProduction',
        name: '사운드 믹싱',
        description: '음향 편집 및 믹싱',
        quantity: 1,
        unit: '건',
        unitPrice: 600000,
        totalPrice: 600000
      },
      {
        id: 'tvc-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'motion-template',
    name: '모션그래픽 위주 제작',
    description: '모션그래픽이 주가 되는 프로젝트 제작 시 사용',
    category: 'motion',
    totalAmount: 8000000,
    items: [
      {
        id: 'motion-1',
        category: 'planning',
        name: '기획 및 스토리보드',
        description: '모션그래픽 기획 및 스토리보드',
        quantity: 1,
        unit: '건',
        unitPrice: 400000,
        totalPrice: 400000
      },
      {
        id: 'motion-2',
        category: 'production',
        name: '그래픽 디자인',
        description: '키비주얼 및 그래픽 요소 디자인',
        quantity: 1,
        unit: '건',
        unitPrice: 600000,
        totalPrice: 600000
      },
      {
        id: 'motion-3',
        category: 'postProduction',
        name: '모션그래픽 제작',
        description: 'After Effects, Cinema 4D 등 모션그래픽 제작',
        quantity: 1,
        unit: '건',
        unitPrice: 1500000,
        totalPrice: 1500000
      },
      {
        id: 'motion-4',
        category: 'postProduction',
        name: '추가 모션그래픽',
        description: '복잡한 모션그래픽 요소 추가',
        quantity: 0,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 0
      },
      {
        id: 'motion-5',
        category: 'postProduction',
        name: '사운드 디자인',
        description: '모션그래픽용 사운드 디자인',
        quantity: 1,
        unit: '건',
        unitPrice: 400000,
        totalPrice: 400000
      },
      {
        id: 'motion-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'corporate-template',
    name: '홍보영상 일반 (실사 포함)',
    description: '기업 홍보영상, 제품 소개영상 등 실사 촬영 포함',
    category: 'corporate',
    totalAmount: 5000000,
    items: [
      {
        id: 'corporate-1',
        category: 'planning',
        name: '기획 및 인터뷰 준비',
        description: '기업 분석, 인터뷰 질문지 작성',
        quantity: 1,
        unit: '건',
        unitPrice: 300000,
        totalPrice: 300000
      },
      {
        id: 'corporate-2',
        category: 'production',
        name: '실사 촬영 (반일)',
        description: '기업 시설, 제품, 인터뷰 촬영',
        quantity: 1,
        unit: '반일',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'corporate-3',
        category: 'production',
        name: '추가 촬영',
        description: '추가 촬영이 필요한 경우',
        quantity: 0,
        unit: '반일',
        unitPrice: 600000,
        totalPrice: 0
      },
      {
        id: 'corporate-4',
        category: 'postProduction',
        name: '편집',
        description: '기본 편집 및 자막 작업',
        quantity: 1,
        unit: '건',
        unitPrice: 700000,
        totalPrice: 700000
      },
      {
        id: 'corporate-5',
        category: 'postProduction',
        name: '색보정',
        description: '기본 색보정',
        quantity: 1,
        unit: '건',
        unitPrice: 400000,
        totalPrice: 400000
      },
      {
        id: 'corporate-6',
        category: 'postProduction',
        name: '사운드 편집',
        description: '음향 편집 및 믹싱',
        quantity: 1,
        unit: '건',
        unitPrice: 300000,
        totalPrice: 300000
      },
      {
        id: 'corporate-7',
        category: 'postProduction',
        name: '2D 모션그래픽',
        description: '2D 모션그래픽 제작',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'corporate-8',
        category: 'postProduction',
        name: '3D 모션그래픽',
        description: '3D 모션그래픽 제작',
        quantity: 1,
        unit: '건',
        unitPrice: 1500000,
        totalPrice: 1500000
      },
      {
        id: 'corporate-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'sns-template',
    name: 'SNS 광고/바이럴 영상',
    description: 'SNS, 인스타그램, 페이스북, 틱톡 등 바이럴 영상 제작에 최적화',
    category: 'sns',
    totalAmount: 2000000,
    items: [
      {
        id: 'sns-1',
        category: 'planning',
        name: '기획 및 스토리보드',
        description: 'SNS 특화 기획 및 스토리보드',
        quantity: 1,
        unit: '건',
        unitPrice: 300000,
        totalPrice: 300000
      },
      {
        id: 'sns-2',
        category: 'production',
        name: '촬영 및 제작',
        description: 'SNS 최적화 촬영, 연출, 장비',
        quantity: 1,
        unit: '건',
        unitPrice: 700000,
        totalPrice: 700000
      },
      {
        id: 'sns-3',
        category: 'postProduction',
        name: '편집 및 자막',
        description: 'SNS용 편집, 자막, 효과',
        quantity: 1,
        unit: '건',
        unitPrice: 400000,
        totalPrice: 400000
      },
      {
        id: 'sns-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'youtube-template',
    name: '유튜브 영상 제작',
    description: '유튜브 채널, 브이로그, 리뷰, 인터뷰 등 다양한 포맷 지원',
    category: 'youtube',
    totalAmount: 3000000,
    items: [
      {
        id: 'youtube-1',
        category: 'planning',
        name: '기획 및 콘티',
        description: '유튜브 영상 기획, 콘티 작성',
        quantity: 1,
        unit: '건',
        unitPrice: 250000,
        totalPrice: 250000
      },
      {
        id: 'youtube-2',
        category: 'production',
        name: '촬영',
        description: '유튜브 촬영, 장비, 인력',
        quantity: 1,
        unit: '건',
        unitPrice: 600000,
        totalPrice: 600000
      },
      {
        id: 'youtube-3',
        category: 'postProduction',
        name: '편집 및 썸네일',
        description: '유튜브용 편집, 썸네일 디자인',
        quantity: 1,
        unit: '건',
        unitPrice: 350000,
        totalPrice: 350000
      },
      {
        id: 'youtube-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'planning-template',
    name: '기획 전용 템플릿',
    description: '기획 단계만 별도로 견적할 때 사용',
    category: 'planning',
    totalAmount: 2000000,
    items: [
      {
        id: 'planning-1',
        category: 'planning',
        name: '기획 및 컨셉 개발',
        description: '프로젝트 기획, 컨셉, 스토리보드',
        quantity: 1,
        unit: '건',
        unitPrice: 500000,
        totalPrice: 500000
      },
      {
        id: 'planning-2',
        category: 'planning',
        name: '회의 및 커뮤니케이션',
        description: '고객 미팅, 자료조사, 커뮤니케이션',
        quantity: 1,
        unit: '건',
        unitPrice: 200000,
        totalPrice: 200000
      },
      {
        id: 'planning-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'production-template',
    name: '제작 전용 템플릿',
    description: '촬영/제작 단계만 별도로 견적할 때 사용',
    category: 'production',
    totalAmount: 0,
    items: [
      {
        id: 'production-1',
        category: 'production',
        name: '촬영',
        description: '촬영 인력, 장비, 장소 대여',
        quantity: 1,
        unit: '건',
        unitPrice: 1200000,
        totalPrice: 1200000
      },
      {
        id: 'production-2',
        category: 'production',
        name: '연출 및 진행',
        description: '감독, 연출, 현장 진행',
        quantity: 1,
        unit: '건',
        unitPrice: 800000,
        totalPrice: 800000
      },
      {
        id: 'production-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  },
  {
    id: 'postproduction-template',
    name: '후반제작 전용 템플릿',
    description: '편집/후반제작 단계만 별도로 견적할 때 사용',
    category: 'postProduction',
    totalAmount: 0,
    items: [
      {
        id: 'post-1',
        category: 'postProduction',
        name: '편집',
        description: '컷 편집, 색보정, 사운드 믹싱',
        quantity: 1,
        unit: '건',
        unitPrice: 700000,
        totalPrice: 700000
      },
      {
        id: 'post-2',
        category: 'postProduction',
        name: '자막/그래픽 추가',
        description: '자막, 그래픽, 효과 추가',
        quantity: 1,
        unit: '건',
        unitPrice: 300000,
        totalPrice: 300000
      },
      {
        id: 'post-ai',
        category: 'ai',
        name: 'AI 생성',
        description: 'AI 생성, 활용',
        quantity: 1,
        unit: '건',
        unitPrice: 100000,
        totalPrice: 100000
      }
    ]
  }
];

// 템플릿의 총액 계산
estimateTemplates.forEach(template => {
  template.totalAmount = template.items.reduce((sum, item) => sum + item.totalPrice, 0);
}); 