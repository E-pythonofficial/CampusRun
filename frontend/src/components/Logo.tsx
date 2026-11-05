interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean; // true = off-white version, for dark (charcoal) backgrounds like the nav
}

// Icon height in px for each size
const sizeMap = {
  sm: 28,
  md: 40,
  lg: 60,
};

// How tall the "W!Gotcha" wordmark is compared to the icon.
// 0.5 = half the icon's height. Make it smaller (0.4) or bigger (0.6) to taste.
const WORDMARK_RATIO = 0.5;

const Logo = ({ size = 'md', light = false }: LogoProps) => {
  const iconHeight = sizeMap[size];
  const wordmarkHeight = Math.round(iconHeight * WORDMARK_RATIO);

  // These files live in the public folder, so plain string paths work (no imports).
  const suffix = light ? '-light' : '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src={`/wgotcha-icon${suffix}.png`}
        alt="W!Gotcha icon"
        style={{ height: iconHeight, width: 'auto', objectFit: 'contain' }}
      />
      <img
        src={`/wgotcha-wordmark${suffix}.png`}
        alt="W!Gotcha"
        style={{ height: wordmarkHeight, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
};

export default Logo;