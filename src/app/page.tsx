import ScrollSequence from "@/components/ScrollSequence";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <ScrollSequence />

      <section className="relative flex flex-col items-center justify-center min-h-screen bg-[#1a1412] px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-light tracking-[0.2em] text-white mb-6">AURA</h2>
          <h3 className="text-2xl md:text-3xl font-light text-zinc-300 mb-10">Discover the Essence</h3>
          
          <div className="h-[1px] w-24 bg-zinc-600 mb-10"></div>
          
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-16 max-w-2xl">
            A masterful blend of rare woods, exotic spices, and delicate floral notes. 
            AURA is more than a fragrance—it is an unforgettable cinematic experience 
            that captures the profound mystery and elegant warmth of twilight.
          </p>
          
          <button className="px-12 py-5 bg-white text-black text-sm uppercase tracking-[0.2em] font-medium hover:bg-zinc-200 transition-colors duration-300 rounded-sm">
            Explore fragrance
          </button>
        </div>
      </section>
    </main>
  );
}
