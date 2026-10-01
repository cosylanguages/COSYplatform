/**
 * WCAG AA Contrast Ratio Checker
 * Checks text and background color pairs used by COSYplatform role tokens and contrast fixes.
 * Exits with code 1 if any pair has a contrast ratio below 4.5:1.
 */

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const expanded = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  return [
    parseInt(expanded.slice(0, 2), 16) / 255,
    parseInt(expanded.slice(2, 4), 16) / 255,
    parseInt(expanded.slice(4, 6), 16) / 255
  ];
}

function getRelativeLuminance([r, g, b]) {
  const normalize = (v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const rL = normalize(r);
  const gL = normalize(g);
  const bL = normalize(b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hexToRgb(hex1));
  const l2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const colorPairs = [
  { label: 'Student Primary on White', fg: '#0369a1', bg: '#ffffff' },
  { label: 'Student Primary / Badge on Student Light BG', fg: '#0369a1', bg: '#e0f2fe' },
  { label: 'Teacher Primary on White', fg: '#6d28d9', bg: '#ffffff' },
  { label: 'Teacher Primary / Badge on Teacher Light BG', fg: '#6d28d9', bg: '#f3e8ff' },
  { label: 'Subtle Text (#64748b) on White', fg: '#64748b', bg: '#ffffff' },
  { label: 'Subtle Text (#64748b) on Cream (#fdfcf8)', fg: '#64748b', bg: '#fdfcf8' },
  { label: 'White Text on Amber Fix (#b45309)', fg: '#ffffff', bg: '#b45309' },
  { label: 'White Text on Live Classroom (#047857)', fg: '#ffffff', bg: '#047857' },
  { label: 'Disabled Input Text (#475569) on Disabled Input BG (#f1f5f9)', fg: '#475569', bg: '#f1f5f9' },
  { label: 'Saved Status Text (#047857) on White (#ffffff)', fg: '#047857', bg: '#ffffff' }
];

if (require.main === module) {
  console.log('🎨 Running COSYplatform WCAG AA Color Contrast Verification...\n');

  let failed = false;

  colorPairs.forEach(({ label, fg, bg }) => {
    const ratio = getContrastRatio(fg, bg);
    const formattedRatio = ratio.toFixed(2);
    if (ratio >= 4.5) {
      console.log(`  ✅ [PASS] ${label} (${fg} / ${bg}): ${formattedRatio}:1`);
    } else {
      console.error(`  ❌ [FAIL] ${label} (${fg} / ${bg}): ${formattedRatio}:1 (Below 4.5:1 required)`);
      failed = true;
    }
  });

  console.log('');
  if (failed) {
    console.error('❌ Contrast verification failed! One or more color pairs do not meet WCAG AA requirements (4.5:1).');
    process.exit(1);
  } else {
    console.log('✨ All color contrast pairs successfully passed WCAG AA checks (>= 4.5:1)!');
    process.exit(0);
  }
}

module.exports = { getContrastRatio, hexToRgb, getRelativeLuminance, colorPairs };
