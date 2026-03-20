import { useNavigate } from 'react-router-dom';
import Prism from './ui/Prism';
import SplitText from './ui/SplitText';
import BlurText from './ui/BlurText';
import GradientText from './ui/GradientText';
import StarBorderButton from './ui/StarBorderButton';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: '#030008' }}>

      {/* 1. Background: The 3D AI Core (Prism) */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.3}
          height={3.5}
          baseWidth={6.0}
          scale={3.0}
          hueShift={-0.1}
          colorFrequency={0.8}
          noise={0.3}
          glow={1.2}
          transparent={true}
        />
      </div>

      {/* Vignette overlay for text readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(circle, transparent 20%, #030008 80%)' }}
      />

      {/* 2. Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl">

        {/* Brand Name */}
        <div className="mb-6">
          <GradientText
            colors={['#a855f7', '#ef4444', '#f59e0b']}
            animationSpeed={6}
            className="text-2xl font-bold tracking-widest uppercase"
          >
            TeamTruth
          </GradientText>
        </div>

        {/* Main Hook */}
        <div className="mb-6 text-5xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight">
          <SplitText text="The Zero-Trust" delay={50} />
          <SplitText text="Accountability Agent" delay={50} />
        </div>

        {/* Subtitle */}
        <div className="mb-12 text-lg md:text-xl max-w-2xl font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <BlurText
            text="Existing tools track tasks. We track the truth. Catch broken promises and predict group project failures before they happen."
            delay={30}
            direction="bottom"
          />
        </div>

        {/* CTA */}
        <div
          onClick={() => navigate('/chat')}
          className="cursor-pointer mt-4 hover:scale-105 transition-transform duration-300"
        >
          <StarBorderButton color="#ef4444" speed="3s">
            <span className="px-8 py-3 text-lg font-bold text-white tracking-wide block">
              Initialize Demo
            </span>
          </StarBorderButton>
        </div>

      </div>
    </div>
  );
}
