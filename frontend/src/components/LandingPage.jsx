import React from 'react';
import { useNavigate } from 'react-router-dom';
import Prism from './ui/Prism'; // Your 3D WebGL core
import SplitText from './ui/SplitText';
import BlurText from './ui/BlurText';
import GradientText from './ui/GradientText';
import StarBorderButton from './ui/StarBorderButton';
import ScrollFloat from './ui/ScrollFloat'; // The scroll animation component

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container bg-[#030008] text-white overflow-x-hidden font-inter">
      
      {/* ========================================== */}
      {/* SECTION 1: HERO ( Lie Detector Core )     */}
      {/* ========================================== */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* 1. Background: The 3D Prism Core */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Prism
            animationType="rotate"
            timeScale={0.3} // Slow, menacing rotation
            height={3.5}
            baseWidth={6.0}
            scale={3.0} 
            hueShift={-0.1} // Deep purples and reds
            colorFrequency={0.8}
            noise={0.3} // Subtle static
            glow={1.2} // Bright cyber-glow
            transparent={true}
          />
        </div>

        {/* 🛡️ P0 FIXED: VIGNETTE OVERLAY FOR READABILITY */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
             style={{ background: 'radial-gradient(circle, transparent 20%, #030008 80%)' }}>
        </div>

        {/* 2. Foreground Content (Centered) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          
          {/* Logo/Brand (Gradient Shimmer) */}
          <div className="mb-10 md:mb-12">
            <GradientText 
              colors={["#a855f7", "#ef4444", "#f59e0b"]} 
              animationSpeed={6}
              className="text-2xl font-black tracking-widest uppercase"
            >
              TeamTruth
            </GradientText>
          </div>

          {/* Main Hook (P0 FIXED: Consolidated SplitText) */}
          <div className="mb-16 md:mb-18 text-5xl md:text-7xl font-extrabold text-white drop-shadow-2xl leading-tight tracking-tighter">
            <SplitText 
              text="THE ZERO-TRUST ACCOUNTABILITY AGENT" 
              delay={20} // Faster, cleaner reveal
            />
          </div>

          {/* Subtitle (Blurred entrance, clean text color) */}
          <div className="mb-20 md:mb-24 text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed mx-auto">
            <BlurText 
              text="Existing tools track tasks. We track the truth. Catch broken promises and predict group project failures before they happen." 
              delay={100} 
              direction="bottom" 
            />
          </div>

          {/* Call to Action Button */}
          <div onClick={() => navigate('/chat')} className="cursor-pointer hover:scale-105 transition-transform duration-300">
            <StarBorderButton color="#ef4444" speed="3s">
              <span className="px-10 py-4 text-xl font-bold text-white tracking-wide block">
                Initialize Demo
              </span>
            </StarBorderButton>
          </div>

        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 2: EXPLANATION ( Scroll Float )    */}
      {/* ========================================== */}
      <section className="features-container relative py-32 bg-[#030008] border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto">
          
          <ScrollFloat
            text="TEAMTRUTH isn't just a chatbot. It's an accountability protocol. When Bob types, 'I finished the database schema,' we cross-reference that claim against actual repository commits. If 0 commits are found, our AI agent doesn't congratulate Bob—it triggers a contradiction alert, instantly recalibrating team trust scores in real-time. We visualize past decisions as physics-based nodes, showing exactly where a project is stalling before it fails."
            className="text-4xl md:text-5xl font-extrabold text-white/95 leading-[1.3] tracking-tighter"
            letterDelay={10} // Staggered word animation
          />

        </div>
      </section>

    </div>
  );
}
