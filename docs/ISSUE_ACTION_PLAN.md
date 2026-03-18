# 이슈 해결을 위한 점검/실행 항목

## 현재 확인된 핵심 문제

`yarn test` 실행 시 총 74개 테스트 중 36개가 실패했습니다. 실패 패턴은 대부분 로직 버그가 아니라, 테스트가 실시간으로 Google Sheets 네트워크 응답에 의존하기 때문에 발생합니다.

- 에러: `ENETUNREACH` (외부 네트워크/IPv6 연결 불가)
- 영향: `parse`, `getSpreadsheetDataUsingFetch` 등 네트워크 의존 테스트 다수 실패
- 원인: 테스트 코드가 고정 fixture 대신 실제 공개 스프레드시트를 직접 호출함

## 무엇을 해야 하는가 (우선순위)

### 1) 테스트를 “단위 테스트”와 “통합 테스트”로 분리

- 단위 테스트:
  - `getItems`, `normalizeRow`, `applyHeaderIntoRows`, `setOption`, `isDate`는 고정 fixture(JSON 문자열) 기반으로 검증
  - 외부 네트워크 없이 항상 재현 가능하도록 구성
- 통합 테스트:
  - 실제 Google Sheets 호출 테스트는 별도 스위트로 분리
  - CI 기본 파이프라인에서는 제외하고, 필요 시 수동/야간 실행

### 2) fetch 레이어 목킹 전략 도입

현 구조는 `src/index.js`에서 직접 fetch를 선택합니다.

- 권장 개선:
  - 생성자 옵션에 `fetch` 주입 허용 (예: `new Parser(id, { fetch: customFetch })`)
  - 혹은 테스트에서 `../src/fetch`를 스텁할 수 있게 분리
- 효과:
  - 테스트가 네트워크와 분리되어 flaky 테스트 제거
  - 실패 원인이 네트워크인지 로직인지 즉시 구분 가능

### 3) 하드코딩된 “원문 응답 문자열 일치” 테스트 완화

현재 일부 테스트는 응답 전체 raw string이 완전히 동일한지 비교합니다.

- 문제:
  - Google 응답의 메타정보(`sig` 등)는 변동 가능성이 있어 brittle
- 개선:
  - raw text 전체 비교 대신 파싱 후 `table.cols`, `table.rows`의 의미 데이터만 검증

### 4) src/dist 중복 테스트 구조 정리

현재 같은 테스트를 `src/index.js`와 `dist/index.js`에 각각 적용합니다.

- 장점: 배포 산출물 검증 가능
- 단점: 네트워크 이슈 발생 시 실패가 2배로 증폭
- 개선:
  - 기본은 `src`만 실행
  - `dist` 검증은 빌드 후 별도 잡(job)으로 분리

### 5) CI/로컬 실행 정책 명확화

- `yarn test`: 오프라인에서도 100% 통과 가능한 단위 테스트만
- `yarn test:integration` (신규): 네트워크 필요 테스트
- `README`에 각 테스트의 목적/실행 조건 명시

## 권장 작업 순서 (실행 플랜)

1. 테스트 파일을 단위/통합으로 분리한다.
2. Parser에 fetch 주입(또는 fetch 모듈 목킹 가능한 구조) 추가한다.
3. raw string 비교 테스트를 의미 기반 비교로 변경한다.
4. `package.json` 스크립트(`test`, `test:integration`)를 분리한다.
5. CI에서 기본은 단위 테스트만 수행하도록 조정한다.
6. `dist` 검증은 선택적 파이프라인으로 분리한다.

## 완료 기준 (Definition of Done)

- 오프라인 환경에서 `yarn test`가 안정적으로 통과한다.
- 네트워크 문제와 로직 버그가 테스트 결과에서 분리되어 해석 가능하다.
- 동일 커밋에서 테스트 결과가 환경에 따라 출렁이지 않는다(flaky 제거).
