import { parser } from "@lezer/javascript";
import { MAX_MISSION_CODE_LENGTH } from "./mission";

type SyntaxNode = ReturnType<typeof parser.parse>["topNode"];
type Variable = "price" | "discountPercent";
type Operator = "+" | "-" | "*" | "/" | "%";
type Expression =
  | { kind: "number"; value: number }
  | { kind: "variable"; name: Variable }
  | { kind: "binary"; operator: Operator; left: Expression; right: Expression };

export class MissionSyntaxError extends Error {
  constructor() {
    super("Unsupported mission code");
    this.name = "MissionSyntaxError";
  }
}

function children(node: SyntaxNode): SyntaxNode[] {
  const result: SyntaxNode[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.name !== "LineComment" && child.name !== "BlockComment") result.push(child);
  }
  return result;
}

function requireNodeName(node: SyntaxNode | undefined, name: string): SyntaxNode {
  if (!node || node.name !== name || node.type.isError) throw new MissionSyntaxError();
  return node;
}

function parseExpression(node: SyntaxNode, source: string, depth = 0): Expression {
  if (node.type.isError || depth > 32) throw new MissionSyntaxError();

  if (node.name === "Number") {
    const value = Number(source.slice(node.from, node.to));
    if (!Number.isFinite(value)) throw new MissionSyntaxError();
    return { kind: "number", value };
  }

  if (node.name === "VariableName") {
    const name = source.slice(node.from, node.to);
    if (name === "price" || name === "discountPercent") return { kind: "variable", name };
    throw new MissionSyntaxError();
  }

  const parts = children(node);
  if (node.name === "ParenthesizedExpression") {
    requireNodeName(parts[0], "(");
    const expression = parts[1];
    requireNodeName(parts[2], ")");
    if (parts.length !== 3 || !expression) throw new MissionSyntaxError();
    return parseExpression(expression, source, depth + 1);
  }

  if (node.name === "BinaryExpression") {
    if (parts.length !== 3) throw new MissionSyntaxError();
    const left = parseExpression(parts[0], source, depth + 1);
    const operatorNode = requireNodeName(parts[1], "ArithOp");
    const operator = source.slice(operatorNode.from, operatorNode.to);
    if (!["+", "-", "*", "/", "%"].includes(operator)) throw new MissionSyntaxError();
    return {
      kind: "binary",
      operator: operator as Operator,
      left,
      right: parseExpression(parts[2], source, depth + 1),
    };
  }

  throw new MissionSyntaxError();
}

function evaluate(expression: Expression, price: number, discountPercent: number): number {
  if (expression.kind === "number") return expression.value;
  if (expression.kind === "variable") {
    return expression.name === "price" ? price : discountPercent;
  }

  const left = evaluate(expression.left, price, discountPercent);
  const right = evaluate(expression.right, price, discountPercent);
  switch (expression.operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
    case "%": return left % right;
  }
}

export function compileMission(source: string): (price: number, discountPercent: number) => number {
  if (source.length > MAX_MISSION_CODE_LENGTH) throw new MissionSyntaxError();
  const tree = parser.parse(source);
  const root = children(tree.topNode);
  if (root[root.length - 1]?.name === ";") root.pop();
  if (root.length !== 1) throw new MissionSyntaxError();

  const declaration = requireNodeName(root[0], "FunctionDeclaration");
  const declarationParts = children(declaration);
  if (declarationParts.length !== 4) throw new MissionSyntaxError();
  const name = requireNodeName(declarationParts[1], "VariableDefinition");
  if (source.slice(name.from, name.to) !== "calculateTotal") throw new MissionSyntaxError();

  const params = requireNodeName(declarationParts[2], "ParamList");
  const parameterParts = children(params);
  if (
    parameterParts.length !== 5 ||
    parameterParts[0].name !== "(" ||
    parameterParts[1].name !== "VariableDefinition" ||
    source.slice(parameterParts[1].from, parameterParts[1].to) !== "price" ||
    parameterParts[2].name !== "," ||
    parameterParts[3].name !== "VariableDefinition" ||
    source.slice(parameterParts[3].from, parameterParts[3].to) !== "discountPercent" ||
    parameterParts[4]?.name !== ")"
  ) {
    throw new MissionSyntaxError();
  }

  const block = requireNodeName(declarationParts[3], "Block");
  const blockParts = children(block);
  if (
    blockParts.length !== 3 ||
    blockParts[0].name !== "{" ||
    blockParts[1].name !== "ReturnStatement" ||
    blockParts[2].name !== "}"
  ) {
    throw new MissionSyntaxError();
  }

  const returnParts = children(blockParts[1]);
  if (
    (returnParts.length !== 2 && returnParts.length !== 3) ||
    returnParts[0].name !== "return" ||
    (returnParts.length === 3 && returnParts[2].name !== ";")
  ) {
    throw new MissionSyntaxError();
  }

  const expression = parseExpression(returnParts[1], source);
  return (price, discountPercent) => evaluate(expression, price, discountPercent);
}
