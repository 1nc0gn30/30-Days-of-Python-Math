import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { curriculum, getLessonByDay } from '../src/data/curriculum';
import {
  evaluateMathExpression,
  numericalDerivative,
  riemannSum,
  runPythonMath,
  verifyChallenge
} from '../src/lib/pythonMathEngine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

describe('30-Day Curriculum Completeness', () => {
  it('contains exactly 30 sequential days with complete lesson metadata and 60 quiz questions', () => {
    assert.equal(curriculum.length, 30);

    curriculum.forEach((lesson, idx) => {
      const expectedDay = idx + 1;
      assert.equal(lesson.day, expectedDay, `Day index mismatch at ${idx}`);
      assert.ok(lesson.title.trim().length >= 3, `Day ${expectedDay} missing title`);
      assert.ok(lesson.topic.trim().length >= 10, `Day ${expectedDay} missing topic`);
      assert.ok(lesson.formula.trim().length >= 3, `Day ${expectedDay} missing formula`);
      assert.ok(lesson.explanation.trim().length >= 80, `Day ${expectedDay} explanation too short`);
      assert.ok(lesson.keyTakeaways.length >= 3, `Day ${expectedDay} needs >= 3 takeaways`);
      assert.ok(lesson.codeExample.trim().length > 10, `Day ${expectedDay} missing codeExample`);
      assert.ok(lesson.challengeTask.trim().length > 15, `Day ${expectedDay} missing challengeTask`);
      assert.ok(lesson.hint.trim().length > 10, `Day ${expectedDay} missing hint`);
      assert.ok(lesson.solutionCode.trim().length > 10, `Day ${expectedDay} missing solutionCode`);
      assert.equal(lesson.quiz.length, 2, `Day ${expectedDay} must have 2 quiz questions`);
      lesson.quiz.forEach((q, qIdx) => {
        assert.ok(q.prompt.trim().length > 5, `Day ${expectedDay} Q${qIdx + 1} missing prompt`);
        assert.equal(q.options.length, 4, `Day ${expectedDay} Q${qIdx + 1} must have 4 options`);
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, `Day ${expectedDay} Q${qIdx + 1} invalid correctIndex`);
        assert.ok(q.explanation.trim().length > 10, `Day ${expectedDay} Q${qIdx + 1} missing explanation`);
      });
      assert.ok(lesson.resources.length >= 2, `Day ${expectedDay} must have >= 2 resources`);
      lesson.resources.forEach(r => {
        assert.ok(r.url.startsWith('https://'), `Day ${expectedDay} resource must be HTTPS: ${r.url}`);
      });
    });

    assert.equal(getLessonByDay(15).day, 15);
    assert.equal(getLessonByDay(999).day, 1);
  });
});

describe('Deterministic Python Math Engine — All 30 Days Execution & Grading', () => {
  for (const lesson of curriculum) {
    it(`Day ${lesson.day} (${lesson.title}): example runs cleanly and solution passes verification`, () => {
      const exRes = runPythonMath(lesson.codeExample);
      assert.equal(exRes.ok, true, `Day ${lesson.day} codeExample failed: ${exRes.error}`);
      assert.ok(exRes.lines.length >= 1, `Day ${lesson.day} codeExample produced no output`);

      const solRes = runPythonMath(lesson.solutionCode);
      assert.equal(solRes.ok, true, `Day ${lesson.day} solutionCode failed: ${solRes.error}`);

      const verdict = verifyChallenge(lesson.solutionCode, solRes, lesson.checkRule);
      assert.equal(verdict.passed, true, `Day ${lesson.day} solution failed check: ${verdict.feedback}`);
    });
  }

  it('handles exact Fraction arithmetic, complex numbers, right-associative **, and syntax errors cleanly', () => {
    const fracRun = runPythonMath(`
from fractions import Fraction
print(Fraction(1, 3) + Fraction(1, 6))
print(Fraction(2, 5) + Fraction(3, 10))
`);
    assert.equal(fracRun.ok, true);
    assert.deepEqual(fracRun.lines, ['1/2', '7/10']);

    const powerRun = runPythonMath(`print(2 ** 3 ** 2)`);
    assert.equal(powerRun.ok, true);
    assert.equal(powerRun.output, '512');

    const complexRun = runPythonMath(`
z = 3 + 4j
print(abs(z))
`);
    assert.equal(complexRun.ok, true);
    assert.equal(complexRun.output, '5');

    const errRun = runPythonMath(`print(1 / 0)`);
    assert.equal(errRun.ok, false);
    assert.match(errRun.output, /ZeroDivisionError/);
  });

  it('evaluates canvas math expressions, numerical derivatives, and Riemann sums accurately', () => {
    assert.ok(Math.abs(evaluateMathExpression('x**2 + 3*x', 4) - 28) < 1e-9);
    assert.ok(Math.abs(evaluateMathExpression('2x + 1', 5) - 11) < 1e-9);
    assert.ok(Math.abs(evaluateMathExpression('sin(pi / 2)', 0) - 1) < 1e-9);

    const deriv = numericalDerivative('x**2 + 3*x', 4);
    assert.ok(Math.abs(deriv - 11) < 1e-4, `Expected derivative ~11, got ${deriv}`);

    const area = riemannSum('x**2', 0, 3, 500, 'midpoint');
    assert.ok(Math.abs(area - 9) < 1e-3, `Expected integral ~9, got ${area}`);
  });
});

describe('SEO, AEO, Netlify, and Open-Access Production Guardrails', () => {
  it('validates index.html JSON-LD @graph, OG/Twitter tags, and zero external placeholder images', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.ok(html.includes('name="viewport"'), 'Missing viewport meta');
    assert.ok(html.includes('https://python-math.nealfrazier.tech/og-image.png'), 'Missing local og-image URL');
    assert.ok(!html.includes('picsum.photos'), 'Placeholder picsum image must be removed');
    assert.ok(html.includes('name="twitter:site" content="@1nc0gn30"'), 'Missing twitter:site');
    assert.ok(html.includes('name="twitter:creator" content="@1nc0gn30"'), 'Missing twitter:creator');

    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, 'Missing JSON-LD script');
    const graph = JSON.parse(ldMatch[1])['@graph'] as { '@type': string }[];
    const types = new Set(graph.map(node => node['@type']));
    assert.ok(types.has('WebApplication'), 'JSON-LD missing WebApplication');
    assert.ok(types.has('Course'), 'JSON-LD missing Course');
    assert.ok(types.has('FAQPage'), 'JSON-LD missing FAQPage');
  });

  it('validates netlify.toml, _redirects, robots.txt, sitemap.xml, and 1200x630 og-image.png', () => {
    const netlifyToml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
    assert.ok(netlifyToml.includes('publish = "dist"'));
    assert.ok(netlifyToml.includes('X-Frame-Options = "SAMEORIGIN"'));
    assert.ok(netlifyToml.includes('X-Content-Type-Options = "nosniff"'));
    assert.ok(netlifyToml.includes('Referrer-Policy = "strict-origin-when-cross-origin"'));
    assert.ok(netlifyToml.includes('to = "/index.html"'));

    const redirects = fs.readFileSync(path.join(ROOT, 'public/_redirects'), 'utf8');
    assert.ok(redirects.includes('/* /index.html 200'));

    const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
    for (const bot of ['Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
      assert.ok(robots.includes(bot), `robots.txt missing ${bot}`);
    }
    assert.ok(robots.includes('Crawl-delay: 0'));
    assert.ok(robots.includes('Sitemap: https://python-math.nealfrazier.tech/sitemap.xml'));

    const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
    assert.ok(sitemap.includes('<loc>https://python-math.nealfrazier.tech/</loc>'));

    // Verify PNG header and exact 1200x630 IHDR dimensions
    const ogBuf = fs.readFileSync(path.join(ROOT, 'public/og-image.png'));
    assert.equal(ogBuf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Invalid PNG signature');
    assert.equal(ogBuf.readUInt32BE(16), 1200, 'og-image width must be 1200');
    assert.equal(ogBuf.readUInt32BE(20), 630, 'og-image height must be 630');
  });

  it('enforces 100% open-access (no paywalls/API gates/DePay) and includes Stripe & Solana support links', () => {
    const appSrc = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
    assert.ok(appSrc.includes('https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X'));
    assert.ok(appSrc.includes('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'));
    assert.ok(appSrc.includes('Neal Frazier Tech'));
    assert.ok(!/depay|paywall|license key|gemini api key/i.test(appSrc), 'Found forbidden paywall or API-key gate');
  });
});
