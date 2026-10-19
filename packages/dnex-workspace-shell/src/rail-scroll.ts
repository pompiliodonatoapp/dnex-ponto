/** One CSS pixel absorbs fractional scroll positions and browser rounding at an edge. */
export function railScrollAvailability({ scrollTop, scrollHeight, clientHeight }: {
  scrollTop: number; scrollHeight: number; clientHeight: number;
}) {
  const maximum = Math.max(0, scrollHeight - clientHeight);
  const position = Math.min(maximum, Math.max(0, scrollTop));
  const visible = clientHeight > 0;
  return { previous: visible && position > 1, next: visible && maximum - position > 1 };
}
