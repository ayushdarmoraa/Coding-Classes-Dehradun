const MISSION_TESTS = [
  { id: "discount-10", price: 800, discountPercent: 10, expected: 720 },
  { id: "discount-20", price: 1000, discountPercent: 20, expected: 800 },
  { id: "no-discount", price: 500, discountPercent: 0, expected: 500 },
  { id: "full-discount", price: 200, discountPercent: 100, expected: 0 },
] as const;

export function buildDiscountCalculationWorkerScript(): string {
  return `
    const MAX_MISSION_CODE_LENGTH = 5000;
    const MISSION_TESTS = ${JSON.stringify(MISSION_TESTS)};

    class MissionSyntaxError extends Error {
      constructor(message = "Unsupported mission code") {
        super(message);
        this.name = "MissionSyntaxError";
      }
    }

    function skipTrivia(text, index) {
      while (index < text.length) {
        if (/\\s/.test(text[index])) {
          index += 1;
        } else if (text.slice(index, index + 2) === "//") {
          index += 2;
          while (index < text.length && text[index] !== "\\n" && text[index] !== "\\r") index += 1;
        } else if (text.slice(index, index + 2) === "/*") {
          const end = text.indexOf("*/", index + 2);
          if (end === -1) throw new MissionSyntaxError();
          index = end + 2;
        } else {
          break;
        }
      }
      return index;
    }

    function parseNumber(text, index) {
      let end = index;
      while (end < text.length && /[0-9.]/.test(text[end])) end += 1;
      const raw = text.slice(index, end);
      if (!/^\\d+(?:\\.\\d+)?$/.test(raw)) throw new MissionSyntaxError();
      return { value: Number(raw), end };
    }

    function parseIdentifier(text, index) {
      index = skipTrivia(text, index);
      let end = index;
      while (end < text.length && /[A-Za-z0-9_$]/.test(text[end])) end += 1;
      const name = text.slice(index, end);
      if (!name || /^(?:\\d)/.test(name)) throw new MissionSyntaxError();
      return { name, end };
    }

    function parsePrimary(text, index) {
      index = skipTrivia(text, index);
      if (index >= text.length) throw new MissionSyntaxError();

      if (text[index] === "(") {
        const expr = parseExpression(text, index + 1);
        const close = skipTrivia(text, expr.end);
        if (close >= text.length || text[close] !== ")") throw new MissionSyntaxError();
        return { value: expr.value, end: close + 1 };
      }

      if (/\\d/.test(text[index])) {
        const number = parseNumber(text, index);
        return { value: { kind: "number", value: number.value }, end: number.end };
      }

      const identifier = parseIdentifier(text, index);
      if (identifier.name === "price" || identifier.name === "discountPercent") {
        return { value: { kind: "variable", name: identifier.name }, end: identifier.end };
      }
      throw new MissionSyntaxError();
    }

    function parseBinary(text, index, minPrecedence = 0) {
      let left = parsePrimary(text, index);
      while (true) {
        left.end = skipTrivia(text, left.end);
        const operator = left.end < text.length ? text[left.end] : null;
        const precedence = operator === "+" || operator === "-" ? 1 : operator === "*" || operator === "/" || operator === "%" ? 2 : null;
        if (precedence === null || precedence < minPrecedence) break;
        left.end += 1;
        const right = parseBinary(text, left.end, precedence + 1);
        left = {
          value: {
            kind: "binary",
            operator,
            left: left.value,
            right: right.value,
          },
          end: right.end,
        };
      }
      return left;
    }

    function parseExpression(text, index) {
      const parsed = parseBinary(text, index, 0);
      parsed.end = skipTrivia(text, parsed.end);
      return parsed;
    }

    function evaluateExpression(expression, price, discountPercent) {
      if (expression.kind === "number") return expression.value;
      if (expression.kind === "variable") {
        return expression.name === "price" ? price : discountPercent;
      }
      const left = evaluateExpression(expression.left, price, discountPercent);
      const right = evaluateExpression(expression.right, price, discountPercent);
      switch (expression.operator) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
        case "%": return left % right;
      }
    }

    function expectToken(text, index, token) {
      index = skipTrivia(text, index);
      if (text[index] !== token) throw new MissionSyntaxError();
      return index + 1;
    }

    function readKeyword(text, index, keyword) {
      index = skipTrivia(text, index);
      if (
        text.slice(index, index + keyword.length) !== keyword ||
        /[A-Za-z0-9_$]/.test(text[index + keyword.length] || "")
      ) {
        throw new MissionSyntaxError();
      }
      return index + keyword.length;
    }

    function compileMission(source) {
      if (source.length > MAX_MISSION_CODE_LENGTH) throw new MissionSyntaxError();
      let index = readKeyword(source, 0, "function");
      const name = parseIdentifier(source, skipTrivia(source, index));
      if (name.name !== "calculateTotal") throw new MissionSyntaxError();
      index = expectToken(source, name.end, "(");
      const price = parseIdentifier(source, index);
      if (price.name !== "price") throw new MissionSyntaxError();
      index = expectToken(source, price.end, ",");
      const discount = parseIdentifier(source, index);
      if (discount.name !== "discountPercent") throw new MissionSyntaxError();
      index = expectToken(source, discount.end, ")");
      index = expectToken(source, index, "{");
      index = readKeyword(source, index, "return");
      const expression = parseExpression(source, index);
      index = skipTrivia(source, expression.end);
      if (source[index] === ";") index += 1;
      index = expectToken(source, index, "}");
      index = skipTrivia(source, index);
      if (source[index] === ";") index = skipTrivia(source, index + 1);
      if (index !== source.length) throw new MissionSyntaxError();
      return (price, discountPercent) => evaluateExpression(expression.value, price, discountPercent);
    }

    self.addEventListener("message", (event) => {
      const request = event.data;
      if (
        typeof request !== "object" ||
        request === null ||
        Array.isArray(request) ||
        Object.keys(request).length !== 1 ||
        !Object.prototype.hasOwnProperty.call(request, "code") ||
        typeof request.code !== "string"
      ) {
        self.postMessage({ type: "error", error: "internal" });
        return;
      }
      if (request.code.length > MAX_MISSION_CODE_LENGTH) {
        self.postMessage({ type: "error", error: "input-too-long" });
        return;
      }

      let calculateTotal;
      try {
        calculateTotal = compileMission(request.code);
      } catch (error) {
        const category = error instanceof MissionSyntaxError ? "syntax" : "internal";
        self.postMessage({ type: "error", error: category });
        return;
      }

      const results = MISSION_TESTS.map((testCase) => {
        try {
          const output = calculateTotal(testCase.price, testCase.discountPercent);
          const actual = typeof output === "number" && Number.isFinite(output) ? output : null;
          return {
            ...testCase,
            actual,
            status: actual === testCase.expected ? "passed" : "incorrect",
          };
        } catch {
          return {
            ...testCase,
            actual: null,
            status: "runtime-error",
          };
        }
      });

      self.postMessage({ type: "results", results });
    });
  `;
}

export function createDiscountCalculationWorker(): Worker {
  const blob = new Blob([buildDiscountCalculationWorkerScript()], {
    type: "application/javascript",
  });
  return new Worker(URL.createObjectURL(blob), { type: "module" });
}
