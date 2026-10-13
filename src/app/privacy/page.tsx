import Link from "next/link";
import styles from "./page.module.css";

// TODO(운영자): 출시 전에 실제 개인정보 보호책임자 이름과 연락처로 바꿔주세요.
const PRIVACY_CONTACT = "이민건 / mingun2012@gmail.com";
const EFFECTIVE_DATE = "2026년 10월 13일";

export const metadata = {
  title: "개인정보 처리 안내 - MG스터디",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>개인정보 처리 안내</h1>
      <p className={styles.subtitle}>
        MG스터디가 어떤 정보를 왜 쓰는지, 보호자와 아이가 함께 읽기 쉽게
        정리했어요.
      </p>

      <section className={styles.card}>
        <h2 className={styles.heading}>1. 모으는 정보와 쓰는 곳</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>언제</th>
              <th>어떤 정보</th>
              <th>왜 쓰나요</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>회원가입</td>
              <td>
                이름(또는 별명), 이메일, 비밀번호, 나이(선택)
              </td>
              <td>로그인과 계정 확인, 나이에 맞는 쉬운 설명</td>
            </tr>
            <tr>
              <td>마이페이지</td>
              <td>닉네임, 아바타, 나이(선택)</td>
              <td>화면에 이름과 그림 보여주기, 설명 난이도 맞추기</td>
            </tr>
            <tr>
              <td>질문할 때 (로그인한 경우)</td>
              <td>입력한 질문, 나이</td>
              <td>내 질문 기록과 복습 카드</td>
            </tr>
          </tbody>
        </table>
        <ul className={styles.list}>
          <li>
            비밀번호는 원래 글자 그대로 저장하지 않고, 되돌릴 수 없게 암호화한
            값만 저장해요.
          </li>
          <li>로그인하지 않고 질문하면 질문 기록을 서버에 남기지 않아요.</li>
          <li>나이는 적지 않아도 되고, 적지 않으면 초등학생 수준으로 설명해요.</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>2. AI에게 보내는 정보</h2>
        <p className={styles.text}>
          질문을 분석해 퀴즈를 만들고, 직접 쓴 글을 봐주기 위해 아래 내용을 AI
          서비스로 보내요. <strong>이름, 이메일, 비밀번호는 보내지 않아요.</strong>
        </p>
        <ul className={styles.list}>
          <li>보내는 내용: 입력한 질문, 퀴즈에서 고른 답, 직접 쓴 글, 나이</li>
          <li>받는 곳: Anthropic, PBC (Claude AI 제공 회사)</li>
          <li>나라: 미국 (개인정보가 국외로 이전돼요)</li>
          <li>목적: 질문 분석, 퀴즈와 설명 만들기, 글쓰기 첨삭, 심화 질문 추천</li>
        </ul>
        <p className={styles.text}>
          그래서 질문이나 글에는 이름, 학교, 주소, 전화번호 같은 개인정보를
          적지 않도록 아이와 함께 약속해 주세요.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>3. 소리 내어 읽기 (마이크)</h2>
        <ul className={styles.list}>
          <li>
            마이크는 아이가 &lsquo;소리 내어 읽기&rsquo; 버튼을 누를 때만 켜져요.
          </li>
          <li>
            목소리를 글자로 바꾸는 일은 브라우저에 들어 있는 음성 인식 기능이
            해요. 이때 목소리가 브라우저 회사(예: 크롬은 Google)의 음성 인식
            서버로 보내질 수 있어요.
          </li>
          <li>
            MG스터디는 목소리를 받지도, 저장하지도 않아요. 바뀐 글자는 화면에서
            맞게 읽었는지 확인하는 데만 쓰고 서버로 보내지 않아요.
          </li>
          <li>
            원하지 않으면 마이크를 쓰지 않고 원고지에 직접 적어서 진행할 수
            있어요.
          </li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>4. 이 기기(브라우저)에 저장되는 것</h2>
        <ul className={styles.list}>
          <li>로그인 상태를 유지하기 위한 로그인 정보 (로그아웃하면 지워져요)</li>
          <li>지금 풀고 있는 질문과 퀴즈 (브라우저 탭을 닫으면 지워져요)</li>
          <li>복습 카드에 보여줄 심화 질문 (최근 30개까지)</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>5. 만 14세 미만 어린이</h2>
        <p className={styles.text}>
          만 14세 미만 어린이의 개인정보를 받으려면 보호자(법정대리인)의
          동의가 필요해요. 회원가입은 보호자와 함께 이 안내를 읽고, 보호자가
          동의한 뒤에 진행해 주세요.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>6. 보관, 삭제, 문의</h2>
        <p className={styles.text}>
          계정과 질문 기록의 확인·수정·삭제를 원하거나 궁금한 점이 있으면
          아래로 연락해 주세요. 요청을 받으면 바로 처리해요.
        </p>
        <p className={styles.contact}>개인정보 보호책임자: {PRIVACY_CONTACT}</p>
      </section>

      <p className={styles.effective}>시행일: {EFFECTIVE_DATE}</p>

      <Link href="/" className={styles.backLink}>
        ← 홈으로
      </Link>
    </div>
  );
}
