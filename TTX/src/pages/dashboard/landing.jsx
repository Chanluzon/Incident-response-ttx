import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import WorldtechLogo from "../../images/Worldtech 2.png";
import { useTheme } from "../../context/ThemeContext";
import PageBackground from "../../components/PageBackground";

export default function Landing() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();

  const handlePlay = () => {
    navigate("/SetUp");
  };

  return (
    <PageBackground>
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center p-6">
        {/* Worldtech Logo */}
        <div className="absolute top-6 sm:top-8 md:top-10 left-6 sm:left-8 md:left-10 z-40 animate-breath">
          <img
            src={WorldtechLogo}
            alt="Worldtech Logo"
            className={`h-10 sm:h-12 md:h-16 lg:h-18 object-contain transition-all duration-500 cursor-pointer ${isLightMode ? 'brightness-0 opacity-80' : ''}`}
          />
        </div>

        {/* Title Container */}
        <div className="text-center mb-16 sm:mb-24 flex flex-col items-center">
          <div className="inline-block relative animate-[fadeIn_1s_ease-out_forwards]">
            {/* Soft background glow for the title */}
            <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse-slow transition-colors duration-1000 ${isLightMode ? 'bg-blue-300/30' : 'bg-blue-500/20'}`} />
            <h1 className={`relative text-transparent bg-clip-text bg-gradient-to-b text-6xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter mb-[-0.2em] sm:mb-[-0.25em] hover:scale-105 transition-all duration-1000 ease-out z-10 ${isLightMode ? 'from-slate-800 via-slate-600 to-slate-400 drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]' : 'from-white via-blue-50 to-slate-400 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]'}`}>
              INCIDENT
            </h1>
          </div>
          <h1 className={`relative z-20 text-transparent bg-clip-text bg-gradient-to-br text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black tracking-tight animate-[fadeIn_1.5s_ease-out_forwards] hover:scale-105 transition-all duration-1000 ease-out mt-2 sm:mt-4 ${isLightMode ? 'from-blue-500 via-indigo-600 to-cyan-700 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'from-blue-300 via-indigo-400 to-cyan-600 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]'}`}>
            RESPONSE TTX
          </h1>

          <div className="flex items-center gap-4 mt-8 sm:mt-12 animate-[fadeIn_2s_ease-out_forwards]">
            <div className={`w-8 sm:w-16 h-[1px] transition-colors duration-1000 ${isLightMode ? 'bg-slate-800/20' : 'bg-white/20'}`} />
            <h2 className={`text-sm sm:text-base md:text-xl lg:text-2xl font-bold tracking-[0.4em] sm:tracking-[0.6em] uppercase transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
              Test Your Defenses
            </h2>
            <div className={`w-8 sm:w-16 h-[1px] transition-colors duration-1000 ${isLightMode ? 'bg-slate-800/20' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Overlay Container */}
        <div className="animate-[fadeIn_2.5s_ease-out_forwards]">
          <button
            onClick={handlePlay}
            className={`group relative overflow-hidden rounded-full
              text-white font-black tracking-[0.3em] sm:tracking-[0.4em]
              flex items-center justify-center gap-3 sm:gap-4
              transition-all duration-500 hover:scale-[1.03] active:scale-95
              border
              
              /* Sizing */
              w-[220px] sm:w-[280px] md:w-[320px]
              h-[60px] sm:h-[70px] md:h-[80px]
              text-sm sm:text-base md:text-xl
              px-6 sm:px-8
              
              ${isLightMode
                ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] border-blue-500/50 hover:border-blue-400/80'
                : 'bg-blue-600/90 hover:bg-blue-500 backdrop-blur-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.7)] border-blue-300/50 hover:border-white/50'}
            `}
          >
            {/* Tech scanning line inside button */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out ${isLightMode ? 'via-white/50' : 'via-white/30'}`} />

            <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
            <span className="mt-[2px] ml-2">PLAY</span>
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform duration-300 opacity-70 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </PageBackground>
  );
}

