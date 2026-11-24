import { getLessonByDay, type DayLesson } from './curriculum';

export type FallbackLessonData = Pick<
  DayLesson,
  'explanation' | 'codeExample' | 'challengeTask' | 'resources'
>;

export function getFallbackLesson(day: number): FallbackLessonData {
  const lesson = getLessonByDay(day);
  return {
    explanation: lesson.explanation,
    codeExample: lesson.codeExample,
    challengeTask: lesson.challengeTask,
    resources: lesson.resources
  };
}
