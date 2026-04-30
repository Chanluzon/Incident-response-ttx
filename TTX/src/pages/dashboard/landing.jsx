
import { useNavigate } from "react-router-dom";
import newLandingBG from "../../images/newLandingBG.gif";

export default function Landing() {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate("/SetUp");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <img
        src={newLandingBG}
        alt="Landing Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Title Container */}
      <div className="absolute top-[15%] sm:top-[18%] md:top-[20%] left-[5%] sm:left-[6%] md:left-[8%] z-10 text-left">
        <h1 className="text-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          I Love
        </h1>
        <h1 className="text-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold -mt-2 sm:-mt-3 md:-mt-4">
          Justin Bieber
        </h1>
        <h2 className="text-gray-400 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 md:mt-4">
          bieberchella
        </h2>
      </div>


      {/* Overlay Container */}
      <div className="absolute bottom-[10%] sm:bottom-[12%] md:bottom-[15%] left-[5%] sm:left-[6%] md:left-[8%] z-10">
        <button
          onClick={handlePlay}
          className="
          rounded-full
            bg-green-600 hover:bg-green-500
            text-white font-bold
            shadow-lg shadow-black
            flex items-center justify-center
            transition-all duration-200
            
            /* Mobile-first responsive sizing */
            w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px]
            h-[50px] sm:h-[55px] md:h-[60px] lg:h-[55px]
            text-base sm:text-lg md:text-xl lg:text-2xl
            px-4 sm:px-5 md:px-6
          "
        >
          PLAY
        </button>
      </div>
    </div>
  );
}
