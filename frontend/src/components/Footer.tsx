export default function Footer() {
  return (
    <footer className="mt-auto bg-bg-header text-white/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <p className="text-[11px] leading-relaxed max-w-3xl">
          <span className="text-white/80 font-medium">면책사항</span>{' '}
          본 대시보드는 교육 및 정보 제공 목적으로만 제작되었으며, 투자 조언이나 정치적 예측을
          구성하지 않습니다. 표시된 데이터와 점수는 공개된 시장 데이터를 기반으로 자동 산출된
          것이며, 정확성이나 완전성을 보장하지 않습니다.
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <span className="text-[10px]">
            SweetTACO &copy; 2025
          </span>
          <a
            href="https://www.threads.com/@findawesomething"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/80 hover:text-white transition-colors"
          >
            @findawesomething
          </a>
        </div>
      </div>
    </footer>
  );
}
