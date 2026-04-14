interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

const sizeMap = {
  sm: { img: 24, text: '1.125rem' },
  md: { img: 32, text: '1.5rem' },
  lg: { img: 48, text: '2.25rem' },
};

const Logo = ({ size = 'md', light = false }: LogoProps) => {
  const s = sizeMap[size];
  
  // Since it's in the public folder, we just use the string path.
  // Note: No "import mascot from..." is needed at the top.
  const mascotPath = "/mascot2.png"; 

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={mascotPath} 
          alt="CampusRun Mascot" 
          style={{ 
            width: s.img, 
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>
      <span
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: 'bold',
          fontSize: s.text,
          color: light ? '#FFFFFF' : '#0F1C2E',
          letterSpacing: '0.05em',
        }}
      >
        Campus<span style={{ color: '#F97316' }}>Run</span>
      </span>
    </div>
  );
};

export default Logo;