const homeStart = 0.95;
const homeFinish = 0.35;
const maxLift = height => Math.min(height * 0.612, 816);
const maxDepth = (width, height) => Math.min(height * 0.32, Math.min(120, Math.max(24, width / 24)) * 4);
const smoothstep = t => t * t * (3 - 2 * t);

// Scroll controls curvature and vertical reach separately. At the finish
// position the edge is exactly straight, while still inside the viewport.
export function waveGeometry(top, width, height, start = homeStart, reducedMotion = false, finish = homeFinish) {
  if (reducedMotion) return { lift: 0, depth: 0 };

  const progress = Math.max(0, Math.min(1,
    (height * start - top) / (height * Math.max(0.01, start - finish)),
  ));
  const eased = smoothstep(progress);
  return {
    lift: maxLift(height) * eased,
    depth: maxDepth(width, height) * (1 - eased),
  };
}

// Reading sections have less room above them than the homepage scenes.
// Limit their travel smoothly, then match the homepage's curvature at the
// same painted crest. This keeps a short section from going flat mid-screen.
export function editorialWaveGeometry(top, width, height, clearance, reducedMotion = false) {
  const reach = maxLift(height);
  if (reducedMotion || clearance >= reach || top >= homeStart * height) {
    return waveGeometry(top, width, height, homeStart, reducedMotion);
  }
  const travel = Math.max(0, clearance);
  if (top <= homeFinish * height - reach + travel) return { lift: travel, depth: 0 };

  // Begin at the homepage speed, then spend the available travel across the
  // entire transition. Even a tight reading gap keeps moving in the middle.
  const liftAt = eased => travel === 0 ? 0
    : travel * reach * eased / (travel + (reach - travel) * eased);
  const startY = height * homeStart;
  const distance = height * (homeStart - homeFinish);
  let lower = 0;
  let upper = 1;
  for (let i = 0; i < 14; i++) {
    const phase = (lower + upper) / 2;
    const eased = smoothstep(phase);
    const crest = startY - distance * phase - reach * eased;
    // The target section top is the painted crest plus its local lift.
    if (crest + liftAt(eased) > top) lower = phase;
    else upper = phase;
  }
  const eased = smoothstep((lower + upper) / 2);
  return { lift: liftAt(eased), depth: maxDepth(width, height) * (1 - eased) };
}

// Matches the CSS elliptical top corners (50% horizontal radius).
export function waveEdgeAtX(top, left, width, x, { lift, depth }) {
  const normalizedX = Math.min(1, Math.abs((x - left - width / 2) / (width / 2)));
  return top - lift + depth * (1 - Math.sqrt(1 - normalizedX * normalizedX));
}

// Programme cloud starts outside the viewport and only finishes flattening
// as the gallery reaches its horizontal pin, rather than halfway through entry.
export function programWaveGeometry(top, width, height, reducedMotion = false) {
  if (reducedMotion) return { lift: 0, depth: 0 };
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  const rise = ease(clamp((height * 1.15 - top) / (height * 1.23)));
  const flatten = ease(clamp((height * .7 - top) / (height * .78)));
  return {
    lift: Math.min(height * .22, 240) * rise,
    depth: Math.min(height * .3, width / 6) * (1 - flatten),
  };
}
