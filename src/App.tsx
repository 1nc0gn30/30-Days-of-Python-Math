import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { curriculum } from './data/curriculum';
import { getFallbackLesson } from './data/fallbackLessons';
import { fetchDailyLesson, evaluateUserCode } from './lib/gemini';
import { CodeEditor } from './components/CodeEditor';
import { CheckCircle2, Circle, Play, Loader2, BookOpen, AlertCircle, Menu, X, ExternalLink, Settings, Terminal } from 'lucide-react';

interface LessonData {
  explanation: string;
  codeExample: string;
  challengeTask: string;
  resources: { title: string; url: string }[];
}

interface AppSettings {
  aiEnabled: boolean;
  apiKey: string;
}

type PyodideLike = {
  globals: {
    set: (name: string, value: unknown) => void;
  };
  runPythonAsync: (code: string) => Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideLike>;
  }
}

const SETTINGS_STORAGE_KEY = 'pythonMathSettings';

export default function App() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ passed: boolean; message: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ aiEnabled: false, apiKey: '' });
  const [pythonOutput, setPythonOutput] = useState('Python terminal ready. Click "Run Python".');
  const [runningPython, setRunningPython] = useState(false);
  const [pythonReady, setPythonReady] = useState(false);
  const pyodideRef = useRef<PyodideLike | null>(null);
  const pyodideInitRef = useRef<Promise<PyodideLike> | null>(null);

  const aiReady = settings.aiEnabled && settings.apiKey.trim().length > 0;

  // Load completed days and local settings
  useEffect(() => {
    const savedCompleted = localStorage.getItem('completedMathDays');
    if (savedCompleted) {
      setCompletedDays(JSON.parse(savedCompleted));
    }

    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as Partial<AppSettings>;
        setSettings({
          aiEnabled: Boolean(parsed.aiEnabled),
          apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : ''
        });
      } catch {
        // Ignore corrupted settings and keep defaults
      }
    }
  }, []);

  const updateSettings = (next: AppSettings) => {
    setSettings(next);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  };

  const saveCompleted = (day: number) => {
    const next = [...new Set([...completedDays, day])];
    setCompletedDays(next);
    localStorage.setItem('completedMathDays', JSON.stringify(next));
  };

  const getPyodide = async (): Promise<PyodideLike> => {
    if (pyodideRef.current) {
      return pyodideRef.current;
    }

    if (!pyodideInitRef.current) {
      pyodideInitRef.current = (async () => {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Python runtime'));
            document.head.appendChild(script);
          });
        }

        if (!window.loadPyodide) {
          throw new Error('Python runtime is unavailable');
        }

        const runtime = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/'
        });

        pyodideRef.current = runtime;
        setPythonReady(true);
        return runtime;
      })();
    }

    return pyodideInitRef.current;
  };

  const runPython = async () => {
    setRunningPython(true);
    setPythonOutput('Running...');

    try {
      const pyodide = await getPyodide();
      pyodide.globals.set('user_code', userCode);
      const output = await pyodide.runPythonAsync(`
import io
import traceback
import contextlib

_stdout = io.StringIO()
_stderr = io.StringIO()

with contextlib.redirect_stdout(_stdout), contextlib.redirect_stderr(_stderr):
    try:
        exec(user_code, {})
    except Exception:
        traceback.print_exc()

result = (_stdout.getvalue() + _stderr.getvalue()).strip()
result if result else "Code ran successfully (no output)."
      `);

      setPythonOutput(String(output));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Python runtime error';
      setPythonOutput(`Runtime error: ${message}`);
    } finally {
      setRunningPython(false);
    }
  };

  const loadLesson = async (dayInt: number) => {
    setSelectedDay(dayInt);
    setLessonData(null);
    setFeedback(null);
    setLoading(true);
    setUserCode('# Write your python code here\n');
    setIsSidebarOpen(false);

    const item = curriculum.find(d => d.day === dayInt);
    if (!item) {
      setLoading(false);
      return;
    }

    if (aiReady) {
      const data = await fetchDailyLesson(item.day, item.title, item.topic, settings.apiKey.trim());
      const nextLesson = data ?? getFallbackLesson(item.day, item.title, item.topic);
      setLessonData(nextLesson);
      setUserCode(nextLesson.codeExample || '# Write your python code here\n');
    } else {
      const nextLesson = getFallbackLesson(item.day, item.title, item.topic);
      setLessonData(nextLesson);
      setUserCode(nextLesson.codeExample || '# Write your python code here\n');
    }

    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadLesson(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiReady]);

  const handleEvaluate = async () => {
    const item = curriculum.find(d => d.day === selectedDay);
    if (!item || !lessonData || !aiReady) return;

    setEvaluating(true);
    setFeedback(null);

    const result = await evaluateUserCode(
      item.day,
      item.topic,
      lessonData.challengeTask,
      userCode,
      settings.apiKey.trim()
    );

    setFeedback({
      passed: result.passed,
      message: result.feedback
    });

    if (result.passed) {
      saveCompleted(item.day);
    }
    setEvaluating(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-[#E4E3E0] font-sans antialiased overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A] z-50">
        <h1 className="text-lg font-medium tracking-tight text-white">30 Days of Python Math</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/5 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-0 md:w-80 border-r border-white/10 flex flex-col h-full bg-[#0A0A0A] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block p-6 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-medium tracking-tight text-white mb-2">30 Days of Python Math</h1>
          <div className="flex items-center space-x-2 text-xs font-mono text-white/50 uppercase tracking-wider">
            <span>Progress: {completedDays.length}/30</span>
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F27D26] transition-all duration-500 ease-out"
                style={{ width: `${(completedDays.length / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="md:hidden p-6 border-b border-white/10">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#F27D26] mb-4">Curriculum</h2>
        </div>

        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
            <span className={`text-xs font-mono uppercase ${aiReady ? 'text-green-400' : 'text-white/50'}`}>
              {aiReady ? 'AI On' : 'AI Off'}
            </span>
          </button>

          {showSettings && (
            <div className="mt-3 p-3 rounded-lg bg-[#111111] border border-white/10 space-y-3">
              <label className="flex items-center justify-between text-xs font-mono uppercase tracking-wide text-white/70">
                <span>Use AI</span>
                <input
                  type="checkbox"
                  checked={settings.aiEnabled}
                  onChange={(e) => updateSettings({ ...settings, aiEnabled: e.target.checked })}
                  className="accent-[#F27D26]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-mono uppercase tracking-wide text-white/70">Gemini API Key</span>
                <input
                  type="password"
                  value={settings.apiKey}
                  placeholder="Paste key (stored locally in this browser)"
                  onChange={(e) => updateSettings({ ...settings, apiKey: e.target.value })}
                  className="mt-2 w-full rounded-md bg-black/40 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#F27D26]"
                />
              </label>

              <p className="text-[11px] text-white/45 leading-relaxed">
                AI features only run when enabled and a key is provided.
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {curriculum.map((item) => {
            const isActive = selectedDay === item.day;
            const isCompleted = completedDays.includes(item.day);
            return (
              <button
                key={item.day}
                onClick={() => loadLesson(item.day)}
                className={`w-full flex items-center text-left p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-[#1A1A1A] text-white' : 'hover:bg-white/5 text-white/70'}
                `}
              >
                <div className="shrink-0 mr-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#F27D26]" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/20" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <div className="text-sm font-medium">Day {item.day}: {item.title}</div>
                  <div className="text-xs text-white/40 truncate">{item.topic}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 className="w-8 h-8 text-[#F27D26]" />
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {lessonData && (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-10 max-w-6xl mx-auto w-full pb-24"
              >
                <div className="mb-2 text-xs font-mono uppercase tracking-widest text-[#F27D26]">
                  Day {selectedDay} • {curriculum.find(d => d.day === selectedDay)?.title}
                </div>

                <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-6">
                  {curriculum.find(d => d.day === selectedDay)?.topic}
                </h2>

                {!aiReady && (
                  <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm">
                    AI is currently disabled. Open Settings to enable AI and add your API key.
                  </div>
                )}

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                  {/* Left: Explanation & Resources */}
                  <div className="lg:col-span-7 space-y-8">
                    <section className="bg-[#101010] p-6 rounded-xl border border-white/5 shadow-2xl">
                      <div className="flex items-center space-x-2 mb-4 text-white/80">
                        <BookOpen className="w-4 h-4" />
                        <h3 className="text-sm font-mono uppercase tracking-wider">Concept</h3>
                      </div>
                      <div className="text-white/70 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                        {lessonData.explanation}
                      </div>
                    </section>

                    <section className="bg-[#151515] p-6 rounded-xl border border-white/5">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">Supplemental Resources</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lessonData.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                          >
                            <span className="text-xs font-medium text-white/80 group-hover:text-white truncate pr-2">{res.title}</span>
                            <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-[#F27D26]" />
                          </a>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 mb-3">Example Code</h3>
                      <div className="bg-[#151515] p-5 rounded-lg border border-white/5 font-mono text-sm text-[#A9B7C6] overflow-x-auto">
                        <pre><code>{lessonData.codeExample}</code></pre>
                      </div>
                    </section>
                  </div>

                  {/* Right: Challenge & Editor */}
                  <div className="lg:col-span-5 flex flex-col space-y-6">
                    <section className="bg-[#F27D26]/10 p-6 rounded-xl border border-[#F27D26]/20">
                      <div className="flex items-center space-x-2 mb-3 text-[#F27D26]">
                        <AlertCircle className="w-4 h-4" />
                        <h3 className="text-sm font-mono uppercase tracking-wider">Today's Challenge</h3>
                      </div>
                      <p className="text-[#F27D26]/90 leading-relaxed font-medium text-sm md:text-base">
                        {lessonData.challengeTask}
                      </p>
                    </section>

                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-white/50">Your Solution</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={runPython}
                            disabled={runningPython}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wide transition-all
                              ${runningPython
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                              }
                            `}
                            title="Run in local Python terminal"
                          >
                            {runningPython ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Terminal className="w-3 h-3" />
                            )}
                            <span>{runningPython ? 'Running...' : 'Run Python'}</span>
                          </button>

                          <button
                            onClick={handleEvaluate}
                            disabled={evaluating || !aiReady}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wide transition-all
                              ${evaluating || !aiReady
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-[#F27D26] hover:bg-[#ff8a33] text-black hover:scale-105 active:scale-95'
                              }
                            `}
                            title={aiReady ? 'Evaluate with AI' : 'Enable AI in Settings to evaluate'}
                          >
                            {evaluating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>{evaluating ? 'Evaluating...' : 'Check'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="min-h-[250px] md:min-h-[350px]">
                        <CodeEditor code={userCode} onChange={setUserCode} />
                      </div>

                      <section className="bg-[#0F0F0F] p-4 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-white/60">Python Terminal</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase ${pythonReady ? 'text-green-400' : 'text-white/50'}`}>
                              {pythonReady ? 'Runtime Ready' : 'Lazy Loaded'}
                            </span>
                            <button
                              onClick={() => setPythonOutput('')}
                              className="text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        <pre className="rounded-lg bg-black/40 border border-white/10 p-3 text-xs text-[#A9B7C6] whitespace-pre-wrap break-words min-h-[120px] max-h-[260px] overflow-auto">
                          {pythonOutput}
                        </pre>
                      </section>

                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-5 rounded-xl border flex items-start space-x-4
                            ${feedback.passed
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                            }
                          `}
                        >
                          <div className="pt-0.5 shrink-0">
                            {feedback.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-1
                              ${feedback.passed ? 'text-green-400' : 'text-red-400'}
                            `}>
                              {feedback.passed ? 'Success!' : 'Keep Trying'}
                            </h4>
                            <p className={`text-sm leading-relaxed
                              ${feedback.passed ? 'text-green-200/80' : 'text-red-200/80'}
                            `}>
                              {feedback.message}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
