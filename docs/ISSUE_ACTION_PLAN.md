# v1.6.0 테스트 및 검증 정책

## 통합 대상

- [PR #60](https://github.com/fureweb-com/public-google-sheets-parser/pull/60), `66de517`: TypeScript 선언 수정, CI runner 갱신, README 배지 정리.
- [PR #62](https://github.com/fureweb-com/public-google-sheets-parser/pull/62), `14280ae`: fetch 주입, 오프라인 테스트, 파싱·옵션 처리 보강.

기준 버전은 main의 v1.5.4이다. 공개 API에 선택적인 fetch 옵션과 named export가 추가되므로 다음 버전은 v1.6.0으로 정했다. 기존 CommonJS 및 default import 사용법도 지원한다.

## 해결 대상 이슈

- [#55: Initializers are not allowed in ambient contexts](https://github.com/fureweb-com/public-google-sheets-parser/issues/55): `.d.ts`의 필드 초기값을 제거하고 선택적 속성 선언을 사용한다.
- [#57: TS2351 — This expression is not constructable](https://github.com/fureweb-com/public-google-sheets-parser/issues/57): 실제 CommonJS 클래스 export와 일치하는 `export =` 선언을 제공한다. default/named import와 `import = require`를 지원하며, 별도 소비자 프로젝트의 `.ts`와 `.mts`를 컴파일하고 실행해 검증한다.

release 브랜치에는 feature 변경을 rebase로 통합하고 merge commit을 만들지 않는다. release 작업 커밋 메시지에는 이슈 종료 키워드를 넣지 않는다.

이 저장소는 npm 라이브러리이므로 사용자가 승인한 **CI·패키지 설치 검증 → PR 병합 → 버전 태그 → npm 게시 → 게시 후 검증** 순서를 적용한다. 앞으로 모든 PR은 작업 커밋과 별도의 병합 기록을 보존하는 merge commit 방식으로 병합하며, squash 또는 rebase merge를 사용하지 않는다. release 브랜치 내부에서 feature 변경을 통합할 때는 기존 rebase 원칙을 유지한다.

명시적인 main 병합 승인, PR의 필수 검사·리뷰 조건 및 패키지 설치 검증을 충족한 뒤 [PR #63](https://github.com/fureweb-com/public-google-sheets-parser/pull/63)을 main으로 병합한다. 이 **main 병합 커밋 메시지**에 `Fixes #55`, `Fixes #57`을 넣는다. [준비된 병합 메시지](releases/v1.6.0-merge-message.txt)의 첫 줄을 제목으로, 빈 줄 다음 내용을 본문으로 사용한다. 이슈는 npm 게시보다 앞선 PR 병합 시점에 해결 처리된다.

## 검토에서 발견한 문제와 해결

- 타입 선언에만 존재하던 named export를 실제 src/dist 모듈에도 제공한다. 타입 검사뿐 아니라 컴파일된 TypeScript 및 native ESM 소비자 코드도 실행한다.
- 셸별 환경변수 대입 문법을 테스트 실행기의 `--dist`, `--integration` 인자로 대체한다. 기존 `RUN_DIST_TESTS`, `RUN_INTEGRATION_TESTS` 환경변수도 지원한다.
- TypeScript 5.9.3을 개발 의존성과 yarn.lock에 고정한다. 검사할 때마다 최신 컴파일러를 내려받지 않는다.
- Google Sheets에 의존하던 단위 테스트는 fetch 경계에서 응답을 주입한다. HTTP 요청 생성, GID 우선순위, 오류 응답, 옵션 변경, 날짜/숫자/불리언 파싱은 실제 구현을 거친다.
- Node 기본 transport는 HTTPS 요청만 대체하여 응답 청크 결합과 네트워크 오류를 검증한다.
- Codecov의 100% 기준은 유지한다. 로컬에서도 statement, branch, function, line 커버리지 100%를 강제한다.
- CI는 Linux/Windows와 Node.js 22/24에서 같은 검사를 수행한다. PR 검사 외에 수동 실행을 지원하며 자동 배포는 수행하지 않는다.

## 실행 순서

```bash
yarn install --frozen-lockfile
yarn lint
yarn coverage
yarn test:dist
yarn test:types
yarn test:integration
```

마지막 명령만 실제 공개 Google Sheets에 접속한다. 기본 테스트와 커버리지 검사는 네트워크 없이 실행한다. `dist/index.js`는 저장소에서 관리하는 배포 파일이므로 빌드 결과를 소스와 함께 검토한다. 타입 검사의 소비자 프로젝트는 OS 임시 폴더에 생성한 뒤 정리하며, `coverage/`는 커밋하지 않는다.

## npm 릴리스 순서

1. PR의 최종 커밋에서 CI를 통과시키고, `npm pack`으로 만든 실제 `.tgz`를 별도의 소비자 프로젝트에 설치한다. CommonJS·ESM import, TypeScript 컴파일·실행, 브라우저 번들과 실제 공개 Google Sheets 조회를 확인한다.
2. 승인된 PR을 merge commit 방식으로 main에 병합하고, 병합 커밋 메시지의 해결 대상 이슈를 확인한다. main에 직접 작업 커밋을 만들지 않는다.
3. 버전 파일이 `1.6.0`인 **main의 병합 커밋**에 annotated tag `v1.6.0`을 작성한다. 태그 설명에 버전, PR 링크와 병합 커밋을 기록한다. 기존 로컬·원격 태그와 충돌하면 강제로 덮어쓰지 않으며, 승인 범위에서 해당 태그만 push한다.
4. 태그가 가리키는 커밋을 깨끗한 환경에서 체크아웃하고 빌드·패키징한 뒤, 그 패키지를 검증하여 npm에 게시한다. 태그와 패키지 버전이 일치하는지 확인하며, 검증한 `.tgz`를 그대로 게시한다. GitHub Release 작성은 별도 요청이 있을 때만 수행한다.
5. npm 레지스트리에 게시된 버전과 패키지 무결성을 확인하고, 새 소비자 프로젝트에 `public-google-sheets-parser@1.6.0`을 설치하여 같은 검증을 수행한다. 병합 커밋·태그·npm 버전과 검증 결과를 PR에 기록한다.

병합, 태그 push, npm 게시는 각각 사용자가 승인한 범위에서 수행한다. 게시가 실패하면 완료된 병합·태그와 미완료된 게시를 구분해 보고하고, 기존 병합 기록이나 태그를 임의로 다시 작성하지 않는다.
