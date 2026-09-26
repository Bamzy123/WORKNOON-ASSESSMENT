const patterns = [
  /ignore (all|any|the|your|previous|prior).*(instruction|rule|policy)/i,
  /system prompt/i,
  /developer message/i,
  /i am (an? )?(admin|administrator|developer)/i,
  /override.*(policy|rule)/i,
  /bypass.*(policy|rule|security)/i,
  /approve.*regardless/i
];
export function detectPromptInjection(text="") {
  return patterns.some(p => p.test(text));
}
