# 30 Days of Python Math

Open-access 30-day curriculum for learning mathematics through Python code, interactive `<canvas>` visualizations, and deterministic in-browser verification.

- **Live URL**: [https://python-math.nealfrazier.tech/](https://python-math.nealfrazier.tech/)
- **Repository**: [https://github.com/1nc0gn30/30-Days-of-Python-Math](https://github.com/1nc0gn30/30-Days-of-Python-Math)
- **Author**: Neal Frazier Tech (`@1nc0gn30`) • [NullAI Platform](https://nullai.tech)

## What It Includes

- **30 Structured Lessons across 4 Phases**:
  - **Days 1–7 (Foundations)**: Arithmetic, exponents & roots, algebraic expressions, `int`/`float`/`complex` types, exact `fractions.Fraction`, linear equations, functions as maps.
  - **Days 8–16 (Geometry & Trig)**: Lists & sequences, sums & products, coordinate graphing, Pythagorean theorem, 2D/3D geometry, trigonometry, radians vs degrees, logarithms & exponentials.
  - **Days 17–25 (Stats & Linear Algebra)**: Mean, median & mode, variance & standard deviation, Monte Carlo probability simulation, combinatorics (`math.perm`, `math.comb`), vectors, dot products, 2D matrices & matrix addition.
  - **Days 26–30 (Calculus & Capstone)**: Numerical limits, rates of change, finite-difference derivatives, Riemann sum integration, and a multi-function math solver capstone.
- **Zero-Backend Python Math Sandbox (`src/lib/pythonMathEngine.ts`)**: Runs Python math code directly in the browser with support for `math`, `fractions.Fraction`, `statistics`, seeded `random`, complex numbers, `def`, loops, list comprehensions, f-strings, and deterministic challenge grading—no API keys or server calls required.
- **4-Mode Interactive `<canvas>` Math Visualizer (`src/components/MathVisualizer.tsx`)**:
  - Function & Calculus plotter with custom `f(x)` input, tangent line `f'(x)`, and Riemann sum rectangles.
  - 2D Vector & 2×2 Matrix transformation grid with live dot product, angle, magnitude, and determinant.
  - Geometry & Unit Circle explorer for Pythagorean triangles and degree/radian trig projections.
  - Probability & Statistics Monte Carlo histogram and combinatorics calculator.
- **60 Concept Check Quiz Questions**: 2 multiple-choice questions per day with instant explanations, persisted locally via `localStorage` alongside code drafts and completed days.

## Local Development

```bash
npm install
npm run dev
```

App serves on `http://localhost:3000`.

## Testing & Verification

```bash
npm run lint   # TypeScript typecheck (tsc --noEmit)
npm test       # Runs all 30 example + solution tests, math engine unit tests, and SEO/Netlify guardrails
npm run build  # Production Vite build to dist/
```

## Deployment (Netlify)

Configured in `netlify.toml` and `public/_redirects`:

- Build command: `npm run build`
- Publish directory: `dist`
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) and SPA catch-all redirect (`/* -> /index.html 200`).
