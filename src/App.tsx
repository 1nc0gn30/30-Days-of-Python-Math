import React, { useEffect, useMemo, useState } from 'react';
import { curriculum, getLessonByDay, type CurriculumPhase } from './data/curriculum';
import { runPythonMath, verifyChallenge, type VerificationResult } from './lib/pythonMathEngine';
import { CodeEditor } from './components/CodeEditor';
import { MathVisualizer } from './components/MathVisualizer';
import { QuizPanel } from './components/QuizPanel';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Coffee,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Lightbulb,
  Menu,
  Play,
  RotateCcw,
  Search,
  Sigma,
  Terminal,
  X
} from 'lucide-react';

const COMPLETED_KEY = 'pythonMathCompletedDays_v2';
const QUIZ_KEY = 'pythonMathQuizAnswers_v2';
const CODE_DRAFT_PREFIX = 'pythonMathDraftDay_';
const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_TIP_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

const PHASES: ('All' | CurriculumPhase)[] = [
  'All',
  'Foundations',
  'Geometry & Trig',
  'Stats & Linear Algebra',
  'Calculus & Capstone'
];

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [phaseFilter, setPhaseFilter] = useState<'All' | CurriculumPhase>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    const v2 = safeReadJson<number[]>(COMPLETED_KEY, []);
    if (v2.length > 0) return v2;
    return safeReadJson<number[]>('completedMathDays', []);
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() =>
    safeReadJson<Record<string, number>>(QUIZ_KEY, {})
  );

  const lesson = useMemo(() => getLessonByDay(selectedDay), [selectedDay]);

  const [userCode, setUserCode] = useState<string>(() => {
    const draft = typeof localStorage !== 'undefined' ? localStorage.getItem(`${CODE_DRAFT_PREFIX}1`) : null;
    return draft ?? getLessonByDay(1).codeExample;
  });

  const [runOutput, setRunOutput] = useState<string>('');
  const [runError, setRunError] = useState<boolean>(false);
  const [runMs, setRunMs] = useState<number | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSol, setCopiedSol] = useState(false);

  // Run starter code cleanly on day change
  useEffect(() => {
    const savedDraft = localStorage.getItem(`${CODE_DRAFT_PREFIX}${lesson.day}`);
    const initialCode = savedDraft ?? lesson.codeExample;
    setUserCode(initialCode);
    setVerification(null);
    setShowHint(false);

    const preview = runPythonMath(initialCode);
    setRunOutput(preview.output);
    setRunError(!preview.ok);
    setRunMs(preview.durationMs);
  }, [lesson]);

  const handleCodeChange = (nextCode: string) => {
    setUserCode(nextCode);
    try {
      localStorage.setItem(`${CODE_DRAFT_PREFIX}${lesson.day}`, nextCode);
    } catch {
      // Ignore storage quota issues
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunPython = () => {
    const result = runPythonMath(userCode);
    setRunOutput(result.output);
    setRunError(!result.ok);
    setRunMs(result.durationMs);
  };

  const handleCheckChallenge = () => {
    const result = runPythonMath(userCode);
    setRunOutput(result.output);
    setRunError(!result.ok);
    setRunMs(result.durationMs);

    const verdict = verifyChallenge(userCode, result, lesson.checkRule);
    setVerification(verdict);

    if (verdict.passed) {
      setCompletedDays(prev => {
        const next = Array.from(new Set([...prev, lesson.day])).sort((a, b) => a - b);
        localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const handleResetStarter = () => {
    handleCodeChange(lesson.codeExample);
    setVerification(null);
    const result = runPythonMath(lesson.codeExample);
    setRunOutput(result.output);
    setRunError(!result.ok);
    setRunMs(result.durationMs);
  };

  const handleLoadSolution = () => {
    handleCodeChange(lesson.solutionCode);
    const result = runPythonMath(lesson.solutionCode);
    setRunOutput(result.output);
    setRunError(!result.ok);
    setRunMs(result.durationMs);
  };

  const handleSelectQuizAnswer = (key: string, optionIndex: number) => {
    setQuizAnswers(prev => {
      const next = { ...prev, [key]: optionIndex };
      localStorage.setItem(QUIZ_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  const handleCopySolana = async () => {
    try {
      await navigator.clipboard.writeText(SOLANA_TIP_ADDRESS);
      setCopiedSol(true);
      setTimeout(() => setCopiedSol(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const filteredCurriculum = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return curriculum.filter(item => {
      if (phaseFilter !== 'All' && item.phase !== phaseFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        `day ${item.day}`.includes(q)
      );
    });
  }, [phaseFilter, searchQuery]);

  const totalQuizCorrect = useMemo(() => {
    let score = 0;
    for (const d of curriculum) {
      d.quiz.forEach((q, idx) => {
        if (quizAnswers[`${d.day}-${idx}`] === q.correctIndex) score++;
      });
    }
    return score;
  }, [quizAnswers]);

  const completionPct = Math.round((completedDays.length / curriculum.length) * 100);

  return (
    <div className="min-h-screen bg-[#07090D] text-[#E8E6E1] font-sans antialiased flex flex-col lg:flex-row">
      {/* Mobile / Tablet Sticky Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0B0E14]/95 backdrop-blur">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#F27D26]/15 border border-[#F27D26]/40 flex items-center justify-center shrink-0">
            <Sigma className="w-4 h-4 text-[#F27D26]" aria-hidden="true" />
          </div>
          <div className="truncate">
            <div className="font-display text-sm font-semibold tracking-tight text-white truncate">
              30 Days of Python Math
            </div>
            <div className="text-[11px] font-mono text-white/55">
              Day {lesson.day}/30 · {completedDays.length} solved
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(o => !o)}
          aria-label={isSidebarOpen ? 'Close curriculum menu' : 'Open curriculum menu'}
          aria-expanded={isSidebarOpen}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Curriculum Navigator */}
      <aside
        aria-label="30-day curriculum navigation"
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:z-10 border-r border-white/10 bg-[#0B0E14] flex flex-col transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/10 shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F27D26]/15 border border-[#F27D26]/40 flex items-center justify-center shrink-0">
                <Sigma className="w-5 h-5 text-[#F27D26]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-display text-base font-semibold tracking-tight text-white leading-tight">
                  30 Days of Python Math
                </h1>
                <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider">
                  Open Curriculum · v2.0
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Readout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-white/65">
              <span>Challenges: {completedDays.length}/30</span>
              <span className="text-[#F27D26]">{completionPct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F27D26] transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-white/45 flex items-center justify-between">
              <span>Quiz checks: {totalQuizCorrect}/60</span>
              <span className="text-emerald-400">100% Free & Local</span>
            </div>
          </div>

          {/* Search & Phase Filter */}
          <div className="space-y-2">
            <label className="relative block">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search day or math topic..."
                aria-label="Search curriculum lessons"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#07090D] border border-white/10 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-[#F27D26]"
              />
            </label>
            <div className="flex flex-wrap gap-1">
              {PHASES.map(phase => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => setPhaseFilter(phase)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                    phaseFilter === phase
                      ? 'bg-[#F27D26] text-[#07090D] font-semibold'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {phase === 'Stats & Linear Algebra' ? 'Stats & LinAlg' : phase === 'Calculus & Capstone' ? 'Calculus' : phase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 30-Day List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredCurriculum.map(item => {
            const active = item.day === selectedDay;
            const done = completedDays.includes(item.day);
            return (
              <button
                key={item.day}
                type="button"
                onClick={() => handleSelectDay(item.day)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2.5 min-h-[44px] rounded-lg border transition-colors ${
                  active
                    ? 'bg-[#161B25] border-[#F27D26]/40 text-white'
                    : 'border-transparent hover:bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                <span className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-label="Completed" />
                  ) : (
                    <Circle className={`w-4 h-4 ${active ? 'text-[#F27D26]' : 'text-white/25'}`} aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">
                    <span className="font-mono text-white/45 mr-1.5">{String(item.day).padStart(2, '0')}</span>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-white/45 truncate">{item.topic}</div>
                </div>
              </button>
            );
          })}
          {filteredCurriculum.length === 0 && (
            <p className="text-xs text-white/45 p-3 font-mono">No lessons match “{searchQuery}”.</p>
          )}
        </nav>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col coord-grid">
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-6">
          {/* Top Lesson Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em]">
                <span className="text-[#F27D26]">
                  Day {String(lesson.day).padStart(2, '0')} / 30
                </span>
                <span className="text-white/25">·</span>
                <span className="text-white/55">{lesson.phase}</span>
                {completedDays.includes(lesson.day) && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-normal">
                    Solved
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {lesson.title}
              </h2>
              <p className="text-sm text-white/65 max-w-[65ch]">{lesson.topic}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={selectedDay <= 1}
                onClick={() => handleSelectDay(selectedDay - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-[#0E1117] text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={selectedDay >= 30}
                onClick={() => handleSelectDay(selectedDay + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-[#0E1117] text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Core Formula Strip */}
          <div className="rounded-xl border border-[#F27D26]/25 bg-[#0E1117] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F27D26] shrink-0">
              Key Formula
            </span>
            <code className="text-xs sm:text-sm font-mono text-white overflow-x-auto">
              {lesson.formula}
            </code>
          </div>

          {/* 2-Column Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Concept + Visualizer + Quiz + Resources */}
            <div className="xl:col-span-6 space-y-6 min-w-0">
              <section className="rounded-xl border border-white/10 bg-[#0E1117] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#F27D26]" aria-hidden="true" />
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/80">
                    Mathematical Concept
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-white/80 max-w-[68ch]">
                  {lesson.explanation}
                </p>
                <ul className="space-y-1.5 pt-2 border-t border-white/10">
                  {lesson.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
                      <span className="text-[#F27D26] font-mono mt-0.5">›</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <MathVisualizer preset={lesson.visualizer} day={lesson.day} />

              <QuizPanel
                day={lesson.day}
                questions={lesson.quiz}
                answers={quizAnswers}
                onSelectAnswer={handleSelectQuizAnswer}
              />

              <section className="rounded-xl border border-white/10 bg-[#0E1117] p-5 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/60">
                  Reference Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {lesson.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-[#141923] hover:bg-[#1A2130] border border-white/10 transition-colors group"
                    >
                      <span className="text-xs font-medium text-white/85 group-hover:text-white truncate">
                        {res.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-[#F27D26] shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Challenge + Interactive Python Sandbox + Verifier */}
            <div className="xl:col-span-6 space-y-5 min-w-0">
              <section className="rounded-xl border border-[#F27D26]/35 bg-[#F27D26]/[0.07] p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26]">
                    Day {lesson.day} Coding Challenge
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowHint(h => !h)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/80"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#F27D26]" aria-hidden="true" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSolution}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/80"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                      <span>Load Solution</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white font-medium">
                  {lesson.challengeTask}
                </p>
                {showHint && (
                  <p className="text-xs font-mono text-amber-200/90 bg-black/30 border border-[#F27D26]/25 rounded-lg p-3">
                    Hint: {lesson.hint}
                  </p>
                )}
              </section>

              {/* Python Sandbox */}
              <section className="rounded-xl border border-white/10 bg-[#0E1117] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#F27D26]" aria-hidden="true" />
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/80">
                      Python Math Sandbox
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-white/75"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetStarter}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-white/75"
                      title="Reset to example code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRunPython}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-lg bg-[#1C2433] hover:bg-[#253045] border border-white/15 text-xs font-mono text-white font-medium"
                    >
                      <Play className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                      <span>Run</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckChallenge}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-lg bg-[#F27D26] hover:bg-[#ff8f3a] text-xs font-mono text-[#07090D] font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Verify Solution</span>
                    </button>
                  </div>
                </div>

                <CodeEditor code={userCode} onChange={handleCodeChange} />

                {/* Instant Console Output */}
                <div className="rounded-lg border border-white/10 bg-[#07090D] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#0B0E14] text-[11px] font-mono">
                    <span className="text-white/60 uppercase tracking-wider">Output Console</span>
                    <span className={runError ? 'text-red-400' : 'text-emerald-400'}>
                      {runError ? 'Error' : `Executed in ${runMs ?? 0.2} ms (local)`}
                    </span>
                  </div>
                  <pre
                    className={`p-3.5 text-xs font-mono whitespace-pre-wrap break-words min-h-[110px] max-h-[260px] overflow-auto ${
                      runError ? 'text-red-300' : 'text-[#C8D3E1]'
                    }`}
                  >
                    {runOutput || 'Click "Run" to execute Python math code locally.'}
                  </pre>
                </div>

                {/* Deterministic Verification Breakdown */}
                {verification && (
                  <div
                    role="status"
                    className={`rounded-xl border p-4 space-y-2.5 ${
                      verification.passed
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : 'bg-amber-500/10 border-amber-500/35'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                          verification.passed ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {verification.passed ? 'Challenge Passed' : 'Verification Checklist'}
                      </h4>
                      <span className="text-[11px] font-mono text-white/60">
                        {verification.checks.filter(c => c.passed).length}/{verification.checks.length} checks
                      </span>
                    </div>
                    <p className="text-xs text-white/85">{verification.feedback}</p>
                    <ul className="space-y-1 pt-1">
                      {verification.checks.map((chk, idx) => (
                        <li key={idx} className="text-xs font-mono flex items-center gap-2">
                          <span className={chk.passed ? 'text-emerald-400' : 'text-amber-400'}>
                            {chk.passed ? '✓' : '×'}
                          </span>
                          <span className={chk.passed ? 'text-white/80' : 'text-white/65'}>{chk.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Clean Attribution & Open Support Footer */}
        <footer className="mt-8 border-t border-white/10 bg-[#0B0E14]/90 px-4 sm:px-6 lg:px-10 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
            <div className="space-y-1">
              <p className="text-white/85 font-medium">
                Engineered by Neal Frazier Tech (
                <a
                  href="https://github.com/1nc0gn30/30-Days-of-Python-Math"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F27D26] hover:underline"
                >
                  @1nc0gn30
                </a>
                ) •{' '}
                <a
                  href="https://nullai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline decoration-white/30"
                >
                  NullAI Platform
                </a>
              </p>
              <p className="text-[11px] font-mono text-white/45">
                100% free, open-access educational curriculum. All code execution and progress run locally in your browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={STRIPE_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#F27D26]/15 hover:bg-[#F27D26]/25 border border-[#F27D26]/40 text-xs font-mono text-[#F27D26] transition-colors"
              >
                <Coffee className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Buy Us a Coffee</span>
              </a>
              <button
                type="button"
                onClick={handleCopySolana}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/75 transition-colors"
                title={`Copy Solana tip address: ${SOLANA_TIP_ADDRESS}`}
              >
                {copiedSol ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
                <span>{copiedSol ? 'Solana Copied' : `SOL: ${SOLANA_TIP_ADDRESS.slice(0, 6)}...${SOLANA_TIP_ADDRESS.slice(-4)}`}</span>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
