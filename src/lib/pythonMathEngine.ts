/**
 * Deterministic, zero-dependency in-browser Python Math interpreter & expression evaluator.
 * Supports arithmetic, Fraction, complex numbers, math/statistics/random modules,
 * functions (def), loops (for/while), conditionals, lists, slicing, comprehensions,
 * tuple unpacking, f-strings, and safe infinite-loop protection.
 */

export class PyFraction {
  readonly numerator: number;
  readonly denominator: number;

  constructor(num: number, den = 1) {
    if (den === 0) throw new Error('ZeroDivisionError: Fraction(n, 0)');
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      const scale = 1e6;
      num = Math.round(num * scale);
      den = Math.round(den * scale);
    }
    const sign = den < 0 ? -1 : 1;
    const a = Math.abs(num);
    const b = Math.abs(den);
    const g = gcdInt(a, b);
    this.numerator = sign * (a / g);
    this.denominator = b / g;
  }

  toNumber(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    return this.denominator === 1 ? `${this.numerator}` : `${this.numerator}/${this.denominator}`;
  }
}

export class PyComplex {
  readonly real: number;
  readonly imag: number;

  constructor(real: number, imag: number) {
    this.real = real;
    this.imag = imag;
  }

  abs(): number {
    return Math.hypot(this.real, this.imag);
  }

  toString(): string {
    const r = formatNum(this.real);
    const sign = this.imag >= 0 ? '+' : '-';
    const i = formatNum(Math.abs(this.imag));
    if (this.real === 0) return `${this.imag < 0 ? '-' : ''}${i}j`;
    return `(${r}${sign}${i}j)`;
  }
}

export class PyType {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  toString(): string {
    return `<class '${this.name}'>`;
  }
}

export interface PyCallable {
  __callable: true;
  name: string;
  call: (args: PyValue[], kwargs?: Record<string, PyValue>) => PyValue;
}

export type PyValue =
  | number
  | string
  | boolean
  | null
  | PyFraction
  | PyComplex
  | PyType
  | PyCallable
  | PyValue[]
  | { [key: string]: PyValue };

function gcdInt(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function factorialInt(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error('ValueError: factorial() not defined for negative values');
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function formatNum(n: number): string {
  if (Object.is(n, -0)) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toPrecision(12)));
}

export function formatPyValue(val: PyValue, inContainer = false): string {
  if (val === null || val === undefined) return 'None';
  if (typeof val === 'boolean') return val ? 'True' : 'False';
  if (typeof val === 'number') return formatNum(val);
  if (typeof val === 'string') return inContainer ? `'${val}'` : val;
  if (val instanceof PyFraction) return val.toString();
  if (val instanceof PyComplex) return val.toString();
  if (val instanceof PyType) return val.toString();
  if (Array.isArray(val)) {
    return `[${val.map(v => formatPyValue(v, true)).join(', ')}]`;
  }
  if (typeof val === 'object' && '__callable' in val) {
    return `<function ${val.name}>`;
  }
  return JSON.stringify(val);
}

function getPyTypeName(val: PyValue): string {
  if (val === null) return 'NoneType';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
  if (typeof val === 'string') return 'str';
  if (val instanceof PyFraction) return 'fractions.Fraction';
  if (val instanceof PyComplex) return 'complex';
  if (Array.isArray(val)) return 'list';
  if (typeof val === 'object' && '__callable' in val) return 'function';
  return 'object';
}

function toNumeric(val: PyValue): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (val instanceof PyFraction) return val.toNumber();
  throw new Error(`TypeError: expected a numeric value, got ${getPyTypeName(val)}`);
}

function isTruthy(val: PyValue): boolean {
  if (val === null || val === false) return false;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val.length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (val instanceof PyFraction) return val.numerator !== 0;
  if (val instanceof PyComplex) return val.real !== 0 || val.imag !== 0;
  return true;
}

// ---------- Tokenizer ----------

type TokenType = 'NUMBER' | 'IMAG' | 'STRING' | 'FSTRING' | 'IDENT' | 'OP' | 'PUNC' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

const TWO_CHAR_OPS = new Set(['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=']);
const ONE_CHAR_OPS = new Set(['+', '-', '*', '/', '%', '<', '>', '=']);
const PUNCS = new Set(['(', ')', '[', ']', '{', '}', ',', ':', '.']);

function tokenizeExpr(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i++;
      continue;
    }
    if (ch === '#') break;

    // f-string
    if ((ch === 'f' || ch === 'F') && (src[i + 1] === '"' || src[i + 1] === "'")) {
      const quote = src[i + 1];
      i += 2;
      let str = '';
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < src.length) {
          const next = src[i + 1];
          str += next === 'n' ? '\n' : next === 't' ? '\t' : next;
          i += 2;
        } else {
          str += src[i++];
        }
      }
      if (src[i] !== quote) throw new Error('SyntaxError: unterminated f-string');
      i++;
      tokens.push({ type: 'FSTRING', value: str });
      continue;
    }

    // String
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let str = '';
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < src.length) {
          const next = src[i + 1];
          str += next === 'n' ? '\n' : next === 't' ? '\t' : next;
          i += 2;
        } else {
          str += src[i++];
        }
      }
      if (src[i] !== quote) throw new Error('SyntaxError: unterminated string literal');
      i++;
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Number (int, float, scientific notation, imaginary j)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let num = '';
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      if (i < src.length && (src[i] === 'e' || src[i] === 'E')) {
        num += src[i++];
        if (i < src.length && (src[i] === '+' || src[i] === '-')) num += src[i++];
        while (i < src.length && /[0-9]/.test(src[i])) num += src[i++];
      }
      if (i < src.length && (src[i] === 'j' || src[i] === 'J')) {
        i++;
        tokens.push({ type: 'IMAG', value: num });
      } else {
        tokens.push({ type: 'NUMBER', value: num });
      }
      continue;
    }

    // Identifier / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) id += src[i++];
      tokens.push({ type: 'IDENT', value: id });
      continue;
    }

    // Two-char operator
    const two = src.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) {
      tokens.push({ type: 'OP', value: two });
      i += 2;
      continue;
    }

    if (ONE_CHAR_OPS.has(ch)) {
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    if (PUNCS.has(ch)) {
      tokens.push({ type: 'PUNC', value: ch });
      i++;
      continue;
    }

    throw new Error(`SyntaxError: unexpected character '${ch}'`);
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

// ---------- Arithmetic with Fraction & Complex ----------

function applyBinaryOp(op: string, left: PyValue, right: PyValue): PyValue {
  if (op === '+') {
    if (typeof left === 'string' && typeof right === 'string') return left + right;
    if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
    if (left instanceof PyComplex || right instanceof PyComplex) {
      const a = left instanceof PyComplex ? left : new PyComplex(toNumeric(left), 0);
      const b = right instanceof PyComplex ? right : new PyComplex(toNumeric(right), 0);
      return new PyComplex(a.real + b.real, a.imag + b.imag);
    }
    if (left instanceof PyFraction || right instanceof PyFraction) {
      const a = left instanceof PyFraction ? left : new PyFraction(toNumeric(left), 1);
      const b = right instanceof PyFraction ? right : new PyFraction(toNumeric(right), 1);
      return new PyFraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
    }
    return toNumeric(left) + toNumeric(right);
  }

  if (op === '-') {
    if (left instanceof PyComplex || right instanceof PyComplex) {
      const a = left instanceof PyComplex ? left : new PyComplex(toNumeric(left), 0);
      const b = right instanceof PyComplex ? right : new PyComplex(toNumeric(right), 0);
      return new PyComplex(a.real - b.real, a.imag - b.imag);
    }
    if (left instanceof PyFraction || right instanceof PyFraction) {
      const a = left instanceof PyFraction ? left : new PyFraction(toNumeric(left), 1);
      const b = right instanceof PyFraction ? right : new PyFraction(toNumeric(right), 1);
      return new PyFraction(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
    }
    return toNumeric(left) - toNumeric(right);
  }

  if (op === '*') {
    if (typeof left === 'string' && typeof right === 'number') return left.repeat(Math.max(0, Math.trunc(right)));
    if (typeof right === 'string' && typeof left === 'number') return right.repeat(Math.max(0, Math.trunc(left)));
    if (Array.isArray(left) && typeof right === 'number') {
      const out: PyValue[] = [];
      for (let k = 0; k < Math.trunc(right); k++) out.push(...left);
      return out;
    }
    if (left instanceof PyComplex || right instanceof PyComplex) {
      const a = left instanceof PyComplex ? left : new PyComplex(toNumeric(left), 0);
      const b = right instanceof PyComplex ? right : new PyComplex(toNumeric(right), 0);
      return new PyComplex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
    }
    if (left instanceof PyFraction || right instanceof PyFraction) {
      const a = left instanceof PyFraction ? left : new PyFraction(toNumeric(left), 1);
      const b = right instanceof PyFraction ? right : new PyFraction(toNumeric(right), 1);
      return new PyFraction(a.numerator * b.numerator, a.denominator * b.denominator);
    }
    return toNumeric(left) * toNumeric(right);
  }

  if (op === '/') {
    if (left instanceof PyComplex || right instanceof PyComplex) {
      const a = left instanceof PyComplex ? left : new PyComplex(toNumeric(left), 0);
      const b = right instanceof PyComplex ? right : new PyComplex(toNumeric(right), 0);
      const denom = b.real * b.real + b.imag * b.imag;
      if (denom === 0) throw new Error('ZeroDivisionError: complex division by zero');
      return new PyComplex((a.real * b.real + a.imag * b.imag) / denom, (a.imag * b.real - a.real * b.imag) / denom);
    }
    if (left instanceof PyFraction || right instanceof PyFraction) {
      const a = left instanceof PyFraction ? left : new PyFraction(toNumeric(left), 1);
      const b = right instanceof PyFraction ? right : new PyFraction(toNumeric(right), 1);
      if (b.numerator === 0) throw new Error('ZeroDivisionError: division by zero');
      return new PyFraction(a.numerator * b.denominator, a.denominator * b.numerator);
    }
    const r = toNumeric(right);
    if (r === 0) throw new Error('ZeroDivisionError: division by zero');
    return toNumeric(left) / r;
  }

  if (op === '//') {
    const r = toNumeric(right);
    if (r === 0) throw new Error('ZeroDivisionError: integer division or modulo by zero');
    return Math.floor(toNumeric(left) / r);
  }

  if (op === '%') {
    const a = toNumeric(left);
    const b = toNumeric(right);
    if (b === 0) throw new Error('ZeroDivisionError: integer division or modulo by zero');
    return ((a % b) + b) % b;
  }

  if (op === '**') {
    if (left instanceof PyFraction && typeof right === 'number' && Number.isInteger(right)) {
      if (right >= 0) return new PyFraction(left.numerator ** right, left.denominator ** right);
      return new PyFraction(left.denominator ** -right, left.numerator ** -right);
    }
    return toNumeric(left) ** toNumeric(right);
  }

  throw new Error(`Unsupported binary operator: ${op}`);
}

function compareValues(op: string, left: PyValue, right: PyValue): boolean {
  if (op === 'in') {
    if (Array.isArray(left) === false && Array.isArray(right)) {
      return right.some(item => compareValues('==', left, item));
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return right.includes(left);
    }
    return false;
  }
  if (op === '==') {
    if (left instanceof PyFraction || right instanceof PyFraction) {
      return toNumeric(left) === toNumeric(right);
    }
    if (Array.isArray(left) && Array.isArray(right)) {
      return left.length === right.length && left.every((v, i) => compareValues('==', v, right[i]));
    }
    return left === right;
  }
  if (op === '!=') return !compareValues('==', left, right);
  const a = toNumeric(left);
  const b = toNumeric(right);
  if (op === '<') return a < b;
  if (op === '<=') return a <= b;
  if (op === '>') return a > b;
  if (op === '>=') return a >= b;
  return false;
}

// ---------- Expression Evaluator ----------

type Scope = Record<string, PyValue>;

class ExprParser {
  private tokens: Token[];
  private pos = 0;
  private env: Scope;
  private stepGuard: { count: number };

  constructor(tokens: Token[], env: Scope, stepGuard: { count: number }) {
    this.tokens = tokens;
    this.env = env;
    this.stepGuard = stepGuard;
  }

  peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? { type: 'EOF', value: '' };
  }

  next(): Token {
    return this.tokens[this.pos++] ?? { type: 'EOF', value: '' };
  }

  expect(type: TokenType, value?: string): Token {
    const t = this.next();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`SyntaxError: expected ${value ?? type}, got '${t.value || t.type}'`);
    }
    return t;
  }

  parseExpression(): PyValue {
    const val = this.parseOr();
    // Ternary: a if cond else b
    if (this.peek().type === 'IDENT' && this.peek().value === 'if') {
      this.next();
      const cond = this.parseOr();
      this.expect('IDENT', 'else');
      const elseExprStart = this.pos;
      const elseVal = this.parseExpression();
      void elseExprStart;
      return isTruthy(cond) ? val : elseVal;
    }
    return val;
  }

  private parseOr(): PyValue {
    let left = this.parseAnd();
    while (this.peek().type === 'IDENT' && this.peek().value === 'or') {
      this.next();
      const right = this.parseAnd();
      left = isTruthy(left) ? left : right;
    }
    return left;
  }

  private parseAnd(): PyValue {
    let left = this.parseNot();
    while (this.peek().type === 'IDENT' && this.peek().value === 'and') {
      this.next();
      const right = this.parseNot();
      left = isTruthy(left) ? right : left;
    }
    return left;
  }

  private parseNot(): PyValue {
    if (this.peek().type === 'IDENT' && this.peek().value === 'not') {
      this.next();
      return !isTruthy(this.parseNot());
    }
    return this.parseCompare();
  }

  private parseCompare(): PyValue {
    let left = this.parseAddSub();
    while (true) {
      const t = this.peek();
      if (t.type === 'OP' && ['==', '!=', '<', '<=', '>', '>='].includes(t.value)) {
        this.next();
        const right = this.parseAddSub();
        left = compareValues(t.value, left, right);
      } else if (t.type === 'IDENT' && t.value === 'in') {
        this.next();
        const right = this.parseAddSub();
        left = compareValues('in', left, right);
      } else if (t.type === 'IDENT' && t.value === 'not' && this.peek(1).value === 'in') {
        this.next();
        this.next();
        const right = this.parseAddSub();
        left = !compareValues('in', left, right);
      } else {
        break;
      }
    }
    return left;
  }

  private parseAddSub(): PyValue {
    let left = this.parseMulDiv();
    while (this.peek().type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.next().value;
      const right = this.parseMulDiv();
      left = applyBinaryOp(op, left, right);
    }
    return left;
  }

  private parseMulDiv(): PyValue {
    let left = this.parseUnary();
    while (this.peek().type === 'OP' && ['*', '/', '//', '%'].includes(this.peek().value)) {
      const op = this.next().value;
      const right = this.parseUnary();
      left = applyBinaryOp(op, left, right);
    }
    return left;
  }

  private parseUnary(): PyValue {
    const t = this.peek();
    if (t.type === 'OP' && (t.value === '+' || t.value === '-')) {
      this.next();
      const val = this.parseUnary();
      if (t.value === '-') {
        if (val instanceof PyFraction) return new PyFraction(-val.numerator, val.denominator);
        if (val instanceof PyComplex) return new PyComplex(-val.real, -val.imag);
        return -toNumeric(val);
      }
      return val;
    }
    return this.parsePower();
  }

  private parsePower(): PyValue {
    const base = this.parsePostfix();
    if (this.peek().type === 'OP' && this.peek().value === '**') {
      this.next();
      const exp = this.parseUnary(); // right-associative, unary binds tighter on RHS in Python: -2**2 == -4, 2**-2 == 0.25
      return applyBinaryOp('**', base, exp);
    }
    return base;
  }

  private parsePostfix(): PyValue {
    let target = this.parsePrimary();

    while (true) {
      const t = this.peek();
      if (t.type === 'PUNC' && t.value === '.') {
        this.next();
        const attr = this.expect('IDENT').value;
        target = this.getAttribute(target, attr);
      } else if (t.type === 'PUNC' && t.value === '(') {
        this.next();
        const args = this.parseCallArgs();
        if (typeof target === 'object' && target !== null && '__callable' in target && typeof target.call === 'function') {
          target = (target as PyCallable).call(args.positional, args.kwargs);
        } else {
          throw new Error(`TypeError: '${getPyTypeName(target)}' object is not callable`);
        }
      } else if (t.type === 'PUNC' && t.value === '[') {
        this.next();
        target = this.parseSubscript(target);
      } else {
        break;
      }
    }

    return target;
  }

  private getAttribute(target: PyValue, attr: string): PyValue {
    if (target instanceof PyFraction) {
      if (attr === 'numerator') return target.numerator;
      if (attr === 'denominator') return target.denominator;
    }
    if (target instanceof PyComplex) {
      if (attr === 'real') return target.real;
      if (attr === 'imag') return target.imag;
    }
    if (Array.isArray(target)) {
      if (attr === 'append') {
        return {
          __callable: true,
          name: 'list.append',
          call: (args) => {
            target.push(args[0]);
            return null;
          }
        };
      }
      if (attr === 'extend') {
        return {
          __callable: true,
          name: 'list.extend',
          call: (args) => {
            if (Array.isArray(args[0])) target.push(...args[0]);
            return null;
          }
        };
      }
      if (attr === 'pop') {
        return {
          __callable: true,
          name: 'list.pop',
          call: () => target.pop() ?? null
        };
      }
      if (attr === 'sort') {
        return {
          __callable: true,
          name: 'list.sort',
          call: () => {
            target.sort((a, b) => toNumeric(a) - toNumeric(b));
            return null;
          }
        };
      }
      if (attr === 'copy') {
        return {
          __callable: true,
          name: 'list.copy',
          call: () => [...target]
        };
      }
    }
    if (typeof target === 'string') {
      if (attr === 'upper') return { __callable: true, name: 'str.upper', call: () => target.toUpperCase() };
      if (attr === 'lower') return { __callable: true, name: 'str.lower', call: () => target.toLowerCase() };
      if (attr === 'strip') return { __callable: true, name: 'str.strip', call: () => target.trim() };
      if (attr === 'split') {
        return {
          __callable: true,
          name: 'str.split',
          call: (args) => target.split(args[0] ? String(args[0]) : /\s+/).filter(Boolean)
        };
      }
      if (attr === 'join') {
        return {
          __callable: true,
          name: 'str.join',
          call: (args) => (Array.isArray(args[0]) ? args[0].map(v => formatPyValue(v)).join(target) : '')
        };
      }
    }
    if (target && typeof target === 'object' && !Array.isArray(target) && attr in target) {
      return (target as Record<string, PyValue>)[attr];
    }
    throw new Error(`AttributeError: '${getPyTypeName(target)}' object has no attribute '${attr}'`);
  }

  private parseSubscript(target: PyValue): PyValue {
    let start: PyValue | undefined;
    let end: PyValue | undefined;
    let step: PyValue | undefined;
    let isSlice = false;

    if (this.peek().type === 'PUNC' && this.peek().value === ':') {
      isSlice = true;
    } else {
      start = this.parseExpression();
    }

    if (this.peek().type === 'PUNC' && this.peek().value === ':') {
      isSlice = true;
      this.next();
      if (!(this.peek().type === 'PUNC' && (this.peek().value === ']' || this.peek().value === ':'))) {
        end = this.parseExpression();
      }
      if (this.peek().type === 'PUNC' && this.peek().value === ':') {
        this.next();
        if (!(this.peek().type === 'PUNC' && this.peek().value === ']')) {
          step = this.parseExpression();
        }
      }
    }
    this.expect('PUNC', ']');

    if (Array.isArray(target) || typeof target === 'string') {
      const len = target.length;
      if (!isSlice) {
        let idx = Math.trunc(toNumeric(start!));
        if (idx < 0) idx += len;
        if (idx < 0 || idx >= len) throw new Error('IndexError: sequence index out of range');
        return target[idx];
      }
      const st = step !== undefined ? Math.trunc(toNumeric(step)) : 1;
      if (st === 0) throw new Error('ValueError: slice step cannot be zero');
      let s = start !== undefined ? Math.trunc(toNumeric(start)) : st > 0 ? 0 : len - 1;
      let e = end !== undefined ? Math.trunc(toNumeric(end)) : st > 0 ? len : -len - 1;
      if (s < 0) s = Math.max(st > 0 ? 0 : -1, s + len);
      if (end !== undefined && e < 0) e = Math.max(-1, e + len);
      const out: PyValue[] = [];
      if (st > 0) {
        for (let idx = s; idx < Math.min(len, e); idx += st) out.push(target[idx]);
      } else {
        for (let idx = Math.min(len - 1, s); idx > Math.max(-1, e); idx += st) out.push(target[idx]);
      }
      return typeof target === 'string' ? out.join('') : out;
    }

    if (target && typeof target === 'object' && !Array.isArray(target)) {
      const key = String(start);
      if (key in target) return (target as Record<string, PyValue>)[key];
      throw new Error(`KeyError: ${key}`);
    }

    throw new Error(`TypeError: '${getPyTypeName(target)}' object is not subscriptable`);
  }

  private parseCallArgs(): { positional: PyValue[]; kwargs: Record<string, PyValue> } {
    const positional: PyValue[] = [];
    const kwargs: Record<string, PyValue> = {};

    if (this.peek().type === 'PUNC' && this.peek().value === ')') {
      this.next();
      return { positional, kwargs };
    }

    // Check generator expression like sum(x * y for x, y in zip(a, b))
    const genResult = this.tryParseComprehension(')');
    if (genResult !== null) {
      this.expect('PUNC', ')');
      return { positional: [genResult], kwargs };
    }

    while (true) {
      if (this.peek().type === 'IDENT' && this.peek(1).type === 'OP' && this.peek(1).value === '=') {
        const key = this.next().value;
        this.next(); // '='
        kwargs[key] = this.parseExpression();
      } else {
        positional.push(this.parseExpression());
      }
      if (this.peek().type === 'PUNC' && this.peek().value === ',') {
        this.next();
        if (this.peek().type === 'PUNC' && this.peek().value === ')') break;
      } else {
        break;
      }
    }
    this.expect('PUNC', ')');
    return { positional, kwargs };
  }

  private tryParseComprehension(closingChar: ']' | ')'): PyValue[] | null {
    // Scan ahead at depth 0 for 'for' before closingChar or ','
    let depth = 0;
    let forIdx = -1;
    let endIdx = -1;

    for (let i = this.pos; i < this.tokens.length; i++) {
      const tok = this.tokens[i];
      if (tok.type === 'EOF') break;
      if (tok.type === 'PUNC' && ['(', '[', '{'].includes(tok.value)) depth++;
      else if (tok.type === 'PUNC' && [')', ']', '}'].includes(tok.value)) {
        if (depth === 0 && tok.value === closingChar) {
          endIdx = i;
          break;
        }
        depth--;
      } else if (depth === 0 && tok.type === 'IDENT' && tok.value === 'for' && forIdx === -1) {
        forIdx = i;
      } else if (depth === 0 && tok.type === 'PUNC' && tok.value === ',' && forIdx === -1) {
        return null; // normal comma-separated list/args
      }
    }

    if (forIdx === -1 || endIdx === -1) return null;

    const exprTokens = this.tokens.slice(this.pos, forIdx);
    exprTokens.push({ type: 'EOF', value: '' });

    // Parse: for <vars> in <iter> [if <cond>]
    let cursor = forIdx + 1;
    const varNames: string[] = [];
    while (cursor < endIdx) {
      const tok = this.tokens[cursor];
      if (tok.type === 'IDENT' && tok.value === 'in') break;
      if (tok.type === 'IDENT') varNames.push(tok.value);
      cursor++;
    }
    if (this.tokens[cursor]?.value !== 'in') return null;
    cursor++;

    // Find optional trailing `if` at depth 0 inside comprehension
    let ifIdx = -1;
    let innerDepth = 0;
    for (let i = cursor; i < endIdx; i++) {
      const tok = this.tokens[i];
      if (tok.type === 'PUNC' && ['(', '[', '{'].includes(tok.value)) innerDepth++;
      else if (tok.type === 'PUNC' && [')', ']', '}'].includes(tok.value)) innerDepth--;
      else if (innerDepth === 0 && tok.type === 'IDENT' && tok.value === 'if') {
        ifIdx = i;
        break;
      }
    }

    const iterTokens = this.tokens.slice(cursor, ifIdx === -1 ? endIdx : ifIdx);
    iterTokens.push({ type: 'EOF', value: '' });
    const condTokens = ifIdx === -1 ? null : [...this.tokens.slice(ifIdx + 1, endIdx), { type: 'EOF' as const, value: '' }];

    const iterVal = new ExprParser(iterTokens, this.env, this.stepGuard).parseExpression();
    if (!Array.isArray(iterVal)) {
      throw new Error(`TypeError: '${getPyTypeName(iterVal)}' object is not iterable`);
    }

    const results: PyValue[] = [];
    for (const item of iterVal) {
      if (++this.stepGuard.count > 100000) throw new Error('RuntimeError: execution limit exceeded');
      const localEnv: Scope = { ...this.env };
      if (varNames.length === 1) {
        localEnv[varNames[0]] = item;
      } else if (Array.isArray(item)) {
        varNames.forEach((vn, idx) => {
          localEnv[vn] = item[idx] ?? null;
        });
      }
      if (condTokens) {
        const pass = new ExprParser(condTokens, localEnv, this.stepGuard).parseExpression();
        if (!isTruthy(pass)) continue;
      }
      const val = new ExprParser(exprTokens, localEnv, this.stepGuard).parseExpression();
      results.push(val);
    }

    this.pos = endIdx;
    return results;
  }

  private parsePrimary(): PyValue {
    const t = this.peek();

    if (t.type === 'NUMBER') {
      this.next();
      return Number(t.value);
    }

    if (t.type === 'IMAG') {
      this.next();
      return new PyComplex(0, Number(t.value));
    }

    if (t.type === 'STRING') {
      this.next();
      return t.value;
    }

    if (t.type === 'FSTRING') {
      this.next();
      return this.evalFString(t.value);
    }

    if (t.type === 'IDENT') {
      this.next();
      if (t.value === 'True') return true;
      if (t.value === 'False') return false;
      if (t.value === 'None') return null;
      if (t.value in this.env) return this.env[t.value];
      throw new Error(`NameError: name '${t.value}' is not defined`);
    }

    if (t.type === 'PUNC' && t.value === '(') {
      this.next();
      if (this.peek().type === 'PUNC' && this.peek().value === ')') {
        this.next();
        return [];
      }
      const first = this.parseExpression();
      if (this.peek().type === 'PUNC' && this.peek().value === ',') {
        const tupleItems: PyValue[] = [first];
        while (this.peek().type === 'PUNC' && this.peek().value === ',') {
          this.next();
          if (this.peek().type === 'PUNC' && this.peek().value === ')') break;
          tupleItems.push(this.parseExpression());
        }
        this.expect('PUNC', ')');
        return tupleItems;
      }
      this.expect('PUNC', ')');
      return first;
    }

    if (t.type === 'PUNC' && t.value === '[') {
      this.next();
      if (this.peek().type === 'PUNC' && this.peek().value === ']') {
        this.next();
        return [];
      }
      const comp = this.tryParseComprehension(']');
      if (comp !== null) {
        this.expect('PUNC', ']');
        return comp;
      }
      const items: PyValue[] = [];
      while (true) {
        items.push(this.parseExpression());
        if (this.peek().type === 'PUNC' && this.peek().value === ',') {
          this.next();
          if (this.peek().type === 'PUNC' && this.peek().value === ']') break;
        } else {
          break;
        }
      }
      this.expect('PUNC', ']');
      return items;
    }

    if (t.type === 'PUNC' && t.value === '{') {
      this.next();
      const obj: Record<string, PyValue> = {};
      if (this.peek().type === 'PUNC' && this.peek().value === '}') {
        this.next();
        return obj;
      }
      while (true) {
        const k = this.parseExpression();
        this.expect('PUNC', ':');
        const v = this.parseExpression();
        obj[String(k)] = v;
        if (this.peek().type === 'PUNC' && this.peek().value === ',') {
          this.next();
          if (this.peek().type === 'PUNC' && this.peek().value === '}') break;
        } else {
          break;
        }
      }
      this.expect('PUNC', '}');
      return obj;
    }

    throw new Error(`SyntaxError: unexpected token '${t.value || t.type}'`);
  }

  private evalFString(template: string): string {
    let out = '';
    let i = 0;
    while (i < template.length) {
      if (template[i] === '{' && template[i + 1] === '{') {
        out += '{';
        i += 2;
      } else if (template[i] === '}' && template[i + 1] === '}') {
        out += '}';
        i += 2;
      } else if (template[i] === '{') {
        let depth = 1;
        let j = i + 1;
        while (j < template.length && depth > 0) {
          if (template[j] === '{') depth++;
          else if (template[j] === '}') depth--;
          j++;
        }
        const inner = template.slice(i + 1, j - 1);
        const colonIdx = findTopLevelColon(inner);
        const exprPart = colonIdx === -1 ? inner : inner.slice(0, colonIdx);
        const fmtSpec = colonIdx === -1 ? '' : inner.slice(colonIdx + 1).trim();
        const val = evalExpression(exprPart, this.env, this.stepGuard);
        if (fmtSpec) {
          const match = fmtSpec.match(/^\.(\d+)f$/);
          if (match) {
            out += toNumeric(val).toFixed(Number(match[1]));
          } else {
            out += formatPyValue(val);
          }
        } else {
          out += formatPyValue(val);
        }
        i = j;
      } else {
        out += template[i++];
      }
    }
    return out;
  }
}

function findTopLevelColon(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

function evalExpression(expr: string, env: Scope, stepGuard: { count: number }): PyValue {
  const tokens = tokenizeExpr(expr);
  const parser = new ExprParser(tokens, env, stepGuard);
  const first = parser.parseExpression();
  // Support bare comma-separated tuples on RHS like: return a, b or x1, y1 = 2, 5
  if (parser.peek().type === 'PUNC' && parser.peek().value === ',') {
    const items: PyValue[] = [first];
    while (parser.peek().type === 'PUNC' && parser.peek().value === ',') {
      parser.next();
      if (parser.peek().type === 'EOF') break;
      items.push(parser.parseExpression());
    }
    return items;
  }
  return first;
}

// ---------- Standard Library Modules ----------

function createSeededRandom(seed = 42) {
  let state = seed >>> 0;
  const nextFloat = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    seed: {
      __callable: true as const,
      name: 'random.seed',
      call: (args: PyValue[]) => {
        state = Math.trunc(toNumeric(args[0] ?? 42)) >>> 0;
        return null;
      }
    },
    random: {
      __callable: true as const,
      name: 'random.random',
      call: () => nextFloat()
    },
    randint: {
      __callable: true as const,
      name: 'random.randint',
      call: (args: PyValue[]) => {
        const a = Math.trunc(toNumeric(args[0]));
        const b = Math.trunc(toNumeric(args[1]));
        return a + Math.floor(nextFloat() * (b - a + 1));
      }
    },
    uniform: {
      __callable: true as const,
      name: 'random.uniform',
      call: (args: PyValue[]) => {
        const a = toNumeric(args[0]);
        const b = toNumeric(args[1]);
        return a + nextFloat() * (b - a);
      }
    },
    choice: {
      __callable: true as const,
      name: 'random.choice',
      call: (args: PyValue[]) => {
        const seq = args[0];
        if (!Array.isArray(seq) || seq.length === 0) throw new Error('IndexError: Cannot choose from an empty sequence');
        return seq[Math.floor(nextFloat() * seq.length)];
      }
    }
  };
}

function createMathModule(): Record<string, PyValue> {
  const fn = (name: string, f: (...nums: number[]) => number): PyCallable => ({
    __callable: true,
    name: `math.${name}`,
    call: (args) => f(...args.map(toNumeric))
  });

  return {
    pi: Math.PI,
    e: Math.E,
    tau: Math.PI * 2,
    inf: Infinity,
    sqrt: fn('sqrt', (x) => {
      if (x < 0) throw new Error('ValueError: math domain error');
      return Math.sqrt(x);
    }),
    pow: fn('pow', (x, y) => Math.pow(x, y)),
    sin: fn('sin', (x) => Math.sin(x)),
    cos: fn('cos', (x) => Math.cos(x)),
    tan: fn('tan', (x) => Math.tan(x)),
    asin: fn('asin', (x) => Math.asin(x)),
    acos: fn('acos', (x) => Math.acos(x)),
    atan: fn('atan', (x) => Math.atan(x)),
    atan2: fn('atan2', (y, x) => Math.atan2(y, x)),
    radians: fn('radians', (d) => (d * Math.PI) / 180),
    degrees: fn('degrees', (r) => (r * 180) / Math.PI),
    log: fn('log', (x, base) => (base !== undefined ? Math.log(x) / Math.log(base) : Math.log(x))),
    log10: fn('log10', (x) => Math.log10(x)),
    log2: fn('log2', (x) => Math.log2(x)),
    exp: fn('exp', (x) => Math.exp(x)),
    floor: fn('floor', (x) => Math.floor(x)),
    ceil: fn('ceil', (x) => Math.ceil(x)),
    fabs: fn('fabs', (x) => Math.abs(x)),
    hypot: fn('hypot', (...nums) => Math.hypot(...nums)),
    factorial: fn('factorial', (n) => factorialInt(n)),
    gcd: fn('gcd', (a, b) => gcdInt(a, b)),
    lcm: fn('lcm', (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(Math.trunc(a) * Math.trunc(b)) / gcdInt(a, b))),
    perm: fn('perm', (n, k) => {
      const ni = Math.trunc(n);
      const ki = k === undefined ? ni : Math.trunc(k);
      if (ki > ni || ki < 0 || ni < 0) return 0;
      let res = 1;
      for (let i = 0; i < ki; i++) res *= ni - i;
      return res;
    }),
    comb: fn('comb', (n, k) => {
      const ni = Math.trunc(n);
      const ki = Math.trunc(k);
      if (ki > ni || ki < 0 || ni < 0) return 0;
      const r = Math.min(ki, ni - ki);
      let res = 1;
      for (let i = 1; i <= r; i++) res = (res * (ni - r + i)) / i;
      return Math.round(res);
    }),
    isclose: {
      __callable: true,
      name: 'math.isclose',
      call: (args) => Math.abs(toNumeric(args[0]) - toNumeric(args[1])) <= 1e-9
    }
  };
}

function createStatisticsModule(): Record<string, PyValue> {
  const getNums = (args: PyValue[]): number[] => {
    if (!Array.isArray(args[0]) || args[0].length === 0) {
      throw new Error('StatisticsError: requires at least one data point');
    }
    return args[0].map(toNumeric);
  };

  const mean = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

  return {
    mean: { __callable: true, name: 'statistics.mean', call: (args) => mean(getNums(args)) },
    median: {
      __callable: true,
      name: 'statistics.median',
      call: (args) => {
        const sorted = [...getNums(args)].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
    },
    mode: {
      __callable: true,
      name: 'statistics.mode',
      call: (args) => {
        const arr = args[0];
        if (!Array.isArray(arr) || arr.length === 0) throw new Error('StatisticsError: no mode for empty data');
        const counts = new Map<string, { val: PyValue; count: number }>();
        for (const v of arr) {
          const k = formatPyValue(v);
          const prev = counts.get(k);
          counts.set(k, { val: v, count: (prev?.count ?? 0) + 1 });
        }
        let best = { val: arr[0], count: -1 };
        for (const entry of counts.values()) {
          if (entry.count > best.count) best = entry;
        }
        return best.val;
      }
    },
    pvariance: {
      __callable: true,
      name: 'statistics.pvariance',
      call: (args) => {
        const nums = getNums(args);
        const m = mean(nums);
        return nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / nums.length;
      }
    },
    variance: {
      __callable: true,
      name: 'statistics.variance',
      call: (args) => {
        const nums = getNums(args);
        if (nums.length < 2) throw new Error('StatisticsError: variance requires at least two data points');
        const m = mean(nums);
        return nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / (nums.length - 1);
      }
    },
    pstdev: {
      __callable: true,
      name: 'statistics.pstdev',
      call: (args) => {
        const nums = getNums(args);
        const m = mean(nums);
        return Math.sqrt(nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / nums.length);
      }
    },
    stdev: {
      __callable: true,
      name: 'statistics.stdev',
      call: (args) => {
        const nums = getNums(args);
        if (nums.length < 2) throw new Error('StatisticsError: stdev requires at least two data points');
        const m = mean(nums);
        return Math.sqrt(nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / (nums.length - 1));
      }
    }
  };
}

// ---------- Block & Statement Execution ----------

interface CodeLine {
  lineNo: number;
  indent: number;
  text: string;
}

class ReturnSignal {
  readonly value: PyValue;
  constructor(value: PyValue) {
    this.value = value;
  }
}

function stripComment(line: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble) return line.slice(0, i);
  }
  return line;
}

function preprocessLines(code: string): CodeLine[] {
  const raw = code.replace(/\r\n/g, '\n').split('\n');
  const out: CodeLine[] = [];
  for (let idx = 0; idx < raw.length; idx++) {
    const expanded = raw[idx].replace(/\t/g, '    ');
    const stripped = stripComment(expanded);
    const trimmed = stripped.trim();
    if (!trimmed) continue;
    const indent = stripped.length - stripped.trimStart().length;
    out.push({ lineNo: idx + 1, indent, text: trimmed });
  }
  return out;
}

function splitTopLevel(str: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inS = false;
  let inD = false;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === "'" && !inD) inS = !inS;
    else if (ch === '"' && !inS) inD = !inD;
    else if (!inS && !inD) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      else if (ch === sep && depth === 0) {
        parts.push(str.slice(start, i).trim());
        start = i + 1;
      }
    }
  }
  parts.push(str.slice(start).trim());
  return parts;
}

function findAssignOp(text: string): { op: string; idx: number } | null {
  let depth = 0;
  let inS = false;
  let inD = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === "'" && !inD) inS = !inS;
    else if (ch === '"' && !inS) inD = !inD;
    else if (!inS && !inD) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      else if (depth === 0) {
        const two = text.slice(i, i + 2);
        if (['+=', '-=', '*=', '/='].includes(two)) return { op: two, idx: i };
        if (two === '==' || two === '!=' || two === '<=' || two === '>=') {
          i++;
          continue;
        }
        if (ch === '=') return { op: '=', idx: i };
      }
    }
  }
  return null;
}

export interface PythonRunResult {
  ok: boolean;
  output: string;
  lines: string[];
  error?: string;
  variables: Record<string, PyValue>;
  durationMs: number;
}

export function runPythonMath(code: string, seed = 42): PythonRunResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const outputLines: string[] = [];
  const stepGuard = { count: 0 };

  const mathMod = createMathModule();
  const statsMod = createStatisticsModule();
  const randMod = createSeededRandom(seed);

  const fractionCtor: PyCallable = {
    __callable: true,
    name: 'Fraction',
    call: (args) => {
      if (args.length === 1 && typeof args[0] === 'string' && args[0].includes('/')) {
        const [n, d] = args[0].split('/').map(Number);
        return new PyFraction(n, d);
      }
      return new PyFraction(toNumeric(args[0] ?? 0), toNumeric(args[1] ?? 1));
    }
  };

  const env: Scope = {
    print: {
      __callable: true,
      name: 'print',
      call: (args, kwargs) => {
        const sep = kwargs?.sep !== undefined ? String(kwargs.sep) : ' ';
        outputLines.push(args.map(a => formatPyValue(a)).join(sep));
        return null;
      }
    },
    type: {
      __callable: true,
      name: 'type',
      call: (args) => new PyType(getPyTypeName(args[0]))
    },
    range: {
      __callable: true,
      name: 'range',
      call: (args) => {
        let start = 0;
        let stop = 0;
        let step = 1;
        if (args.length === 1) {
          stop = Math.trunc(toNumeric(args[0]));
        } else if (args.length === 2) {
          start = Math.trunc(toNumeric(args[0]));
          stop = Math.trunc(toNumeric(args[1]));
        } else {
          start = Math.trunc(toNumeric(args[0]));
          stop = Math.trunc(toNumeric(args[1]));
          step = Math.trunc(toNumeric(args[2]));
        }
        if (step === 0) throw new Error('ValueError: range() arg 3 must not be zero');
        const out: number[] = [];
        if (step > 0) {
          for (let v = start; v < stop; v += step) {
            out.push(v);
            if (out.length > 50000) throw new Error('RuntimeError: range too large');
          }
        } else {
          for (let v = start; v > stop; v += step) {
            out.push(v);
            if (out.length > 50000) throw new Error('RuntimeError: range too large');
          }
        }
        return out;
      }
    },
    len: {
      __callable: true,
      name: 'len',
      call: (args) => {
        const a = args[0];
        if (Array.isArray(a) || typeof a === 'string') return a.length;
        if (a && typeof a === 'object') return Object.keys(a).length;
        throw new Error(`TypeError: object of type '${getPyTypeName(a)}' has no len()`);
      }
    },
    sum: {
      __callable: true,
      name: 'sum',
      call: (args) => {
        const arr = args[0];
        if (!Array.isArray(arr)) throw new Error('TypeError: sum() expects an iterable');
        let acc: PyValue = args[1] ?? 0;
        for (const item of arr) acc = applyBinaryOp('+', acc, item);
        return acc;
      }
    },
    abs: {
      __callable: true,
      name: 'abs',
      call: (args) => {
        const v = args[0];
        if (v instanceof PyComplex) return v.abs();
        if (v instanceof PyFraction) return new PyFraction(Math.abs(v.numerator), v.denominator);
        return Math.abs(toNumeric(v));
      }
    },
    round: {
      __callable: true,
      name: 'round',
      call: (args) => {
        const x = toNumeric(args[0]);
        const d = args[1] !== undefined ? Math.trunc(toNumeric(args[1])) : 0;
        const factor = 10 ** d;
        return Math.round(x * factor) / factor;
      }
    },
    min: {
      __callable: true,
      name: 'min',
      call: (args) => {
        const arr = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return Math.min(...arr.map(toNumeric));
      }
    },
    max: {
      __callable: true,
      name: 'max',
      call: (args) => {
        const arr = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return Math.max(...arr.map(toNumeric));
      }
    },
    sorted: {
      __callable: true,
      name: 'sorted',
      call: (args, kwargs) => {
        const arr = Array.isArray(args[0]) ? [...args[0]] : [];
        arr.sort((a, b) => toNumeric(a) - toNumeric(b));
        if (kwargs?.reverse && isTruthy(kwargs.reverse)) arr.reverse();
        return arr;
      }
    },
    list: {
      __callable: true,
      name: 'list',
      call: (args) => (Array.isArray(args[0]) ? [...args[0]] : [])
    },
    int: {
      __callable: true,
      name: 'int',
      call: (args) => Math.trunc(Number(args[0]))
    },
    float: {
      __callable: true,
      name: 'float',
      call: (args) => Number(args[0])
    },
    str: {
      __callable: true,
      name: 'str',
      call: (args) => formatPyValue(args[0])
    },
    complex: {
      __callable: true,
      name: 'complex',
      call: (args) => new PyComplex(toNumeric(args[0] ?? 0), toNumeric(args[1] ?? 0))
    },
    pow: {
      __callable: true,
      name: 'pow',
      call: (args) => toNumeric(args[0]) ** toNumeric(args[1])
    },
    zip: {
      __callable: true,
      name: 'zip',
      call: (args) => {
        const arrays = args.map(a => (Array.isArray(a) ? a : []));
        if (arrays.length === 0) return [];
        const minLen = Math.min(...arrays.map(a => a.length));
        const res: PyValue[][] = [];
        for (let i = 0; i < minLen; i++) res.push(arrays.map(a => a[i]));
        return res;
      }
    },
    enumerate: {
      __callable: true,
      name: 'enumerate',
      call: (args) => {
        const arr = Array.isArray(args[0]) ? args[0] : [];
        const start = args[1] !== undefined ? Math.trunc(toNumeric(args[1])) : 0;
        return arr.map((v, i) => [start + i, v]);
      }
    }
  };

  function collectBlock(lines: CodeLine[], startIdx: number, parentIndent: number): { block: CodeLine[]; nextIdx: number } {
    const block: CodeLine[] = [];
    let i = startIdx;
    while (i < lines.length && lines[i].indent > parentIndent) {
      block.push(lines[i]);
      i++;
    }
    return { block, nextIdx: i };
  }

  function assignTarget(lhs: string, value: PyValue, scope: Scope) {
    const targets = splitTopLevel(lhs, ',').filter(Boolean);
    if (targets.length > 1) {
      if (!Array.isArray(value) || value.length < targets.length) {
        throw new Error('ValueError: not enough values to unpack');
      }
      targets.forEach((t, idx) => assignTarget(t, value[idx], scope));
      return;
    }
    const target = targets[0];
    // Handle list element assignment like matrix[i][j] = val
    const idxMatch = target.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(.+)\]$/);
    if (idxMatch) {
      const container = scope[idxMatch[1]];
      if (Array.isArray(container)) {
        const idxVal = Math.trunc(toNumeric(evalExpression(idxMatch[2], scope, stepGuard)));
        container[idxVal] = value;
        return;
      }
    }
    scope[target] = value;
  }

  function execBlock(lines: CodeLine[], scope: Scope): void {
    let i = 0;
    while (i < lines.length) {
      if (++stepGuard.count > 100000) throw new Error('RuntimeError: execution limit exceeded (possible infinite loop)');
      const line = lines[i];
      const text = line.text;

      try {
        // Imports
        if (text.startsWith('import ')) {
          const mods = text.slice(7).split(',').map(s => s.trim());
          for (const m of mods) {
            const [modName, alias] = m.split(/\s+as\s+/);
            const bindName = (alias ?? modName).trim();
            if (modName === 'math') scope[bindName] = mathMod;
            else if (modName === 'statistics') scope[bindName] = statsMod;
            else if (modName === 'random') scope[bindName] = randMod;
            else if (modName === 'fractions') scope[bindName] = { Fraction: fractionCtor };
            else throw new Error(`ModuleNotFoundError: No module named '${modName}'`);
          }
          i++;
          continue;
        }

        if (text.startsWith('from ')) {
          const m = text.match(/^from\s+([a-zA-Z0-9_]+)\s+import\s+(.+)$/);
          if (!m) throw new Error(`SyntaxError: invalid import statement '${text}'`);
          const modName = m[1];
          const names = m[2].split(',').map(s => s.trim());
          const modObj =
            modName === 'math'
              ? mathMod
              : modName === 'statistics'
                ? statsMod
                : modName === 'random'
                  ? randMod
                  : modName === 'fractions'
                    ? { Fraction: fractionCtor }
                    : null;
          if (!modObj) throw new Error(`ModuleNotFoundError: No module named '${modName}'`);
          for (const entry of names) {
            const [sym, alias] = entry.split(/\s+as\s+/);
            const key = sym.trim();
            if (!(key in modObj)) throw new Error(`ImportError: cannot import name '${key}' from '${modName}'`);
            scope[(alias ?? key).trim()] = modObj[key];
          }
          i++;
          continue;
        }

        // Function definition
        if (text.startsWith('def ')) {
          const m = text.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:$/);
          if (!m) throw new Error(`SyntaxError: invalid function definition '${text}'`);
          const fnName = m[1];
          const params = m[2]
            .split(',')
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => {
              const eq = p.indexOf('=');
              return eq === -1 ? { name: p, defExpr: null } : { name: p.slice(0, eq).trim(), defExpr: p.slice(eq + 1).trim() };
            });
          const { block, nextIdx } = collectBlock(lines, i + 1, line.indent);
          scope[fnName] = {
            __callable: true,
            name: fnName,
            call: (args) => {
              const fnScope: Scope = Object.create(scope);
              params.forEach((param, idx) => {
                if (idx < args.length) {
                  fnScope[param.name] = args[idx];
                } else if (param.defExpr !== null) {
                  fnScope[param.name] = evalExpression(param.defExpr, scope, stepGuard);
                } else {
                  throw new Error(`TypeError: ${fnName}() missing required argument '${param.name}'`);
                }
              });
              try {
                execBlock(block, fnScope);
                return null;
              } catch (sig) {
                if (sig instanceof ReturnSignal) return sig.value;
                throw sig;
              }
            }
          };
          i = nextIdx;
          continue;
        }

        // Return
        if (text === 'return' || text.startsWith('return ')) {
          const expr = text.slice(6).trim();
          const val = expr ? evalExpression(expr, scope, stepGuard) : null;
          throw new ReturnSignal(val);
        }

        // For loop
        if (text.startsWith('for ') && text.endsWith(':')) {
          const body = text.slice(4, -1);
          const inMatch = body.match(/^(.+?)\s+in\s+(.+)$/);
          if (!inMatch) throw new Error(`SyntaxError: invalid for loop '${text}'`);
          const lhs = inMatch[1].trim();
          const iterExpr = inMatch[2].trim();
          const { block, nextIdx } = collectBlock(lines, i + 1, line.indent);
          const iterable = evalExpression(iterExpr, scope, stepGuard);
          if (!Array.isArray(iterable)) {
            throw new Error(`TypeError: '${getPyTypeName(iterable)}' object is not iterable`);
          }
          for (const item of iterable) {
            if (++stepGuard.count > 100000) throw new Error('RuntimeError: execution limit exceeded');
            assignTarget(lhs, item, scope);
            execBlock(block, scope);
          }
          i = nextIdx;
          continue;
        }

        // While loop
        if (text.startsWith('while ') && text.endsWith(':')) {
          const condExpr = text.slice(6, -1).trim();
          const { block, nextIdx } = collectBlock(lines, i + 1, line.indent);
          while (isTruthy(evalExpression(condExpr, scope, stepGuard))) {
            if (++stepGuard.count > 100000) throw new Error('RuntimeError: while loop iteration limit exceeded');
            execBlock(block, scope);
          }
          i = nextIdx;
          continue;
        }

        // If / elif / else
        if (text.startsWith('if ') && text.endsWith(':')) {
          const branches: { condExpr: string | null; block: CodeLine[] }[] = [];
          const firstBlock = collectBlock(lines, i + 1, line.indent);
          branches.push({ condExpr: text.slice(3, -1).trim(), block: firstBlock.block });
          let nextIdx = firstBlock.nextIdx;

          while (nextIdx < lines.length && lines[nextIdx].indent === line.indent) {
            const nxt = lines[nextIdx].text;
            if (nxt.startsWith('elif ') && nxt.endsWith(':')) {
              const b = collectBlock(lines, nextIdx + 1, line.indent);
              branches.push({ condExpr: nxt.slice(5, -1).trim(), block: b.block });
              nextIdx = b.nextIdx;
            } else if (nxt === 'else:') {
              const b = collectBlock(lines, nextIdx + 1, line.indent);
              branches.push({ condExpr: null, block: b.block });
              nextIdx = b.nextIdx;
              break;
            } else {
              break;
            }
          }

          for (const br of branches) {
            if (br.condExpr === null || isTruthy(evalExpression(br.condExpr, scope, stepGuard))) {
              execBlock(br.block, scope);
              break;
            }
          }
          i = nextIdx;
          continue;
        }

        if (text === 'pass') {
          i++;
          continue;
        }

        // Assignment or augmented assignment
        const assign = findAssignOp(text);
        if (assign) {
          const lhs = text.slice(0, assign.idx).trim();
          const rhs = text.slice(assign.idx + assign.op.length).trim();
          const rhsVal = evalExpression(rhs, scope, stepGuard);
          if (assign.op === '=') {
            assignTarget(lhs, rhsVal, scope);
          } else {
            const cur = evalExpression(lhs, scope, stepGuard);
            const baseOp = assign.op[0];
            assignTarget(lhs, applyBinaryOp(baseOp, cur, rhsVal), scope);
          }
          i++;
          continue;
        }

        // Standalone expression
        evalExpression(text, scope, stepGuard);
        i++;
      } catch (err) {
        if (err instanceof ReturnSignal) throw err;
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Line ${line.lineNo}: ${msg}`);
      }
    }
  }

  try {
    const lines = preprocessLines(code);
    execBlock(lines, env);
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const userVars: Record<string, PyValue> = {};
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === 'object' && v !== null && '__callable' in v && ['print', 'type', 'range', 'len', 'sum', 'abs', 'round', 'min', 'max', 'sorted', 'list', 'int', 'float', 'str', 'complex', 'pow', 'zip', 'enumerate'].includes(k)) {
        continue;
      }
      userVars[k] = v;
    }
    return {
      ok: true,
      output: outputLines.length > 0 ? outputLines.join('\n') : 'Code ran with no printed output.',
      lines: outputLines,
      variables: userVars,
      durationMs: Math.max(0.1, Number((t1 - t0).toFixed(2)))
    };
  } catch (err) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      output: message,
      lines: outputLines,
      error: message,
      variables: {},
      durationMs: Math.max(0.1, Number((t1 - t0).toFixed(2)))
    };
  }
}

// ---------- Safe Math Function Expression Evaluator for Canvas Visualizer ----------

const PLOT_MATH_ENV: Scope = {
  ...createMathModule(),
  abs: { __callable: true, name: 'abs', call: (args) => Math.abs(toNumeric(args[0])) },
  ln: { __callable: true, name: 'ln', call: (args) => Math.log(toNumeric(args[0])) }
};

export function normalizeMathExpression(raw: string): string {
  return raw
    .trim()
    .replace(/\^/g, '**')
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/\)(\d|[a-zA-Z(])/g, ')*$1');
}

export function evaluateMathExpression(expr: string, x: number): number {
  const normalized = normalizeMathExpression(expr);
  if (!normalized) return NaN;
  const scope: Scope = { ...PLOT_MATH_ENV, x };
  const val = evalExpression(normalized, scope, { count: 0 });
  const num = toNumeric(val);
  return Number.isFinite(num) ? num : NaN;
}

export function numericalDerivative(expr: string, x: number, h = 1e-4): number {
  return (evaluateMathExpression(expr, x + h) - evaluateMathExpression(expr, x - h)) / (2 * h);
}

export function riemannSum(expr: string, a: number, b: number, n: number, mode: 'left' | 'midpoint' | 'right' = 'midpoint'): number {
  const steps = Math.max(1, Math.min(2000, Math.trunc(n)));
  const dx = (b - a) / steps;
  let total = 0;
  for (let i = 0; i < steps; i++) {
    const offset = mode === 'left' ? 0 : mode === 'right' ? 1 : 0.5;
    const x = a + (i + offset) * dx;
    const y = evaluateMathExpression(expr, x);
    if (Number.isFinite(y)) total += y * dx;
  }
  return total;
}

// ---------- Deterministic Challenge Verifier ----------

export interface ChallengeCheckRule {
  description: string;
  requiredOutputs?: string[];
  requiredNumbers?: { value: number; tolerance?: number; label?: string }[];
  minPrintLines?: number;
  requiredCodePatterns?: { pattern: string; label: string }[];
}

export interface VerificationResult {
  passed: boolean;
  feedback: string;
  checks: { label: string; passed: boolean }[];
}

function extractNumbersFromOutput(output: string): number[] {
  const matches = output.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) ?? [];
  return matches.map(Number).filter(Number.isFinite);
}

export function verifyChallenge(code: string, runResult: PythonRunResult, rule: ChallengeCheckRule): VerificationResult {
  const checks: { label: string; passed: boolean }[] = [];

  if (!runResult.ok) {
    return {
      passed: false,
      feedback: `Fix the Python error before checking: ${runResult.error ?? runResult.output}`,
      checks: [{ label: 'Code executes without errors', passed: false }]
    };
  }
  checks.push({ label: 'Code executes without errors', passed: true });

  const minLines = rule.minPrintLines ?? 1;
  const hasOutput = runResult.lines.length >= minLines;
  checks.push({
    label: `Prints at least ${minLines} line${minLines > 1 ? 's' : ''} of output`,
    passed: hasOutput
  });

  if (rule.requiredCodePatterns) {
    for (const pat of rule.requiredCodePatterns) {
      const rx = new RegExp(pat.pattern, 'i');
      checks.push({
        label: pat.label,
        passed: rx.test(code)
      });
    }
  }

  if (rule.requiredOutputs) {
    for (const expected of rule.requiredOutputs) {
      checks.push({
        label: `Output includes "${expected}"`,
        passed: runResult.output.toLowerCase().includes(expected.toLowerCase())
      });
    }
  }

  if (rule.requiredNumbers) {
    const foundNums = extractNumbersFromOutput(runResult.output);
    for (const req of rule.requiredNumbers) {
      const tol = req.tolerance ?? 1e-2;
      const matched = foundNums.some(n => Math.abs(n - req.value) <= tol);
      checks.push({
        label: req.label ?? `Output includes ≈ ${req.value}`,
        passed: matched
      });
    }
  }

  const failed = checks.filter(c => !c.passed);
  if (failed.length === 0) {
    return {
      passed: true,
      feedback: `All ${checks.length} verification checks passed. Day completed.`,
      checks
    };
  }

  return {
    passed: false,
    feedback: `Missing ${failed.length} requirement${failed.length > 1 ? 's' : ''}: ${failed.map(f => f.label).join('; ')}.`,
    checks
  };
}
