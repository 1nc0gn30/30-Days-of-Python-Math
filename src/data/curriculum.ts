import type { ChallengeCheckRule } from '../lib/pythonMathEngine';

export type CurriculumPhase =
  | 'Foundations'
  | 'Geometry & Trig'
  | 'Stats & Linear Algebra'
  | 'Calculus & Capstone';

export type VisualizerMode = 'function' | 'vector' | 'geometry' | 'stats';

export interface VisualizerPreset {
  mode: VisualizerMode;
  label: string;
  expression?: string;
  x0?: number;
  a?: number;
  b?: number;
  riemannN?: number;
  showDerivative?: boolean;
  showRiemann?: boolean;
  vecU?: [number, number];
  vecV?: [number, number];
  scalarK?: number;
  matrixA?: [[number, number], [number, number]];
  triangleA?: number;
  triangleB?: number;
  angleDeg?: number;
  dataset?: number[];
  trials?: number;
}

export interface QuizQuestion {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface DayLesson {
  day: number;
  phase: CurriculumPhase;
  title: string;
  topic: string;
  formula: string;
  explanation: string;
  keyTakeaways: string[];
  codeExample: string;
  challengeTask: string;
  hint: string;
  solutionCode: string;
  checkRule: ChallengeCheckRule;
  visualizer: VisualizerPreset;
  quiz: [QuizQuestion, QuizQuestion];
  resources: { title: string; url: string }[];
}

export const curriculum: DayLesson[] = [
  {
    day: 1,
    phase: 'Foundations',
    title: 'Arithmetic Basics',
    topic: 'Basic operations: +, -, *, /, //, % and order of operations.',
    formula: 'a / b = q + r/b   |   a = (a // b) * b + (a % b)',
    explanation:
      'Every numerical program starts with exact operator precedence (PEMDAS). Python distinguishes true division (/) which always returns a float, floor division (//) which rounds down toward negative infinity, and modulo (%) which gives the remainder. Grouping sub-expressions in parentheses eliminates ambiguity.',
    keyTakeaways: [
      'Use / for float division, // for quotient, and % for remainder.',
      'Order of precedence: parentheses -> ** -> *, /, //, % -> +, -.',
      'a == (a // b) * b + (a % b) holds for every nonzero integer b.'
    ],
    codeExample:
      "a = 18\nb = 5\nprint('sum:', a + b)\nprint('difference:', a - b)\nprint('product:', a * b)\nprint('quotient:', a / b)\nprint('remainder:', a % b)",
    challengeTask:
      'Compute and print the sum, difference, product, true quotient, and remainder for a = 42 and b = 8.',
    hint: 'Define a = 42 and b = 8, then print a + b, a - b, a * b, a / b, and a % b.',
    solutionCode:
      "a = 42\nb = 8\nprint('sum:', a + b)\nprint('difference:', a - b)\nprint('product:', a * b)\nprint('quotient:', a / b)\nprint('remainder:', a % b)",
    checkRule: {
      description: 'Prints all 5 arithmetic results for 42 and 8',
      minPrintLines: 5,
      requiredNumbers: [
        { value: 50, label: 'Sum equals 50' },
        { value: 34, label: 'Difference equals 34' },
        { value: 336, label: 'Product equals 336' },
        { value: 5.25, label: 'Quotient equals 5.25' },
        { value: 2, label: 'Remainder equals 2' }
      ]
    },
    visualizer: { mode: 'function', label: 'Linear Scaling f(x) = 0.5x + 1', expression: '0.5*x + 1', x0: 2, showDerivative: true },
    quiz: [
      {
        prompt: 'What does 17 // 5 evaluate to in Python?',
        options: ['3.4', '3', '2', '4'],
        correctIndex: 1,
        explanation: '// performs floor division, returning the integer quotient 3.'
      },
      {
        prompt: 'What is the result of 2 + 3 * 4?',
        options: ['20', '14', '24', '9'],
        correctIndex: 1,
        explanation: 'Multiplication binds tighter than addition: 2 + (3 * 4) = 14.'
      }
    ],
    resources: [
      { title: 'Python Numeric Types Docs', url: 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex' },
      { title: 'Khan Academy: Order of Operations', url: 'https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-arithmetic-operations' }
    ]
  },
  {
    day: 2,
    phase: 'Foundations',
    title: 'Exponents & Roots',
    topic: 'Using ** for powers and math.sqrt for square roots.',
    formula: 'x^(1/n) = nth root of x   |   a^(m+n) = a^m * a^n',
    explanation:
      'Exponentiation models compounding growth, area/volume scaling, and binary bit widths. In Python, ** is right-associative (2 ** 3 ** 2 equals 2 ** 9 = 512), and fractional exponents like x ** (1/3) compute nth roots while math.sqrt(x) computes fast IEEE-754 square roots.',
    keyTakeaways: [
      'Python uses ** (not ^) for exponentiation; ^ is bitwise XOR.',
      'math.sqrt(x) raises ValueError for negative real inputs.',
      'nth roots are written as x ** (1 / n).'
    ],
    codeExample:
      "import math\nvalue = 49\nprint('square root:', math.sqrt(value))\nprint('2^10:', 2 ** 10)\nprint('9^(1/2):', 9 ** 0.5)",
    challengeTask:
      'Compute and print the square root of 81, the cube root of 125 (using ** (1/3)), and 3 to the 7th power.',
    hint: 'Import math for math.sqrt(81), use 125 ** (1/3), and 3 ** 7.',
    solutionCode:
      "import math\nprint('sqrt(81):', math.sqrt(81))\nprint('cbrt(125):', round(125 ** (1 / 3), 6))\nprint('3^7:', 3 ** 7)",
    checkRule: {
      description: 'Prints sqrt(81)=9, cbrt(125)=5, and 3^7=2187',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 9, label: 'Square root of 81 equals 9' },
        { value: 5, tolerance: 0.01, label: 'Cube root of 125 equals 5' },
        { value: 2187, label: '3**7 equals 2187' }
      ]
    },
    visualizer: { mode: 'function', label: 'Quadratic Power y = x^2', expression: 'x**2', x0: 2 },
    quiz: [
      {
        prompt: 'What does 2 ** 3 ** 2 evaluate to in Python?',
        options: ['64', '512', '36', '12'],
        correctIndex: 1,
        explanation: '** is right-associative, so Python evaluates 2 ** (3 ** 2) = 2 ** 9 = 512.'
      },
      {
        prompt: 'Which expression computes the cube root of 27?',
        options: ['27 ^ (1/3)', '27 ** (1/3)', 'math.sqrt(27, 3)', '27 // 3'],
        correctIndex: 1,
        explanation: 'Fractional exponents x ** (1/n) compute nth roots in Python.'
      }
    ],
    resources: [
      { title: 'Python math.sqrt & Power Docs', url: 'https://docs.python.org/3/library/math.html#power-and-logarithmic-functions' },
      { title: 'Khan Academy: Exponents & Radicals', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals' }
    ]
  },
  {
    day: 3,
    phase: 'Foundations',
    title: 'Variables & Expressions',
    topic: 'Storing values and evaluating algebraic expressions.',
    formula: 'P(x, y) = 3x^2 + 2y - 5',
    explanation:
      'Variables bind symbolic names to numbers so formulas stay readable and reusable. Translating an algebraic expression into Python requires explicit multiplication (3 * x instead of 3x) and matching parentheses around numerator and denominator terms.',
    keyTakeaways: [
      'Always write explicit * between coefficients and variables (3 * x).',
      'Assign intermediate sub-expressions to variables to keep formulas verifiable.',
      'Re-binding a variable updates future calculations without mutating earlier ones.'
    ],
    codeExample:
      "x = 4\ny = 7\nexpr = 3 * x**2 + 2 * y - 5\nprint('expression value:', expr)",
    challengeTask:
      'Define a = 6, b = 8, c = 15, then evaluate and print a^2 + b^2 - c.',
    hint: 'Compute result = a**2 + b**2 - c and print it.',
    solutionCode:
      "a = 6\nb = 8\nc = 15\nresult = a**2 + b**2 - c\nprint('a^2 + b^2 - c =', result)",
    checkRule: {
      description: 'Evaluates 6^2 + 8^2 - 15 = 85',
      minPrintLines: 1,
      requiredNumbers: [{ value: 85, label: 'Expression evaluates to 85' }]
    },
    visualizer: { mode: 'function', label: 'Polynomial y = 0.5x^2 - 2x - 1', expression: '0.5*x**2 - 2*x - 1', x0: 2 },
    quiz: [
      {
        prompt: 'Why is 3x + 2 invalid Python syntax?',
        options: ['Variables cannot be named x', 'Python requires an explicit * operator (3 * x + 2)', 'Spaces are not allowed', 'Numbers cannot come first'],
        correctIndex: 1,
        explanation: 'Python never implies multiplication; you must write 3 * x + 2.'
      },
      {
        prompt: 'If x = 3 and y = 4, what is x**2 + y**2?',
        options: ['14', '25', '49', '12'],
        correctIndex: 1,
        explanation: '3**2 + 4**2 = 9 + 16 = 25.'
      }
    ],
    resources: [
      { title: 'Python Expressions Reference', url: 'https://docs.python.org/3/reference/expressions.html' },
      { title: 'Khan Academy: Algebraic Expressions', url: 'https://www.khanacademy.org/math/algebra-basics/alg-basics-algebraic-expressions' }
    ]
  },
  {
    day: 4,
    phase: 'Foundations',
    title: 'Data Types in Math',
    topic: 'Understanding integers, floats, and complex numbers.',
    formula: 'z = a + bi   |   |z| = sqrt(a^2 + b^2)',
    explanation:
      'Python provides arbitrary-precision integers (int), 64-bit IEEE-754 floating-point numbers (float), and native complex numbers (complex, written with j for the imaginary unit). Choosing the right type avoids precision loss and enables signal-processing and phasor math natively.',
    keyTakeaways: [
      'Integers have exact arbitrary precision; floats can exhibit binary rounding (0.1 + 0.2).',
      'Complex numbers use j: z = 3 + 4j has z.real == 3, z.imag == 4, abs(z) == 5.',
      'type(val) inspects the runtime numeric type.'
    ],
    codeExample:
      "n = 10\nf = 10.5\nz = 3 + 4j\nprint(type(n), type(f), type(z))\nprint('magnitude |z| =', abs(z))",
    challengeTask:
      'Create an int (12), a float (3.5), and a complex number (6 + 8j). Print each type and print abs(z).',
    hint: 'Use type(n), type(f), type(z), and abs(z) where z = 6 + 8j.',
    solutionCode:
      "n = 12\nf = 3.5\nz = 6 + 8j\nprint(n, type(n))\nprint(f, type(f))\nprint(z, type(z))\nprint('|z| =', abs(z))",
    checkRule: {
      description: 'Prints int, float, complex types and |6 + 8j| = 10',
      minPrintLines: 2,
      requiredOutputs: ['int', 'float', 'complex'],
      requiredNumbers: [{ value: 10, label: 'Complex magnitude |6 + 8j| equals 10' }]
    },
    visualizer: { mode: 'vector', label: 'Complex Plane z = 3 + 4i', vecU: [3, 4], vecV: [2, -1], scalarK: 1 },
    quiz: [
      {
        prompt: 'What is abs(3 + 4j) in Python?',
        options: ['7', '5', '12', 'TypeError'],
        correctIndex: 1,
        explanation: 'abs(a + bj) computes the Euclidean modulus sqrt(3^2 + 4^2) = 5.'
      },
      {
        prompt: 'What type does 8 / 2 return in Python 3?',
        options: ['int', 'float', 'Fraction', 'complex'],
        correctIndex: 1,
        explanation: 'True division (/) always returns a float (4.0) even when dividing cleanly.'
      }
    ],
    resources: [
      { title: 'Python Built-in Types', url: 'https://docs.python.org/3/library/stdtypes.html' },
      { title: 'Wolfram MathWorld: Complex Number', url: 'https://mathworld.wolfram.com/ComplexNumber.html' }
    ]
  },
  {
    day: 5,
    phase: 'Foundations',
    title: 'Fractions Module',
    topic: 'Exact rational arithmetic using fractions.Fraction.',
    formula: 'a/b + c/d = (ad + bc) / bd   (auto-reduced by gcd)',
    explanation:
      'Binary floating-point cannot represent 1/3 or 1/10 exactly. Python’s fractions.Fraction stores numerator and denominator as exact integers and automatically reduces every result to lowest terms using the greatest common divisor.',
    keyTakeaways: [
      'Fraction(2, 4) automatically simplifies to 1/2.',
      'Combine Fraction objects directly with +, -, *, /, and **.',
      'Ideal for exact probability ratios and algebraic verification.'
    ],
    codeExample:
      "from fractions import Fraction\na = Fraction(1, 3)\nb = Fraction(1, 6)\nprint('a + b =', a + b)\nprint('a * b =', a * b)",
    challengeTask:
      'Use Fraction to compute 2/5 + 3/10 and (2/5) * (5/6), then print both exact reduced fractions.',
    hint: 'Import Fraction from fractions and print Fraction(2, 5) + Fraction(3, 10) and Fraction(2, 5) * Fraction(5, 6).',
    solutionCode:
      "from fractions import Fraction\ns = Fraction(2, 5) + Fraction(3, 10)\np = Fraction(2, 5) * Fraction(5, 6)\nprint('sum:', s)\nprint('product:', p)",
    checkRule: {
      description: 'Computes exact fractions 7/10 and 1/3',
      minPrintLines: 2,
      requiredCodePatterns: [{ pattern: 'Fraction', label: 'Uses Fraction class' }],
      requiredOutputs: ['7/10', '1/3']
    },
    visualizer: { mode: 'function', label: 'Rational Line y = (7/10)x', expression: '0.7*x', x0: 1 },
    quiz: [
      {
        prompt: 'What does Fraction(6, 9) print as?',
        options: ['6/9', '0.6667', '2/3', '3/2'],
        correctIndex: 2,
        explanation: 'Fraction automatically reduces numerator and denominator by gcd(6, 9) = 3.'
      },
      {
        prompt: 'What is Fraction(1, 4) + Fraction(1, 2)?',
        options: ['Fraction(2, 6)', 'Fraction(3, 4)', '0.75', 'Fraction(1, 6)'],
        correctIndex: 1,
        explanation: '1/4 + 2/4 = 3/4 kept as an exact Fraction.'
      }
    ],
    resources: [
      { title: 'Python fractions Module Docs', url: 'https://docs.python.org/3/library/fractions.html' },
      { title: 'Khan Academy: Rational Numbers', url: 'https://www.khanacademy.org/math/cc-seventh-grade-math/cc-7th-fractions-decimals' }
    ]
  },
  {
    day: 6,
    phase: 'Foundations',
    title: 'Simple Algebra',
    topic: 'Programmatically solving linear equations ax + b = c.',
    formula: 'ax + b = c   =>   x = (c - b) / a   (a != 0)',
    explanation:
      'Solving an equation isolates the unknown variable using inverse operations. By writing the general symbolic solution x = (c - b) / a in Python, you turn a single homework problem into a reusable solver that checks its own answer by substitution.',
    keyTakeaways: [
      'Subtract constants first, then divide by the coefficient of x.',
      'Always guard against a == 0 (parallel or coincident lines).',
      'Verify by substituting x back into a * x + b to confirm equality with c.'
    ],
    codeExample:
      "a = 12\nb = 29\n# Solve x + a = b\nx = b - a\nprint('x =', x)\nprint('check x + a =', x + a)",
    challengeTask:
      'Solve 3x + 7 = 34 for x, print x, and print a verification line showing 3 * x + 7.',
    hint: 'Rearrange 3x + 7 = 34 to x = (34 - 7) / 3.',
    solutionCode:
      "a, b, c = 3, 7, 34\nx = (c - b) / a\nprint('x =', x)\nprint('verify 3x + 7 =', a * x + b)",
    checkRule: {
      description: 'Solves 3x + 7 = 34 => x = 9 and verifies 34',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 9, label: 'Solution x equals 9' },
        { value: 34, label: 'Verification equals 34' }
      ]
    },
    visualizer: { mode: 'function', label: 'Zero Crossing f(x) = 3x - 27', expression: '3*x - 27', x0: 9 },
    quiz: [
      {
        prompt: 'What is the root of 4x - 12 = 0?',
        options: ['x = -3', 'x = 3', 'x = 8', 'x = 48'],
        correctIndex: 1,
        explanation: '4x = 12 => x = 12 / 4 = 3.'
      },
      {
        prompt: 'When does ax + b = c have no unique solution?',
        options: ['When b = 0', 'When c = 0', 'When a = 0', 'When a < 0'],
        correctIndex: 2,
        explanation: 'Dividing by a = 0 is undefined; the x term vanishes.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Solving Linear Equations', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities' },
      { title: 'Wolfram MathWorld: Linear Equation', url: 'https://mathworld.wolfram.com/LinearEquation.html' }
    ]
  },
  {
    day: 7,
    phase: 'Foundations',
    title: 'Functions as Maps',
    topic: 'Defining mathematical f(x) maps with def and return.',
    formula: 'f: R -> R,   (f o g)(x) = f(g(x))',
    explanation:
      'A mathematical function maps every input in its domain to exactly one output. Python’s def keyword encodes that mapping directly, letting you compose functions like f(g(x)) and evaluate tables of inputs without duplicating formulas.',
    keyTakeaways: [
      'Pure math functions depend only on their arguments and return a value.',
      'Function composition f(g(x)) mirrors nested calls in Python.',
      'Prefer return over print inside math functions so results can be reused.'
    ],
    codeExample:
      "def f(x):\n    return 2 * x + 3\n\nfor x in [0, 1, 2, 5]:\n    print(f'f({x}) = {f(x)}')",
    challengeTask:
      'Define f(x) = x^2 + 1 and g(x) = 3x - 4. Print f(x) and g(x) for x in 1..5, plus the composed value f(g(3)).',
    hint: 'g(3) = 5, so f(g(3)) = 5^2 + 1 = 26.',
    solutionCode:
      "def f(x):\n    return x**2 + 1\n\ndef g(x):\n    return 3 * x - 4\n\nfor x in range(1, 6):\n    print(f'x={x}: f={f(x)}, g={g(x)}')\nprint('f(g(3)) =', f(g(3)))",
    checkRule: {
      description: 'Defines f(x), g(x) and prints outputs including f(g(3)) = 26',
      minPrintLines: 5,
      requiredCodePatterns: [{ pattern: 'def\\s+f\\s*\\(', label: 'Defines function f(x)' }],
      requiredNumbers: [
        { value: 2, label: 'f(1) equals 2' },
        { value: 26, label: 'f(5) / f(g(3)) equals 26' },
        { value: 11, label: 'g(5) equals 11' }
      ]
    },
    visualizer: { mode: 'function', label: 'Quadratic Map f(x) = x^2 + 1', expression: 'x**2 + 1', x0: 2 },
    quiz: [
      {
        prompt: 'If f(x) = x^2 + 1 and g(x) = 2x, what is f(g(3))?',
        options: ['19', '37', '20', '18'],
        correctIndex: 1,
        explanation: 'g(3) = 6, then f(6) = 6^2 + 1 = 37.'
      },
      {
        prompt: 'Why should a mathematical helper use return instead of only print?',
        options: ['print is slower', 'Returned values can be composed and tested in other expressions', 'Python forbids print in def', 'return rounds floats'],
        correctIndex: 1,
        explanation: 'Returning a value lets you pass f(x) into g(f(x)) or sum().'
      }
    ],
    resources: [
      { title: 'Python Defining Functions Tutorial', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions' },
      { title: 'Khan Academy: Functions', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions' }
    ]
  },
  {
    day: 8,
    phase: 'Geometry & Trig',
    title: 'Lists & Sequences',
    topic: 'Generating arithmetic and geometric sequences with lists.',
    formula: 'a_n = a_1 + (n - 1)d   |   g_n = g_1 * r^(n - 1)',
    explanation:
      'Ordered number sequences map naturally to Python lists. List comprehensions [2 * k for k in range(1, 11)] express set-builder notation directly in code, and slicing (seq[:3], seq[-1]) inspects terms cleanly.',
    keyTakeaways: [
      'List comprehensions mirror mathematical sequence notation {a_n}.',
      'Negative indices like seq[-1] access the final term in O(1).',
      'Slicing seq[start:stop] extracts subsequences without mutating the original.'
    ],
    codeExample:
      "nums = [2, 4, 6, 8]\nnums.append(10)\nprint('all:', nums)\nprint('first three:', nums[:3])",
    challengeTask:
      'Build a list of the first 10 positive even numbers [2, 4, ..., 20], then print the list, its length, and its last term.',
    hint: 'Use evens = [2 * i for i in range(1, 11)] and print evens, len(evens), evens[-1].',
    solutionCode:
      "evens = [2 * i for i in range(1, 11)]\nprint('evens:', evens)\nprint('count:', len(evens))\nprint('last:', evens[-1])",
    checkRule: {
      description: 'Generates first 10 positive even numbers and prints length 10 and last term 20',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 10, label: 'Length equals 10' },
        { value: 20, label: 'Final term equals 20' }
      ]
    },
    visualizer: { mode: 'function', label: 'Arithmetic Growth a(x) = 2x', expression: '2*x', x0: 5 },
    quiz: [
      {
        prompt: 'What is the 5th term of the arithmetic sequence a_n = 3 + 4(n - 1)?',
        options: ['15', '19', '23', '20'],
        correctIndex: 1,
        explanation: 'a_5 = 3 + 4 * 4 = 19.'
      },
      {
        prompt: 'What does [k**2 for k in range(1, 5)] produce?',
        options: ['[1, 4, 9, 16]', '[0, 1, 4, 9, 16]', '[1, 4, 9, 16, 25]', '[2, 4, 6, 8]'],
        correctIndex: 0,
        explanation: 'range(1, 5) yields 1, 2, 3, 4 whose squares are [1, 4, 9, 16].'
      }
    ],
    resources: [
      { title: 'Python Data Structures: Lists', url: 'https://docs.python.org/3/tutorial/datastructures.html' },
      { title: 'Khan Academy: Sequences', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:sequences' }
    ]
  },
  {
    day: 9,
    phase: 'Geometry & Trig',
    title: 'Sums & Products',
    topic: 'Computing sigma sums and pi products with loops and sum().',
    formula: 'Sum_{k=1..n} k = n(n+1)/2   |   Prod_{k=1..n} k = n!',
    explanation:
      'Sigma notation (summation) and capital-Pi notation (products) appear throughout calculus, statistics, and combinatorics. In Python, sum() aggregates any iterable while an accumulator loop computes products like factorials.',
    keyTakeaways: [
      'Initialize a sum accumulator to 0 and a product accumulator to 1.',
      'Gauss’s formula n*(n+1)//2 checks sum(range(1, n+1)) in O(1).',
      'sum(k**2 for k in range(1, n+1)) evaluates squared series cleanly.'
    ],
    codeExample:
      "values = [1, 2, 3, 4, 5]\nprint('sum:', sum(values))\nproduct = 1\nfor v in values:\n    product *= v\nprint('product:', product)",
    challengeTask:
      'Compute and print the sum of integers from 1 to 100 and the product of integers from 1 to 8 (8!).',
    hint: 'sum(range(1, 101)) = 5050 and 1*2*...*8 = 40320.',
    solutionCode:
      "total = sum(range(1, 101))\nprod = 1\nfor k in range(1, 9):\n    prod *= k\nprint('sum 1..100:', total)\nprint('product 1..8:', prod)",
    checkRule: {
      description: 'Computes sum(1..100)=5050 and 8!=40320',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 5050, label: 'Sum 1..100 equals 5050' },
        { value: 40320, label: 'Product 1..8 (8!) equals 40320' }
      ]
    },
    visualizer: { mode: 'function', label: 'Triangular Growth S(x) = x(x+1)/2', expression: 'x*(x+1)/2', x0: 4 },
    quiz: [
      {
        prompt: 'What is the closed-form value of Sum_{k=1..100} k?',
        options: ['5000', '5050', '10100', '4950'],
        correctIndex: 1,
        explanation: 'n(n+1)/2 = 100 * 101 / 2 = 5050.'
      },
      {
        prompt: 'What identity element should initialize a product accumulator?',
        options: ['0', '1', '-1', 'None'],
        correctIndex: 1,
        explanation: 'Multiplying by 0 always yields 0; 1 is the multiplicative identity.'
      }
    ],
    resources: [
      { title: 'Python Built-in sum()', url: 'https://docs.python.org/3/library/functions.html#sum' },
      { title: 'Wolfram MathWorld: Summation', url: 'https://mathworld.wolfram.com/Sum.html' }
    ]
  },
  {
    day: 10,
    phase: 'Geometry & Trig',
    title: 'Graphing Basics',
    topic: 'Sampling x, y coordinate pairs to represent curves.',
    formula: 'S = { (x_i, f(x_i)) : i = 0, 1, ..., N }',
    explanation:
      'Every digital graph is a discrete list of sampled (x, y) coordinate pairs connected by line segments. Generating x grids and mapping y = f(x) in Python teaches you how plotting engines sample domains and detect intercepts.',
    keyTakeaways: [
      'Sampling density controls curve smoothness on nonlinear functions.',
      'zip(x_values, y_values) pairs domain inputs with range outputs cleanly.',
      'Slope-intercept form y = m*x + b crosses the y-axis at (0, b).'
    ],
    codeExample:
      "x_values = list(range(-3, 4))\ny_values = [x**2 for x in x_values]\nfor x, y in zip(x_values, y_values):\n    print(f'x={x}, y={y}')",
    challengeTask:
      'Generate coordinate pairs for y = 2x + 1 over x from -5 to 5 (inclusive) and print each (x, y) pair.',
    hint: 'Use range(-5, 6), compute y = 2 * x + 1, and print each pair.',
    solutionCode:
      "xs = list(range(-5, 6))\nys = [2 * x + 1 for x in xs]\nfor x, y in zip(xs, ys):\n    print(f'({x}, {y})')",
    checkRule: {
      description: 'Prints 11 coordinate pairs for y = 2x + 1 over [-5, 5]',
      minPrintLines: 11,
      requiredNumbers: [
        { value: -9, label: 'Includes y(-5) = -9' },
        { value: 1, label: 'Includes y(0) = 1' },
        { value: 11, label: 'Includes y(5) = 11' }
      ]
    },
    visualizer: { mode: 'function', label: 'Linear Line y = 2x + 1', expression: '2*x + 1', x0: 1 },
    quiz: [
      {
        prompt: 'How many integers are generated by range(-5, 6)?',
        options: ['10', '11', '12', '9'],
        correctIndex: 1,
        explanation: 'range(-5, 6) includes -5 through 5 inclusive, which is 11 values.'
      },
      {
        prompt: 'Where does y = 2x + 1 cross the y-axis?',
        options: ['(0, 2)', '(1, 0)', '(0, 1)', '(-0.5, 0)'],
        correctIndex: 2,
        explanation: 'Setting x = 0 gives y = 1, so the y-intercept is (0, 1).'
      }
    ],
    resources: [
      { title: 'Python zip() Documentation', url: 'https://docs.python.org/3/library/functions.html#zip' },
      { title: 'Khan Academy: Graphing Lines', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs' }
    ]
  },
  {
    day: 11,
    phase: 'Geometry & Trig',
    title: 'Pythagorean Theorem',
    topic: 'Computing right-triangle hypotenuse and Euclidean distance.',
    formula: 'c = sqrt(a^2 + b^2)   |   d = sqrt((x2 - x1)^2 + (y2 - y1)^2)',
    explanation:
      'The Pythagorean theorem connects perpendicular displacements to straight-line Euclidean distance. Python offers both math.sqrt(a**2 + b**2) and math.hypot(a, b) which avoids intermediate overflow on huge values.',
    keyTakeaways: [
      'Classic integer Pythagorean triples: (3,4,5), (5,12,13), (8,15,17).',
      'math.hypot(a, b) is numerically safer than math.sqrt(a*a + b*b).',
      'Euclidean distance between 2D points is a direct application with dx and dy.'
    ],
    codeExample:
      "import math\na = 9\nb = 12\nc = math.sqrt(a*a + b*b)\nprint('hypotenuse:', c)",
    challengeTask:
      'Write a function hypotenuse(a, b) and print its output for (5, 12) and (8, 15).',
    hint: 'Return math.sqrt(a**2 + b**2) or math.hypot(a, b).',
    solutionCode:
      "import math\n\ndef hypotenuse(a, b):\n    return math.hypot(a, b)\n\nprint('5, 12 ->', hypotenuse(5, 12))\nprint('8, 15 ->', hypotenuse(8, 15))",
    checkRule: {
      description: 'Computes hypotenuses 13 and 17',
      minPrintLines: 2,
      requiredCodePatterns: [{ pattern: 'def\\s+\\w+', label: 'Defines a reusable function' }],
      requiredNumbers: [
        { value: 13, label: 'Hypotenuse of (5, 12) equals 13' },
        { value: 17, label: 'Hypotenuse of (8, 15) equals 17' }
      ]
    },
    visualizer: { mode: 'geometry', label: 'Right Triangle 3-4-5', triangleA: 4, triangleB: 3, angleDeg: 37 },
    quiz: [
      {
        prompt: 'What is the hypotenuse of a right triangle with legs 5 and 12?',
        options: ['13', '17', '14', '11'],
        correctIndex: 0,
        explanation: 'sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13.'
      },
      {
        prompt: 'Why is math.hypot(a, b) preferred for extreme values?',
        options: ['It returns an integer', 'It scales internally to avoid overflow/underflow', 'It does not need import math', 'It works on strings'],
        correctIndex: 1,
        explanation: 'math.hypot prevents a**2 from overflowing floating-point limits.'
      }
    ],
    resources: [
      { title: 'Python math.hypot Docs', url: 'https://docs.python.org/3/library/math.html#math.hypot' },
      { title: 'Khan Academy: Pythagorean Theorem', url: 'https://www.khanacademy.org/math/geometry/hs-geo-trig/hs-geo-pyth-theorem' }
    ]
  },
  {
    day: 12,
    phase: 'Geometry & Trig',
    title: 'Perimeter & Area',
    topic: '2D geometry formulas for rectangles, triangles, and circles.',
    formula: 'A_tri = (1/2)bh   |   A_circle = pi * r^2   |   C = 2 * pi * r',
    explanation:
      'Perimeter measures 1D boundary length while area measures 2D enclosed surface. Scaling a shape’s linear dimensions by k scales its perimeter by k and its area by k^2.',
    keyTakeaways: [
      'Use math.pi rather than hardcoded 3.14 for full precision.',
      'Doubling a circle’s radius quadruples its area.',
      'Keep units consistent (meters vs meters^2) when modeling real geometry.'
    ],
    codeExample:
      "import math\nlength, width = 8, 5\nradius = 3\nprint('rectangle area:', length * width)\nprint('rectangle perimeter:', 2 * (length + width))\nprint('circle area:', round(math.pi * radius**2, 4))",
    challengeTask:
      'Compute and print the area of a triangle (base = 10, height = 6) and the area and circumference of a circle (radius = 4).',
    hint: 'Triangle area = 0.5 * 10 * 6 = 30; circle area = pi * 16 ≈ 50.2655; circumference = 2 * pi * 4 ≈ 25.1327.',
    solutionCode:
      "import math\nbase, height = 10, 6\nr = 4\nprint('triangle area:', 0.5 * base * height)\nprint('circle area:', round(math.pi * r**2, 4))\nprint('circle circumference:', round(2 * math.pi * r, 4))",
    checkRule: {
      description: 'Computes triangle area 30, circle area ~50.27, circumference ~25.13',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 30, label: 'Triangle area equals 30' },
        { value: 50.265, tolerance: 0.05, label: 'Circle area ≈ 50.27' },
        { value: 25.132, tolerance: 0.05, label: 'Circumference ≈ 25.13' }
      ]
    },
    visualizer: { mode: 'geometry', label: 'Triangle & Circle Proportions', triangleA: 6, triangleB: 4, angleDeg: 45 },
    quiz: [
      {
        prompt: 'If you triple the radius of a circle, how does its area change?',
        options: ['3x larger', '6x larger', '9x larger', '27x larger'],
        correctIndex: 2,
        explanation: 'Area scales with r^2, so (3r)^2 = 9r^2.'
      },
      {
        prompt: 'What is the area of a triangle with base 12 and height 5?',
        options: ['60', '30', '17', '34'],
        correctIndex: 1,
        explanation: 'A = (1/2) * 12 * 5 = 30.'
      }
    ],
    resources: [
      { title: 'Python math.pi Constant', url: 'https://docs.python.org/3/library/math.html#constants' },
      { title: 'Khan Academy: Area & Perimeter', url: 'https://www.khanacademy.org/math/geometry-home/geometry-area-perimeter' }
    ]
  },
  {
    day: 13,
    phase: 'Geometry & Trig',
    title: 'Volume & Surface Area',
    topic: '3D geometry formulas for spheres, cubes, and cylinders.',
    formula: 'V_cyl = pi * r^2 * h   |   SA_cyl = 2*pi*r*(r + h)',
    explanation:
      'Three-dimensional solids obey the square-cube law: scaling linear dimensions by k increases surface area by k^2 and volume by k^3. Coding both formulas makes comparing surface-to-volume ratios across shapes immediate.',
    keyTakeaways: [
      'Cylinder volume is base circle area (pi*r^2) multiplied by height h.',
      'Cylinder surface area sums two circular caps (2*pi*r^2) plus the lateral wrap (2*pi*r*h).',
      'Sphere volume is (4/3)*pi*r^3 and surface area is 4*pi*r^2.'
    ],
    codeExample:
      "import math\nr = 4\nprint('sphere volume:', round((4/3) * math.pi * r**3, 3))\nprint('sphere surface area:', round(4 * math.pi * r**2, 3))",
    challengeTask:
      'For a cylinder with radius r = 3 and height h = 10, compute and print its volume and total surface area.',
    hint: 'Volume = pi * 9 * 10 ≈ 282.743; Surface Area = 2 * pi * 3 * (3 + 10) ≈ 245.044.',
    solutionCode:
      "import math\nr, h = 3, 10\nvol = math.pi * r**2 * h\nsa = 2 * math.pi * r * (r + h)\nprint('cylinder volume:', round(vol, 3))\nprint('cylinder surface area:', round(sa, 3))",
    checkRule: {
      description: 'Computes cylinder volume ~282.74 and surface area ~245.04',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 282.743, tolerance: 0.1, label: 'Cylinder volume ≈ 282.74' },
        { value: 245.044, tolerance: 0.1, label: 'Cylinder surface area ≈ 245.04' }
      ]
    },
    visualizer: { mode: 'function', label: 'Square-Cube Scaling V(x) = x^3', expression: 'x**3 / 4', x0: 2 },
    quiz: [
      {
        prompt: 'If a cube’s side length doubles, how does its volume change?',
        options: ['2x', '4x', '8x', '16x'],
        correctIndex: 2,
        explanation: 'Volume scales with the cube of linear size: 2^3 = 8.'
      },
      {
        prompt: 'What is the lateral (side-only) surface area of a cylinder?',
        options: ['pi * r^2 * h', '2 * pi * r * h', '2 * pi * r^2', '4 * pi * r^2'],
        correctIndex: 1,
        explanation: 'Unrolling the side produces a rectangle of width 2*pi*r and height h.'
      }
    ],
    resources: [
      { title: 'Wolfram MathWorld: Cylinder', url: 'https://mathworld.wolfram.com/Cylinder.html' },
      { title: 'Khan Academy: Volume & Surface Area', url: 'https://www.khanacademy.org/math/geometry/hs-geo-solids' }
    ]
  },
  {
    day: 14,
    phase: 'Geometry & Trig',
    title: 'Trigonometry Basics',
    topic: 'Computing sin, cos, and tan on the unit circle.',
    formula: 'sin^2(theta) + cos^2(theta) = 1   |   tan(theta) = sin(theta) / cos(theta)',
    explanation:
      'Sine and cosine give the (y, x) coordinates of a point on the unit circle at angle theta. They underpin oscillations, waves, rotations, and Fourier analysis. Python’s math.sin, math.cos, and math.tan always expect radians.',
    keyTakeaways: [
      'Always convert degrees to radians before calling math.sin/cos/tan.',
      'Verify accuracy with the Pythagorean identity sin^2 + cos^2 == 1.',
      'tan(theta) approaches infinity near 90° (pi/2) where cos(theta) = 0.'
    ],
    codeExample:
      "import math\nangle_deg = 30\nrad = math.radians(angle_deg)\nprint('sin(30):', round(math.sin(rad), 4))\nprint('cos(30):', round(math.cos(rad), 4))\nprint('tan(30):', round(math.tan(rad), 4))",
    challengeTask:
      'Print sin, cos, and tan for 45 degrees and 60 degrees (rounded to 4 decimal places).',
    hint: 'Use math.radians(45) and math.radians(60). Note tan(45°) = 1 and sin(60°) ≈ 0.8660.',
    solutionCode:
      "import math\nfor deg in [45, 60]:\n    r = math.radians(deg)\n    print(f'{deg} deg -> sin={math.sin(r):.4f}, cos={math.cos(r):.4f}, tan={math.tan(r):.4f}')",
    checkRule: {
      description: 'Computes sin, cos, tan for 45° and 60°',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 0.7071, tolerance: 0.01, label: 'sin/cos(45°) ≈ 0.7071' },
        { value: 1.0, tolerance: 0.01, label: 'tan(45°) ≈ 1.0' },
        { value: 0.866, tolerance: 0.01, label: 'sin(60°) ≈ 0.866' },
        { value: 0.5, tolerance: 0.01, label: 'cos(60°) ≈ 0.5' }
      ]
    },
    visualizer: { mode: 'geometry', label: 'Unit Circle Trig Projections', triangleA: 4, triangleB: 3, angleDeg: 45 },
    quiz: [
      {
        prompt: 'What unit do math.sin() and math.cos() expect in Python?',
        options: ['Degrees', 'Radians', 'Gradians', 'Turns'],
        correctIndex: 1,
        explanation: 'All trigonometric functions in Python’s math module take radians.'
      },
      {
        prompt: 'What is sin^2(theta) + cos^2(theta) for any real angle theta?',
        options: ['0', '1', 'pi', 'tan(theta)'],
        correctIndex: 1,
        explanation: 'Every point (cos theta, sin theta) lies on the unit circle x^2 + y^2 = 1.'
      }
    ],
    resources: [
      { title: 'Python math Trigonometric Functions', url: 'https://docs.python.org/3/library/math.html#trigonometric-functions' },
      { title: 'Khan Academy: Unit Circle Trigonometry', url: 'https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func' }
    ]
  },
  {
    day: 15,
    phase: 'Geometry & Trig',
    title: 'Radians vs Degrees',
    topic: 'Converting angles cleanly between degrees and radians.',
    formula: 'rad = deg * (pi / 180)   |   deg = rad * (180 / pi)',
    explanation:
      'One radian is the angle subtended when arc length equals the circle’s radius, making a full circle 2*pi radians (360°). Radians simplify calculus because d/dx sin(x) = cos(x) holds cleanly only in radians.',
    keyTakeaways: [
      '180° = pi radians, 90° = pi/2, 270° = 3*pi/2.',
      'math.radians(d) and math.degrees(r) prevent conversion mistakes.',
      'Arc length s = r * theta requires theta in radians.'
    ],
    codeExample:
      "import math\ndeg = 180\nrad = math.radians(deg)\nprint('radians:', round(rad, 4))\nprint('back to degrees:', math.degrees(rad))",
    challengeTask:
      'Convert 15, 90, and 270 degrees into radians and print each angle with its radian value.',
    hint: 'Loop over [15, 90, 270] and call math.radians(deg).',
    solutionCode:
      "import math\nfor deg in [15, 90, 270]:\n    print(f'{deg} deg = {math.radians(deg):.4f} rad')",
    checkRule: {
      description: 'Converts 15°, 90°, 270° to radians',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 0.2618, tolerance: 0.01, label: '15° ≈ 0.2618 rad' },
        { value: 1.5708, tolerance: 0.01, label: '90° ≈ 1.5708 rad' },
        { value: 4.7124, tolerance: 0.01, label: '270° ≈ 4.7124 rad' }
      ]
    },
    visualizer: { mode: 'geometry', label: 'Degree-to-Radian Unit Circle', triangleA: 5, triangleB: 3, angleDeg: 60 },
    quiz: [
      {
        prompt: 'How many radians equal 270 degrees?',
        options: ['pi', '3*pi/2', '2*pi', 'pi/3'],
        correctIndex: 1,
        explanation: '270 * (pi / 180) = (3/2) * pi ≈ 4.7124 radians.'
      },
      {
        prompt: 'Approximately how many degrees is 1 radian?',
        options: ['45°', '57.3°', '90°', '180°'],
        correctIndex: 1,
        explanation: '180 / pi ≈ 57.2958 degrees.'
      }
    ],
    resources: [
      { title: 'Python Angular Conversion Docs', url: 'https://docs.python.org/3/library/math.html#angular-conversion' },
      { title: 'Khan Academy: Radians', url: 'https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians' }
    ]
  },
  {
    day: 16,
    phase: 'Geometry & Trig',
    title: 'Logarithms & Exponentials',
    topic: 'Exploring math.log, math.log10, math.log2, and math.exp.',
    formula: 'y = e^x  <=>  x = ln(y)   |   log_b(x) = ln(x) / ln(b)',
    explanation:
      'Exponentials model compounding, radioactive decay, and neural activations; logarithms invert them to measure orders of magnitude, information entropy (bits via log2), and decibels (log10).',
    keyTakeaways: [
      'math.log(x) is natural log (base e); math.log(x, b) accepts a custom base.',
      'math.exp(math.log(x)) recovers x for any x > 0.',
      'Logarithms turn multiplication into addition: log(a * b) = log(a) + log(b).'
    ],
    codeExample:
      "import math\nprint('ln(20):', round(math.log(20), 4))\nprint('log10(1000):', math.log10(1000))\nprint('exp(2):', round(math.exp(2), 4))",
    challengeTask:
      'Verify exp(log(7.5)) recovers 7.5, and also compute log2(1024) and log10(100000).',
    hint: 'Use math.exp(math.log(7.5)), math.log2(1024), and math.log10(100000).',
    solutionCode:
      "import math\nval = 7.5\nrecovered = math.exp(math.log(val))\nprint('exp(ln(7.5)) =', round(recovered, 6))\nprint('log2(1024) =', math.log2(1024))\nprint('log10(100000) =', math.log10(100000))",
    checkRule: {
      description: 'Verifies exp(ln(7.5))=7.5, log2(1024)=10, log10(100000)=5',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 7.5, tolerance: 0.01, label: 'exp(ln(7.5)) equals 7.5' },
        { value: 10, label: 'log2(1024) equals 10' },
        { value: 5, label: 'log10(100000) equals 5' }
      ]
    },
    visualizer: { mode: 'function', label: 'Exponential Growth f(x) = exp(0.5x)', expression: 'exp(0.5*x)', x0: 1 },
    quiz: [
      {
        prompt: 'What is math.log2(256)?',
        options: ['6', '7', '8', '16'],
        correctIndex: 2,
        explanation: '2^8 = 256, so log2(256) = 8.'
      },
      {
        prompt: 'What does ln(a * b) equal for positive a and b?',
        options: ['ln(a) * ln(b)', 'ln(a) + ln(b)', 'ln(a) / ln(b)', 'ln(a)^b'],
        correctIndex: 1,
        explanation: 'The product rule for logarithms turns products into sums.'
      }
    ],
    resources: [
      { title: 'Python Power & Log Docs', url: 'https://docs.python.org/3/library/math.html#power-and-logarithmic-functions' },
      { title: 'Khan Academy: Logarithms', url: 'https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:logs' }
    ]
  },
  {
    day: 17,
    phase: 'Stats & Linear Algebra',
    title: 'Basic Statistics: Mean',
    topic: 'Calculating the arithmetic mean manually and with statistics.',
    formula: 'mu = (1/N) * Sum_{i=1..N} x_i',
    explanation:
      'The arithmetic mean is the balance point (center of mass) of a dataset. Computing sum(data) / len(data) manually reinforces the definition, while statistics.mean(data) provides a standard library check.',
    keyTakeaways: [
      'Always verify len(data) > 0 to avoid division by zero.',
      'Extreme outliers pull the mean strongly toward the tail.',
      'Sum of signed deviations from the mean is always zero.'
    ],
    codeExample:
      "scores = [72, 88, 91, 79, 95]\nmean = sum(scores) / len(scores)\nprint('mean:', mean)",
    challengeTask:
      'For the dataset [14, 18, 22, 26, 30, 34, 38, 42], compute and print the mean both manually and using statistics.mean.',
    hint: 'Both methods should output 28.0.',
    solutionCode:
      "import statistics\ndata = [14, 18, 22, 26, 30, 34, 38, 42]\nmanual_mean = sum(data) / len(data)\nlib_mean = statistics.mean(data)\nprint('manual mean:', manual_mean)\nprint('statistics.mean:', lib_mean)",
    checkRule: {
      description: 'Computes manual and statistics.mean equal to 28',
      minPrintLines: 2,
      requiredCodePatterns: [{ pattern: 'statistics\\.mean', label: 'Uses statistics.mean' }],
      requiredNumbers: [{ value: 28, label: 'Mean equals 28' }]
    },
    visualizer: { mode: 'stats', label: 'Sample Distribution & Mean', dataset: [14, 18, 22, 26, 30, 34, 38, 42], trials: 600 },
    quiz: [
      {
        prompt: 'What is the mean of [10, 20, 30, 40]?',
        options: ['20', '25', '30', '100'],
        correctIndex: 1,
        explanation: '(10 + 20 + 30 + 40) / 4 = 100 / 4 = 25.'
      },
      {
        prompt: 'How does adding a single massive outlier affect the mean?',
        options: ['No effect', 'Pulls the mean significantly toward the outlier', 'Always decreases the mean', 'Sets the mean to zero'],
        correctIndex: 1,
        explanation: 'Because every value contributes directly to the sum, outliers strongly shift the mean.'
      }
    ],
    resources: [
      { title: 'Python statistics Module Docs', url: 'https://docs.python.org/3/library/statistics.html' },
      { title: 'Khan Academy: Mean, Median, Mode', url: 'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data' }
    ]
  },
  {
    day: 18,
    phase: 'Stats & Linear Algebra',
    title: 'Median & Mode',
    topic: 'Finding central rank (median) and peak frequency (mode).',
    formula: 'Median = middle sorted value   |   Mode = argmax count(x)',
    explanation:
      'When data is skewed (such as incomes or latency spikes), the median stays robust because it depends only on rank order. The mode identifies the most common value, which works for both numeric and categorical observations.',
    keyTakeaways: [
      'For even-length sorted data, the median averages the two middle elements.',
      'Median resists outliers far better than the arithmetic mean.',
      'Compare mean vs median to detect right- or left-skewed distributions.'
    ],
    codeExample:
      "import statistics\ndata = [2, 3, 3, 7, 9, 10, 10, 10]\nprint('median:', statistics.median(data))\nprint('mode:', statistics.mode(data))",
    challengeTask:
      'Given data = [4, 7, 7, 9, 12, 15, 7, 40], print the mean, median, and mode using the statistics module.',
    hint: 'Sorted data is [4, 7, 7, 7, 9, 12, 15, 40]; median = 8, mode = 7, mean = 12.625.',
    solutionCode:
      "import statistics\ndata = [4, 7, 7, 9, 12, 15, 7, 40]\nprint('mean:', statistics.mean(data))\nprint('median:', statistics.median(data))\nprint('mode:', statistics.mode(data))",
    checkRule: {
      description: 'Prints mean=12.625, median=8, mode=7',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 12.625, tolerance: 0.01, label: 'Mean equals 12.625' },
        { value: 8, label: 'Median equals 8' },
        { value: 7, label: 'Mode equals 7' }
      ]
    },
    visualizer: { mode: 'stats', label: 'Skewed Dataset: Mean vs Median', dataset: [4, 7, 7, 9, 12, 15, 7, 40], trials: 600 },
    quiz: [
      {
        prompt: 'What is the median of [1, 3, 5, 100]?',
        options: ['3', '4', '5', '27.25'],
        correctIndex: 1,
        explanation: 'The two middle values are 3 and 5; their average is (3 + 5)/2 = 4.'
      },
      {
        prompt: 'Which measure best resists a single 10x outlier in latency metrics?',
        options: ['Mean', 'Median', 'Range', 'Sum'],
        correctIndex: 1,
        explanation: 'The median depends only on sorted position, not magnitude of extremes.'
      }
    ],
    resources: [
      { title: 'Python statistics.median & mode', url: 'https://docs.python.org/3/library/statistics.html#averages-and-measures-of-central-location' },
      { title: 'Wolfram MathWorld: Statistical Median', url: 'https://mathworld.wolfram.com/StatisticalMedian.html' }
    ]
  },
  {
    day: 19,
    phase: 'Stats & Linear Algebra',
    title: 'Measures of Spread',
    topic: 'Computing population variance and standard deviation.',
    formula: 'sigma^2 = (1/N) * Sum (x_i - mu)^2   |   sigma = sqrt(sigma^2)',
    explanation:
      'Two datasets can share the exact same mean while behaving completely differently. Variance averages the squared deviations from the mean, and standard deviation takes its square root to bring spread back to the original units.',
    keyTakeaways: [
      'Population variance divides by N (pvariance); sample variance divides by N - 1 (variance).',
      'Standard deviation shares units with the raw measurements.',
      'Zero variance means every observation in the dataset is identical.'
    ],
    codeExample:
      "import statistics\ndata = [10, 12, 13, 15, 20]\nprint('variance:', round(statistics.pvariance(data), 4))\nprint('std dev:', round(statistics.pstdev(data), 4))",
    challengeTask:
      'For data = [10, 12, 14, 16, 18, 20], compute and print the population variance and standard deviation.',
    hint: 'Use statistics.pvariance(data) ≈ 11.6667 and statistics.pstdev(data) ≈ 3.4157.',
    solutionCode:
      "import statistics\ndata = [10, 12, 14, 16, 18, 20]\nprint('pvariance:', round(statistics.pvariance(data), 4))\nprint('pstdev:', round(statistics.pstdev(data), 4))",
    checkRule: {
      description: 'Computes pvariance ≈ 11.6667 and pstdev ≈ 3.4157',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 11.6667, tolerance: 0.05, label: 'Population variance ≈ 11.67' },
        { value: 3.4157, tolerance: 0.05, label: 'Population std dev ≈ 3.42' }
      ]
    },
    visualizer: { mode: 'stats', label: 'Spread & Standard Deviation', dataset: [10, 12, 14, 16, 18, 20], trials: 800 },
    quiz: [
      {
        prompt: 'Why does standard deviation take the square root of variance?',
        options: ['To make it smaller than 1', 'To restore the original units of the data', 'To remove negative numbers', 'To compute the median'],
        correctIndex: 1,
        explanation: 'Variance is in squared units; taking sqrt returns original measurement units.'
      },
      {
        prompt: 'What is the population standard deviation of [5, 5, 5, 5]?',
        options: ['5', '1', '0', '20'],
        correctIndex: 2,
        explanation: 'All values equal the mean, so every deviation is 0.'
      }
    ],
    resources: [
      { title: 'Python Measures of Spread Docs', url: 'https://docs.python.org/3/library/statistics.html#measures-of-spread' },
      { title: 'Khan Academy: Variance & Standard Deviation', url: 'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data/variance-standard-deviation-population' }
    ]
  },
  {
    day: 20,
    phase: 'Stats & Linear Algebra',
    title: 'Fundamentals of Probability',
    topic: 'Monte Carlo simulation with the random module.',
    formula: 'P(E) = lim_{N->inf} count(E) / N   (Law of Large Numbers)',
    explanation:
      'By the Law of Large Numbers, running thousands of independent random trials converges toward the exact theoretical probability. Monte Carlo simulation lets you verify probability formulas and estimate systems too complex for closed-form math.',
    keyTakeaways: [
      'Seed random.seed(42) to make stochastic experiments reproducible.',
      'Estimation error shrinks proportionally to 1 / sqrt(N).',
      'Compare empirical frequency against theoretical P(E) = favorable / total.'
    ],
    codeExample:
      "import random\nrandom.seed(42)\ntrials = 1000\nheads = 0\nfor _ in range(trials):\n    heads += random.choice([0, 1])\nprint('estimated P(heads):', heads / trials)",
    challengeTask:
      'Simulate rolling a fair 6-sided die 3000 times (seed 42) and print both your estimated P(6) and theoretical 1/6.',
    hint: 'Count rolls where random.randint(1, 6) == 6 and divide by 3000.',
    solutionCode:
      "import random\nrandom.seed(42)\ntrials = 3000\nsixes = 0\nfor _ in range(trials):\n    if random.randint(1, 6) == 6:\n        sixes += 1\nprint('estimated P(6):', round(sixes / trials, 4))\nprint('theoretical 1/6:', round(1 / 6, 4))",
    checkRule: {
      description: 'Simulates die rolls and estimates P(6) near 0.1667',
      minPrintLines: 2,
      requiredCodePatterns: [{ pattern: 'random\\.', label: 'Uses random module' }],
      requiredNumbers: [{ value: 0.1667, tolerance: 0.03, label: 'Estimated P(6) within 0.03 of 0.1667' }]
    },
    visualizer: { mode: 'stats', label: 'Monte Carlo Die Distribution', dataset: [1, 2, 3, 4, 5, 6], trials: 1200 },
    quiz: [
      {
        prompt: 'What is the exact probability of rolling a 6 on a fair 6-sided die?',
        options: ['1/2', '1/6', '1/3', '1/36'],
        correctIndex: 1,
        explanation: 'One favorable face out of six equally likely faces gives 1/6 ≈ 0.1667.'
      },
      {
        prompt: 'Why set random.seed() in scientific code?',
        options: ['To make random numbers truly quantum', 'To make simulations repeatable and debuggable', 'To speed up loops', 'To prevent floats'],
        correctIndex: 1,
        explanation: 'A fixed seed reproduces the exact same pseudo-random sequence across runs.'
      }
    ],
    resources: [
      { title: 'Python random Module Docs', url: 'https://docs.python.org/3/library/random.html' },
      { title: 'Khan Academy: Probability', url: 'https://www.khanacademy.org/math/statistics-probability/probability-library' }
    ]
  },
  {
    day: 21,
    phase: 'Stats & Linear Algebra',
    title: 'Combinatorics',
    topic: 'Counting arrangements with math.perm and math.comb.',
    formula: 'P(n, k) = n! / (n - k)!   |   C(n, k) = n! / (k! (n - k)!)',
    explanation:
      'Combinatorics counts discrete possibilities without enumerating them one by one. Permutations P(n, k) treat order as distinct (race podiums, passcodes), whereas combinations C(n, k) ignore order (committees, card hands).',
    keyTakeaways: [
      'P(n, k) = C(n, k) * k! because each k-subset can be ordered k! ways.',
      'math.comb(n, k) computes binomial coefficients directly without factorial overflow.',
      'Order matters -> perm; order does not matter -> comb.'
    ],
    codeExample:
      "import math\nprint('perm(5, 2):', math.perm(5, 2))\nprint('comb(5, 2):', math.comb(5, 2))",
    challengeTask:
      'For n = 8 items choosing k = 3, compute and print math.perm(8, 3), math.comb(8, 3), and verify perm / comb == 3!.',
    hint: 'perm(8, 3) = 336, comb(8, 3) = 56, and 336 / 56 = 6 = math.factorial(3).',
    solutionCode:
      "import math\np = math.perm(8, 3)\nc = math.comb(8, 3)\nprint('P(8, 3) =', p)\nprint('C(8, 3) =', c)\nprint('ratio P/C =', p / c, '== 3! =', math.factorial(3))",
    checkRule: {
      description: 'Computes P(8,3)=336, C(8,3)=56, and ratio 6',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 336, label: 'P(8, 3) equals 336' },
        { value: 56, label: 'C(8, 3) equals 56' },
        { value: 6, label: 'Ratio equals 3! = 6' }
      ]
    },
    visualizer: { mode: 'stats', label: 'Binomial Coefficient Symmetry', dataset: [1, 7, 21, 35, 35, 21, 7, 1], trials: 500 },
    quiz: [
      {
        prompt: 'How many 3-person committees can be chosen from 8 people?',
        options: ['336', '56', '24', '512'],
        correctIndex: 1,
        explanation: 'Order does not matter for a committee: C(8, 3) = 8*7*6 / 6 = 56.'
      },
      {
        prompt: 'What is the ratio P(n, k) / C(n, k)?',
        options: ['k', 'n', 'k!', 'n - k'],
        correctIndex: 2,
        explanation: 'Each unordered subset of size k can be arranged in k! distinct orders.'
      }
    ],
    resources: [
      { title: 'Python math.comb & math.perm', url: 'https://docs.python.org/3/library/math.html#number-theoretic-and-representation-functions' },
      { title: 'Khan Academy: Permutations & Combinations', url: 'https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:prob-comb' }
    ]
  },
  {
    day: 22,
    phase: 'Stats & Linear Algebra',
    title: 'Vectors Basics',
    topic: 'Representing vectors, scalar multiplication, and magnitude.',
    formula: 'k * v = [k*v_1, k*v_2, ...]   |   ||v|| = sqrt(Sum v_i^2)',
    explanation:
      'Vectors combine magnitude and direction and form the building blocks of graphics, physics, and machine learning embeddings. Scalar multiplication stretches or reverses a vector without changing its line of action.',
    keyTakeaways: [
      'A negative scalar flips vector direction 180 degrees.',
      'Vector norm ||v|| generalizes the Pythagorean theorem to n dimensions.',
      'List comprehensions express element-wise vector operations concisely.'
    ],
    codeExample:
      "v = [2, -1, 4]\nscalar = 3\nscaled = [scalar * x for x in v]\nprint('scaled vector:', scaled)",
    challengeTask:
      'Given v = [3, 4], scale v by k = 2 and k = -1, print both scaled vectors, and print the Euclidean norm ||v||.',
    hint: '2*v = [6, 8], -1*v = [-3, -4], and norm = math.sqrt(3**2 + 4**2) = 5.',
    solutionCode:
      "import math\nv = [3, 4]\nfor k in [2, -1]:\n    print(f'{k} * v =', [k * x for x in v])\nnorm = math.sqrt(sum(x**2 for x in v))\nprint('||v|| =', norm)",
    checkRule: {
      description: 'Prints scaled vectors [6, 8], [-3, -4] and norm 5',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 6, label: 'Scaled x-component 6' },
        { value: 8, label: 'Scaled y-component 8' },
        { value: -3, label: 'Reversed x-component -3' },
        { value: 5, label: 'Norm ||v|| equals 5' }
      ]
    },
    visualizer: { mode: 'vector', label: 'Vector Scaling & Addition', vecU: [3, 2], vecV: [-1, 3], scalarK: 1.5 },
    quiz: [
      {
        prompt: 'What happens to a vector when multiplied by -2?',
        options: ['Rotates 90°', 'Doubles length and reverses direction', 'Halves length', 'Becomes zero'],
        correctIndex: 1,
        explanation: 'Magnitude scales by |-2| = 2 and the negative sign reverses direction.'
      },
      {
        prompt: 'What is the Euclidean norm of [1, 2, 2]?',
        options: ['5', '3', '9', '2.5'],
        correctIndex: 1,
        explanation: 'sqrt(1^2 + 2^2 + 2^2) = sqrt(9) = 3.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Vectors', url: 'https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces' },
      { title: 'Wolfram MathWorld: Vector Norm', url: 'https://mathworld.wolfram.com/VectorNorm.html' }
    ]
  },
  {
    day: 23,
    phase: 'Stats & Linear Algebra',
    title: 'Vector Dot Product',
    topic: 'Computing dot products and testing orthogonality.',
    formula: 'u . v = Sum u_i * v_i = ||u|| ||v|| cos(theta)',
    explanation:
      'The dot product collapses two equal-length vectors into a single scalar measuring directional alignment. When u · v == 0, the vectors are perpendicular (orthogonal); cosine similarity normalizes this value into [-1, 1].',
    keyTakeaways: [
      'u · v > 0 means acute angle (<90°); u · v == 0 means perpendicular; u · v < 0 means obtuse.',
      'sum(x * y for x, y in zip(u, v)) computes dot product in one line.',
      'Dot products power projections, lighting shaders, and attention scores in AI.'
    ],
    codeExample:
      "a = [1, 3, -2]\nb = [4, -1, 5]\ndot = sum(x * y for x, y in zip(a, b))\nprint('dot product:', dot)",
    challengeTask:
      'Write dot_product(u, v) and test it on ([2, 3], [4, -1]) and the orthogonal pair ([3, 2], [-2, 3]).',
    hint: '[2, 3]·[4, -1] = 8 - 3 = 5, and [3, 2]·[-2, 3] = -6 + 6 = 0.',
    solutionCode:
      "def dot_product(u, v):\n    return sum(a * b for a, b in zip(u, v))\n\nprint('pair 1:', dot_product([2, 3], [4, -1]))\nprint('orthogonal pair:', dot_product([3, 2], [-2, 3]))",
    checkRule: {
      description: 'Defines dot_product and outputs 5 and 0',
      minPrintLines: 2,
      requiredCodePatterns: [{ pattern: 'def\\s+dot_product', label: 'Defines dot_product function' }],
      requiredNumbers: [
        { value: 5, label: 'Dot product of pair 1 equals 5' },
        { value: 0, label: 'Orthogonal pair dot product equals 0' }
      ]
    },
    visualizer: { mode: 'vector', label: 'Dot Product & Angle Between Vectors', vecU: [3, 1], vecV: [-1, 3], scalarK: 1 },
    quiz: [
      {
        prompt: 'What does u · v = 0 tell you about two nonzero vectors?',
        options: ['They are parallel', 'They are perpendicular (90°)', 'They are equal', 'They have length 1'],
        correctIndex: 1,
        explanation: 'cos(90°) = 0, so a zero dot product indicates orthogonality.'
      },
      {
        prompt: 'What is [1, 2, 3] · [4, 5, 6]?',
        options: ['15', '32', '21', '72'],
        correctIndex: 1,
        explanation: '1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Vector Dot Product', url: 'https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces/dot-cross-products' },
      { title: 'Wolfram MathWorld: Dot Product', url: 'https://mathworld.wolfram.com/DotProduct.html' }
    ]
  },
  {
    day: 24,
    phase: 'Stats & Linear Algebra',
    title: 'Intro to Matrices',
    topic: 'Representing 2D matrices, indexing, and matrix trace.',
    formula: 'A in R^(m x n)   |   tr(A) = Sum_{i=0..n-1} A[i][i]',
    explanation:
      'A matrix is a rectangular grid of numbers representing linear transformations or systems of equations. In pure Python, an m×n matrix is stored as a list of m rows where element A[i][j] sits at row i, column j.',
    keyTakeaways: [
      'Dimensions are rows = len(A) and cols = len(A[0]).',
      'The main diagonal contains entries A[i][i]; their sum is the trace.',
      'Matrix indexing is 0-based in Python: row 2, col 3 is A[1][2].'
    ],
    codeExample:
      "matrix = [[1, 2, 3], [4, 5, 6]]\nprint('rows:', len(matrix))\nprint('cols:', len(matrix[0]))\nprint('entry (row 2, col 3):', matrix[1][2])",
    challengeTask:
      'Create the 3x3 matrix [[2, 1, 0], [4, 5, 3], [7, 8, 9]], print its main diagonal elements, and print its trace (sum of diagonal).',
    hint: 'Diagonal elements are [M[i][i] for i in range(3)] -> [2, 5, 9] with trace 16.',
    solutionCode:
      "M = [[2, 1, 0], [4, 5, 3], [7, 8, 9]]\ndiag = [M[i][i] for i in range(len(M))]\nprint('diagonal:', diag)\nprint('trace:', sum(diag))",
    checkRule: {
      description: 'Extracts diagonal [2, 5, 9] and prints trace 16',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 2, label: 'Includes M[0][0] = 2' },
        { value: 5, label: 'Includes M[1][1] = 5' },
        { value: 9, label: 'Includes M[2][2] = 9' },
        { value: 16, label: 'Trace equals 16' }
      ]
    },
    visualizer: {
      mode: 'vector',
      label: '2x2 Linear Transformation Grid',
      vecU: [2, 1],
      vecV: [1, 2],
      scalarK: 1,
      matrixA: [
        [1.4, 0.5],
        [-0.3, 1.2]
      ]
    },
    quiz: [
      {
        prompt: 'In M = [[10, 20], [30, 40]], what is M[1][0]?',
        options: ['10', '20', '30', '40'],
        correctIndex: 2,
        explanation: 'Row index 1 is [30, 40], and column index 0 of that row is 30.'
      },
      {
        prompt: 'What is the trace of the 3x3 identity matrix?',
        options: ['0', '1', '3', '9'],
        correctIndex: 2,
        explanation: 'The 3x3 identity has three 1s on its diagonal, so 1 + 1 + 1 = 3.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Matrices Intro', url: 'https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices' },
      { title: 'Wolfram MathWorld: Matrix Trace', url: 'https://mathworld.wolfram.com/MatrixTrace.html' }
    ]
  },
  {
    day: 25,
    phase: 'Stats & Linear Algebra',
    title: 'Matrix Addition',
    topic: 'Element-wise matrix addition with nested loops.',
    formula: '(A + B)_{i,j} = A_{i,j} + B_{i,j}   (same shape required)',
    explanation:
      'Matrix addition combines two matrices of identical dimensions entry by entry. It is commutative (A + B = B + A) and associative, forming the foundation for matrix algebra and image compositing.',
    keyTakeaways: [
      'Both matrices must share the exact same number of rows and columns.',
      'Nested loops iterate row i from 0..m-1 and column j from 0..n-1.',
      'Each entry C[i][j] = A[i][j] + B[i][j] is independent and parallelizable.'
    ],
    codeExample:
      "A = [[1, 2], [3, 4]]\nB = [[5, 6], [7, 8]]\nC = []\nfor i in range(len(A)):\n    row = []\n    for j in range(len(A[0])):\n        row.append(A[i][j] + B[i][j])\n    C.append(row)\nprint(C)",
    challengeTask:
      'Add A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] and B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]] and print the resulting 3x3 matrix row by row.',
    hint: 'Every single entry of A + B equals 10!',
    solutionCode:
      "A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nB = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]\nfor i in range(len(A)):\n    row = [A[i][j] + B[i][j] for j in range(len(A[0]))]\n    print(row)",
    checkRule: {
      description: 'Prints 3 rows of [10, 10, 10]',
      minPrintLines: 3,
      requiredOutputs: ['[10, 10, 10]']
    },
    visualizer: {
      mode: 'vector',
      label: 'Matrix Transform Shear & Determinant',
      vecU: [2, 1],
      vecV: [0, 2],
      scalarK: 1,
      matrixA: [
        [1, 0.7],
        [0, 1]
      ]
    },
    quiz: [
      {
        prompt: 'Can you add a 2x3 matrix to a 3x2 matrix?',
        options: ['Yes, result is 3x3', 'Yes, result is 2x2', 'No, dimensions must match identically', 'Only if entries are positive'],
        correctIndex: 2,
        explanation: 'Matrix addition is only defined when both matrices have identical rows and columns.'
      },
      {
        prompt: 'If A + B = 0 (zero matrix), what is B?',
        options: ['Identity matrix', 'Additive inverse -A', 'Transpose of A', 'Determinant of A'],
        correctIndex: 1,
        explanation: 'Every entry B[i][j] must equal -A[i][j].'
      }
    ],
    resources: [
      { title: 'Khan Academy: Adding & Subtracting Matrices', url: 'https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:adding-and-subtracting-matrices' },
      { title: 'Wolfram MathWorld: Matrix Addition', url: 'https://mathworld.wolfram.com/MatrixAddition.html' }
    ]
  },
  {
    day: 26,
    phase: 'Calculus & Capstone',
    title: 'Intro to Limits',
    topic: 'Numerical convergence toward removable singularities.',
    formula: 'lim_{x -> c} f(x) = L',
    explanation:
      'A limit captures the value a function approaches as x gets arbitrarily close to c—even when f(c) itself is undefined (0/0). Evaluating f(c + h) across shrinking step sizes h = 0.1, 0.01, 0.001 reveals the limiting behavior numerically.',
    keyTakeaways: [
      'A limit depends on behavior near c, not necessarily the value at c.',
      'Approach from both sides (c - h and c + h) to confirm two-sided convergence.',
      'Extremely tiny h (< 1e-12) introduces floating-point cancellation error.'
    ],
    codeExample:
      "def f(x):\n    return (x**2 - 1) / (x - 1)\n\nfor h in [1, 0.1, 0.01, 0.001]:\n    print(f'h={h}: f(1+h)={f(1 + h):.4f}')",
    challengeTask:
      'Approximate the limit of f(x) = (x^2 - 4) / (x - 2) as x approaches 2 using h in [0.1, 0.01, 0.001, 0.0001].',
    hint: 'Algebraically (x^2 - 4)/(x - 2) = x + 2, so the limit approaches 4.',
    solutionCode:
      "def f(x):\n    return (x**2 - 4) / (x - 2)\n\nfor h in [0.1, 0.01, 0.001, 0.0001]:\n    val = f(2 + h)\n    print(f'h={h} -> f(2+h)={val:.5f}')",
    checkRule: {
      description: 'Approximates limit converging to 4.0',
      minPrintLines: 4,
      requiredNumbers: [
        { value: 4.1, tolerance: 0.01, label: 'At h=0.1 equals 4.1' },
        { value: 4.0001, tolerance: 0.005, label: 'Converges toward 4.0' }
      ]
    },
    visualizer: { mode: 'function', label: 'Removable Limit (x^2 - 4)/(x - 2)', expression: '(x**2 - 4) / (x - 2)', x0: 2 },
    quiz: [
      {
        prompt: 'What is lim_{x->2} (x^2 - 4) / (x - 2)?',
        options: ['0', '2', '4', 'Undefined / infinity'],
        correctIndex: 2,
        explanation: 'Factoring gives (x - 2)(x + 2)/(x - 2) = x + 2 -> 4 as x -> 2.'
      },
      {
        prompt: 'Why can choosing h = 1e-18 give inaccurate numerical limits in float64?',
        options: ['Python forbids small numbers', 'Floating-point rounding cancels significant digits', 'Limits stop working below 0.01', 'Division becomes multiplication'],
        correctIndex: 1,
        explanation: 'IEEE-754 float64 has ~15-17 decimal digits of precision, so 2 + 1e-18 rounds back to 2.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Limits & Continuity', url: 'https://www.khanacademy.org/math/calculus-1/cs1-limits-and-continuity' },
      { title: 'Wolfram MathWorld: Limit', url: 'https://mathworld.wolfram.com/Limit.html' }
    ]
  },
  {
    day: 27,
    phase: 'Calculus & Capstone',
    title: 'Rates of Change',
    topic: 'Average rate of change (secant slope) between points.',
    formula: 'm = (y_2 - y_1) / (x_2 - x_1) = Delta y / Delta x',
    explanation:
      'Slope measures how rapidly output y changes per unit change in input x. Computing secant slopes across consecutive points shows whether a curve is accelerating (increasing slope), constant (linear), or decelerating.',
    keyTakeaways: [
      'Positive slope means rising; negative means falling; zero means flat.',
      'A linear function has identical slope between every pair of points.',
      'Nonlinear curves have changing slopes across intervals.'
    ],
    codeExample:
      "x1, y1 = 2, 5\nx2, y2 = 7, 20\nslope = (y2 - y1) / (x2 - x1)\nprint('slope:', slope)",
    challengeTask:
      'Given points (1, 1), (3, 9), and (6, 36) on y = x^2, compute and print the slope between each consecutive pair.',
    hint: 'Slope 1 = (9 - 1)/(3 - 1) = 4; Slope 2 = (36 - 9)/(6 - 3) = 9.',
    solutionCode:
      "def slope(p1, p2):\n    return (p2[1] - p1[1]) / (p2[0] - p1[0])\n\npts = [(1, 1), (3, 9), (6, 36)]\nprint('slope (1,1)->(3,9):', slope(pts[0], pts[1]))\nprint('slope (3,9)->(6,36):', slope(pts[1], pts[2]))",
    checkRule: {
      description: 'Computes slopes 4 and 9',
      minPrintLines: 2,
      requiredNumbers: [
        { value: 4, label: 'First slope equals 4' },
        { value: 9, label: 'Second slope equals 9' }
      ]
    },
    visualizer: { mode: 'function', label: 'Changing Slope on y = x^2', expression: 'x**2', x0: 1.5, showDerivative: true },
    quiz: [
      {
        prompt: 'What is the slope between (2, 4) and (6, 16)?',
        options: ['2', '3', '4', '12'],
        correctIndex: 1,
        explanation: '(16 - 4) / (6 - 2) = 12 / 4 = 3.'
      },
      {
        prompt: 'What does a zero average rate of change over [a, b] imply?',
        options: ['f(x) is always 0', 'f(a) equals f(b)', 'The curve is vertical', 'x cannot change'],
        correctIndex: 1,
        explanation: '(f(b) - f(a)) / (b - a) = 0 implies f(b) = f(a).'
      }
    ],
    resources: [
      { title: 'Khan Academy: Average Rate of Change', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions/x2f8bb11595b61c86:average-rate-of-change' },
      { title: 'Wolfram MathWorld: Slope', url: 'https://mathworld.wolfram.com/Slope.html' }
    ]
  },
  {
    day: 28,
    phase: 'Calculus & Capstone',
    title: 'Numerical Derivatives',
    topic: 'Finite differences and tangent line slopes.',
    formula: "f'(x) ≈ (f(x + h) - f(x)) / h   |   Central: (f(x + h) - f(x - h)) / (2h)",
    explanation:
      'The derivative is the instantaneous rate of change—the slope of the tangent line at x. Finite difference formulas approximate derivatives numerically for any black-box function, with central difference achieving O(h^2) accuracy.',
    keyTakeaways: [
      'Forward difference has O(h) error; central difference has O(h^2) error.',
      'Step size h ≈ 1e-4 to 1e-5 balances truncation and floating-point rounding.',
      'Gradient descent optimizes machine learning models using derivatives.'
    ],
    codeExample:
      "def f(x):\n    return x**3\n\nx = 2\nh = 1e-4\nderiv = (f(x + h) - f(x - h)) / (2 * h)\nprint('approx f\\'(2):', round(deriv, 4))",
    challengeTask:
      'Approximate the derivative of f(x) = x^2 + 3x at x = 4 using h = 0.1, 0.01, and 0.001, and print each estimate (exact value is 11).',
    hint: 'Since f\'(x) = 2x + 3, at x = 4 the exact derivative is 2(4) + 3 = 11.',
    solutionCode:
      "def f(x):\n    return x**2 + 3 * x\n\nx = 4\nfor h in [0.1, 0.01, 0.001]:\n    est = (f(x + h) - f(x)) / h\n    print(f'h={h} -> approx derivative = {est:.4f}')",
    checkRule: {
      description: 'Approximates f\'(4) converging to 11',
      minPrintLines: 3,
      requiredNumbers: [
        { value: 11.1, tolerance: 0.02, label: 'At h=0.1 ≈ 11.1 (or 11.0 central)' },
        { value: 11.0, tolerance: 0.02, label: 'Converges to exact derivative 11' }
      ]
    },
    visualizer: {
      mode: 'function',
      label: 'Tangent Line & Derivative Explorer',
      expression: '0.25*x**3 - x',
      x0: 1.5,
      showDerivative: true
    },
    quiz: [
      {
        prompt: 'What is the exact derivative of f(x) = x^2 + 3x at x = 4?',
        options: ['8', '11', '19', '28'],
        correctIndex: 1,
        explanation: 'f\'(x) = 2x + 3, so f\'(4) = 2(4) + 3 = 11.'
      },
      {
        prompt: 'Why is the central difference (f(x+h)-f(x-h))/(2h) more accurate than forward difference?',
        options: ['It uses larger h', 'First-order error terms cancel symmetrically', 'It avoids division', 'It only works for polynomials'],
        correctIndex: 1,
        explanation: 'Taylor expansion cancels the O(h) error term, leaving O(h^2) error.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Derivatives', url: 'https://www.khanacademy.org/math/calculus-1/cs1-derivatives-definition-and-basic-rules' },
      { title: 'Wolfram MathWorld: Finite Difference', url: 'https://mathworld.wolfram.com/FiniteDifference.html' }
    ]
  },
  {
    day: 29,
    phase: 'Calculus & Capstone',
    title: 'Numerical Integration',
    topic: 'Approximating definite integrals via Riemann sums.',
    formula: 'Int_a^b f(x) dx ≈ Sum_{i=0..n-1} f(x_i) * dx,   dx = (b - a) / n',
    explanation:
      'Integration accumulates quantities—area under a curve, total distance from velocity, or probability mass. Partitioning [a, b] into n thin rectangles of width dx and summing their areas gives a Riemann sum that converges to the exact integral as n grows.',
    keyTakeaways: [
      'Midpoint Riemann sums typically converge much faster than left/right sums.',
      'Signed area subtracts regions where f(x) < 0.',
      'Increasing n improves accuracy proportionally to 1/n (left) or 1/n^2 (midpoint).'
    ],
    codeExample:
      "def f(x):\n    return x**2\n\na, b, n = 0, 3, 1000\ndx = (b - a) / n\narea = 0\nfor i in range(n):\n    x = a + (i + 0.5) * dx\n    area += f(x) * dx\nprint('approx area:', round(area, 4))",
    challengeTask:
      'Approximate the integral of f(x) = 2x + 1 on [0, 5] using n = 1000 rectangles and print the estimated area (exact area is 30).',
    hint: 'The exact integral of 2x + 1 from 0 to 5 is [x^2 + x]_0^5 = 25 + 5 = 30.',
    solutionCode:
      "def f(x):\n    return 2 * x + 1\n\na, b, n = 0, 5, 1000\ndx = (b - a) / n\narea = 0\nfor i in range(n):\n    x = a + i * dx\n    area += f(x) * dx\nprint('approx integral:', round(area, 3))",
    checkRule: {
      description: 'Approximates integral of 2x + 1 on [0, 5] ≈ 30',
      minPrintLines: 1,
      requiredNumbers: [{ value: 30, tolerance: 0.1, label: 'Integral estimate ≈ 30' }]
    },
    visualizer: {
      mode: 'function',
      label: 'Riemann Sum Area Accumulator',
      expression: '0.3*x**2 + 0.5',
      x0: 1.5,
      a: 0,
      b: 3,
      riemannN: 12,
      showRiemann: true
    },
    quiz: [
      {
        prompt: 'What is the exact value of Int_0^3 x^2 dx?',
        options: ['3', '6', '9', '27'],
        correctIndex: 2,
        explanation: 'Antiderivative is x^3 / 3; evaluated from 0 to 3 gives 27/3 = 9.'
      },
      {
        prompt: 'What happens to rectangle width dx = (b - a) / n as n increases?',
        options: ['dx stays constant', 'dx shrinks toward 0, improving precision', 'dx grows linearly', 'dx becomes negative'],
        correctIndex: 1,
        explanation: 'More subdivisions yield narrower rectangles that hug the curve closely.'
      }
    ],
    resources: [
      { title: 'Khan Academy: Riemann Sums', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new/ab-6-2' },
      { title: 'Wolfram MathWorld: Riemann Sum', url: 'https://mathworld.wolfram.com/RiemannSum.html' }
    ]
  },
  {
    day: 30,
    phase: 'Calculus & Capstone',
    title: 'The Capstone',
    topic: 'Building a multi-function Python Math-Solver toolkit.',
    formula: 'x = (-b ± sqrt(b^2 - 4ac)) / (2a)   |   Composite Toolkit',
    explanation:
      'Your capstone integrates algebra, statistics, and numerical calculus into a single reusable module. Composing small, pure functions (linear/quadratic solver, descriptive stats, numerical derivative) mirrors real scientific Python libraries.',
    keyTakeaways: [
      'Keep each mathematical operation a small, testable pure function.',
      'Check domain invariants (discriminant >= 0, denominator != 0).',
      'Combine exact closed-form solvers with numerical approximations.'
    ],
    codeExample:
      "def solve_linear(a, b):\n    # Solve ax + b = 0\n    return -b / a\n\nprint('x for 2x + 6 = 0:', solve_linear(2, 6))",
    challengeTask:
      'Build a mini math-solver script with 3 functions: solve_quadratic(a, b, c) for x^2 - 5x + 6 = 0, stats_mean(xs) for [10, 20, 30, 40], and slope(p1, p2) for (1, 2) to (5, 14). Print all 3 results.',
    hint: 'Roots of x^2 - 5x + 6 = 0 are 3 and 2; mean is 25; slope is 3.',
    solutionCode:
      "import math\n\ndef solve_quadratic(a, b, c):\n    d = math.sqrt(b**2 - 4 * a * c)\n    return ((-b + d) / (2 * a), (-b - d) / (2 * a))\n\ndef stats_mean(xs):\n    return sum(xs) / len(xs)\n\ndef slope(p1, p2):\n    return (p2[1] - p1[1]) / (p2[0] - p1[0])\n\nprint('quadratic roots:', solve_quadratic(1, -5, 6))\nprint('mean:', stats_mean([10, 20, 30, 40]))\nprint('slope:', slope((1, 2), (5, 14)))",
    checkRule: {
      description: 'Runs quadratic solver (3, 2), mean (25), and slope (3)',
      minPrintLines: 3,
      requiredCodePatterns: [{ pattern: 'def\\s+', label: 'Defines reusable solver functions' }],
      requiredNumbers: [
        { value: 3, label: 'Quadratic root / slope includes 3' },
        { value: 2, label: 'Quadratic root includes 2' },
        { value: 25, label: 'Mean equals 25' }
      ]
    },
    visualizer: {
      mode: 'function',
      label: 'Capstone: Quadratic Roots & Tangent',
      expression: 'x**2 - 5*x + 6',
      x0: 2.5,
      a: 0,
      b: 4,
      riemannN: 16,
      showDerivative: true,
      showRiemann: true
    },
    quiz: [
      {
        prompt: 'What does the discriminant b^2 - 4ac = 0 indicate for a quadratic?',
        options: ['Two distinct real roots', 'Exactly one repeated real root', 'No real roots', 'Infinite roots'],
        correctIndex: 1,
        explanation: 'When sqrt(b^2 - 4ac) = 0, both roots collapse to x = -b / (2a).'
      },
      {
        prompt: 'What are the roots of x^2 - 5x + 6 = 0?',
        options: ['x = -2, -3', 'x = 2, 3', 'x = 1, 6', 'x = -1, 6'],
        correctIndex: 1,
        explanation: 'x^2 - 5x + 6 factors as (x - 2)(x - 3) = 0, giving roots 2 and 3.'
      }
    ],
    resources: [
      { title: 'Python Official Math Library', url: 'https://docs.python.org/3/library/math.html' },
      { title: 'Wolfram MathWorld: Quadratic Formula', url: 'https://mathworld.wolfram.com/QuadraticFormula.html' }
    ]
  }
];

export function getLessonByDay(day: number): DayLesson {
  return curriculum.find(item => item.day === day) ?? curriculum[0];
}
