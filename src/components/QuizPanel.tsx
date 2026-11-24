import React from 'react';
import type { QuizQuestion } from '../data/curriculum';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface QuizPanelProps {
  day: number;
  questions: [QuizQuestion, QuizQuestion];
  answers: Record<string, number>;
  onSelectAnswer: (key: string, optionIndex: number) => void;
}

export function QuizPanel({ day, questions, answers, onSelectAnswer }: QuizPanelProps) {
  const correctCount = questions.reduce((acc, q, idx) => {
    const chosen = answers[`${day}-${idx}`];
    return acc + (chosen === q.correctIndex ? 1 : 0);
  }, 0);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0E1117] p-5 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F27D26]" aria-hidden="true" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/80">
            Day {day} Concept Check
          </h3>
        </div>
        <span className="text-xs font-mono text-white/60">
          Score: <strong className={correctCount === questions.length ? 'text-emerald-400' : 'text-[#F27D26]'}>{correctCount}/{questions.length}</strong>
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const key = `${day}-${qIdx}`;
          const chosen = answers[key];
          const answered = chosen !== undefined;
          const isCorrect = chosen === q.correctIndex;

          return (
            <div key={key} className="space-y-2.5">
              <p className="text-sm font-medium text-white leading-snug">
                <span className="text-[#F27D26] font-mono mr-2">Q{qIdx + 1}.</span>
                {q.prompt}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => {
                  const isPicked = chosen === oIdx;
                  const isRightOpt = oIdx === q.correctIndex;
                  let btnStyle = 'bg-[#141923] border-white/10 text-white/80 hover:border-white/25 hover:text-white';
                  if (answered) {
                    if (isRightOpt) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200';
                    } else if (isPicked) {
                      btnStyle = 'bg-red-500/15 border-red-500/50 text-red-200';
                    } else {
                      btnStyle = 'bg-[#10141D] border-white/5 text-white/45';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => onSelectAnswer(key, oIdx)}
                      className={`text-left px-3 py-2.5 min-h-[44px] rounded-lg border text-xs font-mono transition-colors flex items-center justify-between gap-2 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {answered && isRightOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                      {answered && isPicked && !isRightOpt && <XCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <p className={`text-xs leading-relaxed px-3 py-2 rounded-lg border ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200/90'
                    : 'bg-amber-500/10 border-amber-500/25 text-amber-200/90'
                }`}>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
