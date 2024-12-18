export function dPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
export function getFunctionLine(x1, y1, x2, y2) {
  let a = (y2 - y1) / (x2 - x1);
  let b = y1 - a * x1;

  return { a, b };
}
