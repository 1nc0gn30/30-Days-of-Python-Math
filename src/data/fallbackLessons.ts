export interface FallbackLessonData {
  explanation: string;
  codeExample: string;
  challengeTask: string;
  resources: { title: string; url: string }[];
}

const commonResources = [
  { title: 'Python Official Docs', url: 'https://docs.python.org/3/' },
  { title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math' },
  { title: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com/' }
];

const fallbackLessonsByDay: Record<number, FallbackLessonData> = {
  1: {
    explanation: 'Arithmetic is the foundation for every math program you write. In Python, you can combine +, -, *, /, and % to model calculations and verify them quickly. Practice grouping with parentheses so order of operations is explicit and readable.',
    codeExample: "a = 18\nb = 5\nprint('sum:', a + b)\nprint('difference:', a - b)\nprint('product:', a * b)\nprint('quotient:', a / b)\nprint('remainder:', a % b)",
    challengeTask: 'Create a small calculator script that prints the results of all five operations for two numbers of your choice.',
    resources: commonResources
  },
  2: {
    explanation: 'Exponents and roots show up in growth models, geometry, and statistics. Python gives you ** for powers and math.sqrt for roots, so you can evaluate these expressions directly and compare exact vs decimal outputs.',
    codeExample: "import math\nvalue = 49\nprint('square root:', math.sqrt(value))\nprint('2^10:', 2 ** 10)\nprint('9^(1/2):', 9 ** 0.5)",
    challengeTask: 'Compute and print the square root of 81, cube root of 125 (using exponent form), and 3 to the 7th power.',
    resources: commonResources
  },
  3: {
    explanation: 'Variables let you name numbers so formulas are easier to read and change. Instead of repeating values, define symbols like x, y, and z and then evaluate expressions exactly the way they appear in algebra.',
    codeExample: "x = 4\ny = 7\nexpr = 3 * x**2 + 2 * y - 5\nprint('expression value:', expr)",
    challengeTask: 'Define variables a, b, c and evaluate the expression a^2 + b^2 - c. Print both the formula name and result.',
    resources: commonResources
  },
  4: {
    explanation: 'Math code depends on data types. Integers are exact whole numbers, floats represent decimals, and complex numbers include imaginary parts. Knowing types helps you avoid subtle bugs in division and conversions.',
    codeExample: "n = 10\nf = 10.5\nz = 3 + 4j\nprint(type(n), type(f), type(z))\nprint('n / 4 =', n / 4)",
    challengeTask: 'Write a script that creates one int, one float, and one complex number, then prints each value and its type.',
    resources: commonResources
  },
  5: {
    explanation: 'Fractions are useful when decimal rounding is not acceptable. The fractions module keeps rational values exact, which is ideal for educational math, probability, and symbolic-style computations.',
    codeExample: "from fractions import Fraction\na = Fraction(1, 3)\nb = Fraction(1, 6)\nprint('a + b =', a + b)\nprint('a * b =', a * b)",
    challengeTask: 'Use Fraction to add 2/5 and 3/10, then simplify and print the final exact fraction.',
    resources: commonResources
  },
  6: {
    explanation: 'Simple algebra is solving for unknown values using inverse operations. In code, you can rearrange equations and compute x directly. This builds the habit of translating word problems into formulas.',
    codeExample: "a = 12\nb = 29\n# x + a = b\nx = b - a\nprint('x =', x)",
    challengeTask: 'Solve for x in the equation 3x + 7 = 34 and print x.',
    resources: commonResources
  },
  7: {
    explanation: 'Functions map input values to output values. With def, you can encode reusable math rules and evaluate them for many x values without rewriting logic.',
    codeExample: "def f(x):\n    return 2 * x + 3\n\nfor x in [0, 1, 2, 5]:\n    print(x, '->', f(x))",
    challengeTask: 'Create two functions f(x)=x^2+1 and g(x)=3x-4, then print both outputs for x from 1 to 5.',
    resources: commonResources
  },
  8: {
    explanation: 'Lists are great for storing numeric sequences. Once numbers are in a list, you can slice, update, and iterate to compute trends, sums, and transformations.',
    codeExample: "nums = [2, 4, 6, 8]\nnums.append(10)\nprint('all:', nums)\nprint('first three:', nums[:3])",
    challengeTask: 'Build a list of the first 10 even numbers, then print the list and its length.',
    resources: commonResources
  },
  9: {
    explanation: 'Series calculations are common in finance and science. Python lets you compute totals with sum and products with loops so you can model arithmetic and geometric sequences directly.',
    codeExample: "values = [1, 2, 3, 4, 5]\nprint('sum:', sum(values))\nproduct = 1\nfor v in values:\n    product *= v\nprint('product:', product)",
    challengeTask: 'Compute the sum of numbers 1..100 and the product of numbers 1..8 in the same script.',
    resources: commonResources
  },
  10: {
    explanation: 'Before plotting, it helps to generate x and y coordinates manually. This teaches how formulas produce curves and how data points are prepared for graphing libraries later.',
    codeExample: "x_values = list(range(-3, 4))\ny_values = [x**2 for x in x_values]\nfor x, y in zip(x_values, y_values):\n    print(f'x={x}, y={y}')",
    challengeTask: 'Generate coordinate pairs for y = 2x + 1 over x from -5 to 5 and print each pair.',
    resources: commonResources
  },
  11: {
    explanation: 'The Pythagorean theorem links right-triangle sides: a^2 + b^2 = c^2. Python can compute c with math.sqrt and help validate geometry problems quickly.',
    codeExample: "import math\na = 9\nb = 12\nc = math.sqrt(a*a + b*b)\nprint('hypotenuse:', c)",
    challengeTask: 'Write a function that takes legs a and b and returns the hypotenuse c.',
    resources: commonResources
  },
  12: {
    explanation: 'Area and perimeter formulas are practical for design, architecture, and simulations. Implementing these formulas in code reinforces variable use and unit thinking.',
    codeExample: "import math\nlength, width = 8, 5\nradius = 3\nprint('rectangle area:', length * width)\nprint('rectangle perimeter:', 2 * (length + width))\nprint('circle area:', math.pi * radius**2)",
    challengeTask: 'Compute area for a triangle (base and height) and a circle (radius), then print both values.',
    resources: commonResources
  },
  13: {
    explanation: '3D formulas extend area ideas into volume and surface area. Coding these equations helps you compare shapes and understand how dimensions scale differently in 2D vs 3D.',
    codeExample: "import math\nr = 4\nprint('sphere volume:', (4/3) * math.pi * r**3)\nprint('sphere surface area:', 4 * math.pi * r**2)",
    challengeTask: 'Given radius r and height h, compute cylinder volume and surface area.',
    resources: commonResources
  },
  14: {
    explanation: 'Trigonometric functions relate angles and side ratios. In Python, sin, cos, and tan use radians, which is important when modeling periodic behavior.',
    codeExample: "import math\nangle_deg = 30\nangle_rad = math.radians(angle_deg)\nprint('sin:', math.sin(angle_rad))\nprint('cos:', math.cos(angle_rad))\nprint('tan:', math.tan(angle_rad))",
    challengeTask: 'Print sin, cos, and tan for 45 and 60 degrees.',
    resources: commonResources
  },
  15: {
    explanation: 'Many libraries expect radians, but people often think in degrees. Converting both ways prevents unit mistakes and makes trig code much easier to debug.',
    codeExample: "import math\ndeg = 180\nrad = math.radians(deg)\nprint('radians:', rad)\nprint('back to degrees:', math.degrees(rad))",
    challengeTask: 'Convert 15, 90, and 270 degrees to radians and print each result.',
    resources: commonResources
  },
  16: {
    explanation: 'Logs and exponentials model growth, decay, and scales like pH and decibels. Python includes log, log10, and exp to explore inverse relationships between powers and logarithms.',
    codeExample: "import math\nprint('ln(20):', math.log(20))\nprint('log10(1000):', math.log10(1000))\nprint('exp(2):', math.exp(2))",
    challengeTask: 'Show that log and exp are inverses by computing exp(log(7.5)) and comparing to 7.5.',
    resources: commonResources
  },
  17: {
    explanation: 'The mean is the central average and a common summary statistic. Use lists and sum/len to compute it and confirm your result with Python’s statistics module if needed.',
    codeExample: "scores = [72, 88, 91, 79, 95]\nmean = sum(scores) / len(scores)\nprint('mean:', mean)",
    challengeTask: 'Create a list of 8 values and compute the mean two ways: manual formula and statistics.mean.',
    resources: commonResources
  },
  18: {
    explanation: 'Median is robust to outliers, while mode highlights most frequent values. Together they help describe skewed datasets where mean alone can mislead.',
    codeExample: "import statistics\ndata = [2, 3, 3, 7, 9, 10, 10, 10]\nprint('median:', statistics.median(data))\nprint('mode:', statistics.mode(data))",
    challengeTask: 'Given a list with repeated numbers, print both median and mode.',
    resources: commonResources
  },
  19: {
    explanation: 'Variance and standard deviation measure spread around the mean. These metrics help compare consistency between datasets with similar averages.',
    codeExample: "import statistics\ndata = [10, 12, 13, 15, 20]\nprint('variance:', statistics.pvariance(data))\nprint('std dev:', statistics.pstdev(data))",
    challengeTask: 'Compute population variance and standard deviation for your own 6-number dataset.',
    resources: commonResources
  },
  20: {
    explanation: 'Probability can be explored with random simulation. By running many trials, you can approximate expected outcomes and compare them with theoretical values.',
    codeExample: "import random\ntrials = 1000\nheads = 0\nfor _ in range(trials):\n    heads += random.choice([0, 1])\nprint('estimated P(heads):', heads / trials)",
    challengeTask: 'Simulate rolling a die 5000 times and estimate the probability of rolling 6.',
    resources: commonResources
  },
  21: {
    explanation: 'Combinatorics counts arrangements and selections. Permutations care about order, combinations do not. Python math.perm and math.comb make these counts immediate.',
    codeExample: "import math\nprint('perm(5, 2):', math.perm(5, 2))\nprint('comb(5, 2):', math.comb(5, 2))",
    challengeTask: 'For a set of 8 items, compute permutations and combinations for choosing 3.',
    resources: commonResources
  },
  22: {
    explanation: 'Vectors represent magnitude and direction. In basic programming exercises, lists are enough to model vectors and apply scalar multiplication cleanly.',
    codeExample: "v = [2, -1, 4]\nscalar = 3\nscaled = [scalar * x for x in v]\nprint('scaled vector:', scaled)",
    challengeTask: 'Create a 2D vector and multiply it by three different scalars. Print each result.',
    resources: commonResources
  },
  23: {
    explanation: 'Dot product combines matching components and is used for projections, similarity, and geometry checks. It is a simple loop or comprehension in Python.',
    codeExample: "a = [1, 3, -2]\nb = [4, -1, 5]\ndot = sum(x * y for x, y in zip(a, b))\nprint('dot product:', dot)",
    challengeTask: 'Write a reusable dot_product(v1, v2) function and test it with at least two vector pairs.',
    resources: commonResources
  },
  24: {
    explanation: 'Matrices can be represented as lists of lists. Understanding row/column indexing is key before moving to advanced libraries like NumPy.',
    codeExample: "matrix = [[1, 2, 3], [4, 5, 6]]\nprint('rows:', len(matrix))\nprint('cols:', len(matrix[0]))\nprint('entry (row 2, col 3):', matrix[1][2])",
    challengeTask: 'Create a 3x3 matrix and print the diagonal elements.',
    resources: commonResources
  },
  25: {
    explanation: 'Matrix addition is done element-by-element and requires same shape. Looping through row and column indices makes the operation explicit and easy to verify.',
    codeExample: "A = [[1, 2], [3, 4]]\nB = [[5, 6], [7, 8]]\nC = []\nfor i in range(len(A)):\n    row = []\n    for j in range(len(A[0])):\n        row.append(A[i][j] + B[i][j])\n    C.append(row)\nprint(C)",
    challengeTask: 'Add two 3x3 matrices and print the resulting matrix row by row.',
    resources: commonResources
  },
  26: {
    explanation: 'Limits describe what values approach, not always what they equal. Numerically, you can evaluate a function at points closer to a target and observe the trend.',
    codeExample: "def f(x):\n    return (x**2 - 1) / (x - 1)\n\nfor h in [1, 0.1, 0.01, 0.001]:\n    x = 1 + h\n    print(h, f(x))",
    challengeTask: 'Approximate the limit of (x^2-4)/(x-2) as x approaches 2 using shrinking step sizes.',
    resources: commonResources
  },
  27: {
    explanation: 'Rate of change is slope: how fast y changes relative to x. Between two points, slope is straightforward and forms the basis for derivative intuition.',
    codeExample: "x1, y1 = 2, 5\nx2, y2 = 7, 20\nslope = (y2 - y1) / (x2 - x1)\nprint('slope:', slope)",
    challengeTask: 'Given three points, compute slopes between consecutive pairs and compare them.',
    resources: commonResources
  },
  28: {
    explanation: 'Numerical derivatives approximate instantaneous rate of change. The finite difference formula gives better estimates as h becomes smaller, within floating-point limits.',
    codeExample: "def f(x):\n    return x**3\n\nx = 2\nh = 1e-4\nderivative = (f(x + h) - f(x)) / h\nprint('approx derivative at x=2:', derivative)",
    challengeTask: 'Approximate the derivative of f(x)=x^2+3x at x=4 with h = 0.1, 0.01, and 0.001.',
    resources: commonResources
  },
  29: {
    explanation: 'Numerical integration estimates area under a curve by summing rectangles. Riemann sums are simple to code and provide intuition before learning exact integrals.',
    codeExample: "def f(x):\n    return x**2\n\na, b, n = 0, 3, 1000\ndx = (b - a) / n\narea = 0\nfor i in range(n):\n    x = a + i * dx\n    area += f(x) * dx\nprint('approx area:', area)",
    challengeTask: 'Approximate the integral of f(x)=2x+1 on [0,5] using a left Riemann sum.',
    resources: commonResources
  },
  30: {
    explanation: 'The capstone combines multiple topics into one practical tool. You can build a mini math solver that offers menu options, parses user input, and applies reusable functions.',
    codeExample: "def solve_linear(a, b):\n    # Solve ax + b = 0\n    return -b / a\n\nprint('x for 2x + 6 = 0:', solve_linear(2, 6))",
    challengeTask: 'Build a mini command-line math helper with at least 3 operations (e.g., slope, mean, and quadratic evaluation).',
    resources: commonResources
  }
};

export function getFallbackLesson(day: number, title: string, topic: string): FallbackLessonData {
  const lesson = fallbackLessonsByDay[day];
  if (lesson) {
    return lesson;
  }

  return {
    explanation: `Offline lesson mode for Day ${day}: ${topic}`,
    codeExample: `print('Day ${day}: ${title}')`,
    challengeTask: `Write Python code to practice: ${topic}`,
    resources: commonResources
  };
}
