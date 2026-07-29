"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 400;

const chapters = [
  {
    leftHeading: "AWAKEN\nTHE SENSES",
    leftSub: "A cinematic expression of warmth mystery and timeless elegance",
    rightDetails: ["DARKNESS", "SMOKE", "FIRST LIGHT"]
  },
  {
    leftHeading: "A CLOSER\nDESIRE",
    rightDetails: ["GLASS", "GOLD", "AMBER"]
  },
  {
    leftHeading: "BLOOM\nIN MOTION",
    rightDetails: ["ROSE", "MIST", "LIQUID LIGHT"]
  },
  {
    leftHeading: "THE\nREVEAL",
    rightDetails: ["WARMTH", "DEPTH", "ELEGANCE"]
  },
  {
    leftHeading: "AURA",
    leftSub: "DISCOVER THE ESSENCE",
    showButton: true
  }
];

export default function ScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const currentChapterRef = useRef(-1);
  const renderRequestIdRef = useRef<number | null>(null);
  const hasStartedLoading = useRef(false);

  function renderFrame(frameIndex: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    let targetImg = img;
    let searchIndex = frameIndex;
    while (!targetImg && searchIndex > 0) {
      searchIndex--;
      targetImg = imagesRef.current[searchIndex];
    }

    if (!targetImg) {
      searchIndex = frameIndex;
      while (!targetImg && searchIndex < FRAME_COUNT - 1) {
        searchIndex++;
        targetImg = imagesRef.current[searchIndex];
      }
    }

    if (!targetImg) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalWidth = canvasWidth / dpr;

    let isDesktop = false;
    let isTablet = false;

    if (logicalWidth > 1024) isDesktop = true;
    else if (logicalWidth > 768) isTablet = true;

    if (isDesktop || isTablet) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw sharp main frame
      ctx.save();
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;

      const targetVw = isDesktop ? 46 : 55;
      let targetLogicalWidth = (logicalWidth * targetVw) / 100;
      if (isDesktop) {
        targetLogicalWidth = Math.min(targetLogicalWidth, 700);
      }

      const maxTargetWidth = targetLogicalWidth * dpr;

      let containScale = maxTargetWidth / targetImg.width;
      if (targetImg.height * containScale > canvasHeight) {
        containScale = canvasHeight / targetImg.height;
      }

      const drawWidth = targetImg.width * containScale;
      const drawHeight = targetImg.height * containScale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      ctx.drawImage(targetImg, offsetX, offsetY, drawWidth, drawHeight);

      // Soft black gradient mask over left and right edges
      const blendWidth = 60 * dpr;

      // Left edge gradient
      const gradLeft = ctx.createLinearGradient(offsetX, 0, offsetX + blendWidth, 0);
      gradLeft.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(offsetX - 2, offsetY, blendWidth + 2, drawHeight);

      // Right edge gradient
      const gradRight = ctx.createLinearGradient(offsetX + drawWidth, 0, offsetX + drawWidth - blendWidth, 0);
      gradRight.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradRight;
      ctx.fillRect(offsetX + drawWidth - blendWidth, offsetY, blendWidth + 2, drawHeight);

      ctx.restore();
    } else {
      // Mobile - cover behavior to fill screen naturally
      const canvasRatio = canvasWidth / canvasHeight;
      const imgRatio = targetImg.width / targetImg.height;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      ctx.drawImage(targetImg, offsetX, offsetY, drawWidth, drawHeight);
      
      // Gradient at bottom for text legibility on mobile
      const gradBottom = ctx.createLinearGradient(0, canvasHeight - 250 * dpr, 0, canvasHeight);
      gradBottom.addColorStop(0, 'rgba(0,0,0,0)');
      gradBottom.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, canvasHeight - 250 * dpr, canvasWidth, 250 * dpr);
    }
  }

  function handleResize() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    renderFrame(currentFrameRef.current);
  }

  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    let loadedCount = 0;
    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = images;

    const loadPromises = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(4, "0");
      img.src = `/frames/frame_${paddedIndex}.jpg`;

      const promise = new Promise<void>((resolve) => {
        img.onload = () => {
          images[i - 1] = img;
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));

          if (loadedCount > 40 && isLoading) {
            setIsLoading(false);
          }

          if (i === 1) {
            renderFrame(0);
          }
          resolve();
        };
        img.onerror = () => {
          images[i - 1] = null;
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));

          if (loadedCount > 40 && isLoading) {
            setIsLoading(false);
          }
          resolve();
        };
      });

      loadPromises.push(promise);
    }

    Promise.all(loadPromises).then(() => {
      setIsLoading(false);
    });
  }, [isLoading]);

  useEffect(() => {
    if (!containerRef.current) return;

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Initialize first chapter text
    gsap.set(`.chapter-0`, { autoAlpha: 1, y: 0 });
    currentChapterRef.current = 0;
    const firstProg = document.querySelector('.prog-0');
    if (firstProg) {
      firstProg.classList.remove('text-zinc-700');
      firstProg.classList.add('text-white');
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    const proxy = { frame: 0 };

    tl.to(proxy, {
      frame: FRAME_COUNT - 1,
      snap: "frame",
      ease: "none",
      onUpdate: () => {
        const nextFrame = Math.round(proxy.frame);
        if (currentFrameRef.current !== nextFrame) {
          currentFrameRef.current = nextFrame;
          if (renderRequestIdRef.current) {
            cancelAnimationFrame(renderRequestIdRef.current);
          }
          renderRequestIdRef.current = requestAnimationFrame(() => {
            renderFrame(currentFrameRef.current);
          });
        }
        
        // Handle chapter fading based on scroll
        const chapter = Math.min(4, Math.floor(nextFrame / 80));
        if (chapter !== currentChapterRef.current) {
          const oldChapter = currentChapterRef.current;
          currentChapterRef.current = chapter;
          
          if (oldChapter >= 0) {
            gsap.to(`.chapter-${oldChapter}`, { autoAlpha: 0, y: -15, duration: 0.4, overwrite: true });
          }
          gsap.fromTo(`.chapter-${chapter}`, 
            { autoAlpha: 0, y: 15 }, 
            { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.1, overwrite: true }
          );
          
          document.querySelectorAll('.prog-indicator').forEach((el, idx) => {
            if (idx === chapter) {
              el.classList.remove('text-zinc-700');
              el.classList.add('text-white');
            } else {
              el.classList.remove('text-white');
              el.classList.add('text-zinc-700');
            }
          });
        }
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (renderRequestIdRef.current) {
        cancelAnimationFrame(renderRequestIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="relative h-[950vh] w-full bg-black text-white">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-500">
          <p className="mb-4 text-sm md:text-base uppercase tracking-widest text-zinc-400">Preparing the experience</p>
          <p className="text-3xl md:text-4xl font-light">{loadingProgress}%</p>
        </div>
      )}

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-12 z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start uppercase tracking-widest text-xs">
            <h1 className="font-medium tracking-[0.2em] drop-shadow-md">AURA</h1>
            <p className="drop-shadow-md">EAU DE PARFUM</p>
          </div>

          {/* Middle Layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center">
            
            {/* Left Side */}
            <div className="col-span-1 flex flex-col justify-center mt-auto mb-12 md:mt-0 md:mb-0">
               <span className="hidden md:block text-[10px] tracking-widest text-zinc-500 mb-8 uppercase">AURA PARFUMS</span>
               <div className="relative h-32 md:h-48 w-full">
                 {chapters.map((chap, i) => (
                   <div key={`left-${i}`} className={`chapter-${i} absolute top-0 left-0 opacity-0 invisible`}>
                     <h2 className="text-3xl md:text-5xl font-light whitespace-pre-line leading-tight drop-shadow-md">
                       {chap.leftHeading}
                     </h2>
                     {chap.leftSub && (
                       <p className="mt-4 text-xs tracking-widest text-zinc-400 max-w-[240px] uppercase leading-relaxed drop-shadow-md">
                         {chap.leftSub}
                       </p>
                     )}
                   </div>
                 ))}
               </div>
            </div>

            {/* Center Canvas Space */}
            <div className="col-span-2"></div>

            {/* Right Side */}
            <div className="hidden md:flex col-span-1 flex-col items-end text-right justify-center">
               <span className="text-[10px] tracking-widest text-zinc-500 mb-8 uppercase">SIGNATURE 01</span>
               <div className="relative h-32 md:h-48 w-full">
                 {chapters.map((chap, i) => (
                   <div key={`right-${i}`} className={`chapter-${i} absolute top-0 right-0 opacity-0 invisible flex flex-col items-end gap-3`}>
                     {chap.rightDetails && chap.rightDetails.map((detail, idx) => (
                       <span key={idx} className="text-xs tracking-[0.2em] text-zinc-300 uppercase drop-shadow-md">{detail}</span>
                     ))}
                     {chap.showButton && (
                       <button className="pointer-events-auto mt-4 px-8 py-4 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-zinc-200 transition-colors">
                         EXPLORE THE FRAGRANCE
                       </button>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="hidden md:flex absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex-col gap-6 text-[10px] tracking-widest z-20">
          {[1,2,3,4,5].map(num => (
            <span key={num} className={`prog-indicator prog-${num-1} transition-colors duration-500 text-zinc-700`}>
              0{num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
