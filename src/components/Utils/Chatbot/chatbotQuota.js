/**
 * Helper to map task reasons to continuous verb form.
 */
export function getProgressiveReason(reason) {
  const mapping = {
    "help my master find something": "helping her master find something",
    "see what my master needs": "seeing what her master needs",
    "see something in the kitchen": "checking the kitchen",
    "carry something": "carrying something",
    "feed my cat": "feeding the cat",
    "charge Nico's battery": "charging Nico's battery",
    "look at something my master is fixing": "looking at what her master is fixing",
    "taste-test my master's cooking": "taste-testing her master's cooking",
    "find room keys": "finding room keys",
    "help my master make a phone call": "helping her master make a phone call",
    "help my master on a phone call": "helping her master on a phone call",
    "check something in the workspace": "checking the workspace"
  };
  return mapping[reason] || "busy with tasks";
}

/**
 * Returns current text description of Mia's task based on cooldown progress.
 */
export function getCurrentTask(currentCooldown, totalDuration, cooldownSteps) {
  if (!cooldownSteps || cooldownSteps.length < 3) {
    return "Mia is preparing to return...";
  }

  const elapsedPercent = ((totalDuration - currentCooldown) / totalDuration) * 100;
  if (elapsedPercent < 25) {
    return `Looks like Mia is ${getProgressiveReason(cooldownSteps[0])}...`;
  } else if (elapsedPercent < 55) {
    return `Looks like Mia is ${getProgressiveReason(cooldownSteps[1])}...`;
  } else if (elapsedPercent < 80) {
    return `Looks like Mia is ${getProgressiveReason(cooldownSteps[2])}...`;
  } else {
    return "Mia is preparing to return...";
  }
}

/**
 * Returns step percentage for the cooldown visual bar.
 */
export function getSteppedProgress(currentCooldown, totalDuration) {
  const elapsedPercent = ((totalDuration - currentCooldown) / totalDuration) * 100;
  if (elapsedPercent < 25) return 20;
  if (elapsedPercent < 55) return 45;
  if (elapsedPercent < 80) return 70;
  return 92;
}
