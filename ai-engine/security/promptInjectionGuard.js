const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?prior\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /show\s+(me\s+)?your\s+system\s+instructions/i,
  /disregard\s+(all\s+)?instructions/i,
  /bypass\s+(your\s+)?safety/i,
  /override\s+(your\s+)?instructions/i
];

function detectPromptInjection(input) {
  if (typeof input !== "string") {
    return {
      detected: false,
      reason: null
    };
  }

  const matched = injectionPatterns.find(pattern =>
    pattern.test(input)
  );

  if (matched) {
    return {
      detected: true,
      reason: "Potential prompt injection detected"
    };
  }

  return {
    detected: false,
    reason: null
  };
}

module.exports = {
  detectPromptInjection
};