import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { expression } = await request.json();
    // Match a simple binary expression: A op B [=C]
    const m = expression.match(/^\s*(\d+)\s*([\+\-\*\/])\s*(\d+)(?:\s*=\s*(\d+))?\s*$/);
    if (!m) throw new Error('Bad format');

    const a = parseInt(m[1], 10);
    const op = m[2];
    const b = parseInt(m[3], 10);
    let result = m[4] !== undefined ? parseInt(m[4], 10) : null;

    // Compute if not provided
    if (result === null) {
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0 || a % b !== 0) {
            return NextResponse.json(
              { limitation: 'Cannot visualize non-integer division' },
              { status: 200 }
            );
          }
          result = a / b;
          break;
        default:
          throw new Error('Unsupported operator');
      }
    }

    return NextResponse.json({ a, b, op, result });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid expression format or unsupported operation' },
      { status: 400 }
    );
  }
}
