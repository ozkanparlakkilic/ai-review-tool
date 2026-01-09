export function isNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold = 50
) {
  return scrollHeight - scrollTop - clientHeight < threshold;
}
