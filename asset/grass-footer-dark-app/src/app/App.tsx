import { useEffect, useState } from "react";
import GrassFooterDark from "../imports/GrassFooterDark-1/GrassFooterDark-12-1850";

const SPRING_TENSION = 0.08;
const SPRING_DAMPING = 0.78;

export default function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHostActive, setIsHostActive] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || !isVisible || !isHostActive) {
      document.documentElement.style.setProperty("--mouse-x", "0");
      document.documentElement.style.setProperty("--mouse-y", "0");
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let rafId = 0;
    let pendingFrame = false;

    const root = document.documentElement;

    const tick = () => {
      pendingFrame = false;
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      velocityX = (velocityX + dx * SPRING_TENSION) * SPRING_DAMPING;
      velocityY = (velocityY + dy * SPRING_TENSION) * SPRING_DAMPING;
      currentX += velocityX;
      currentY += velocityY;

      root.style.setProperty("--mouse-x", currentX.toFixed(4));
      root.style.setProperty("--mouse-y", currentY.toFixed(4));

      if (
        Math.abs(velocityX) > 0.0005 ||
        Math.abs(velocityY) > 0.0005 ||
        Math.abs(dx) > 0.0005 ||
        Math.abs(dy) > 0.0005
      ) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      if (pendingFrame) return;
      pendingFrame = true;
      rafId = requestAnimationFrame(tick);
    };

    const handlePointerMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "footer-pointer") {
        targetX = Number(data.x) || 0;
        targetY = Number(data.y) || 0;
        schedule();
      }

      if (data.type === "footer-pointer-leave") {
        targetX = 0;
        targetY = 0;
        schedule();
      }

      if (data.type === "footer-scene-state") {
        setIsHostActive(Boolean(data.active));
      }
    };

    window.addEventListener("message", handlePointerMessage);
    return () => {
      window.removeEventListener("message", handlePointerMessage);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHostActive, isVisible, reducedMotion]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-transparent"
      data-paused={!isVisible || reducedMotion || !isHostActive ? "true" : "false"}
    >
      <style>{`
        @keyframes windFlow {
          0% { transform: skewX(0deg) rotate(0deg); }
          50% { transform: skewX(8deg) rotate(2deg); }
          100% { transform: skewX(0deg) rotate(0deg); }
        }

        *, *::before, *::after {
          cursor: none !important;
        }

        [data-name="grass-footer-dark"] > div:not([data-name="robot+grass"]):not(:nth-last-child(1)):not(:nth-last-child(2)),
        [data-name="robot+grass"] > div:not([data-name="robot"]),
        [data-name="robot"] > div {
          transform-origin: bottom center;
          animation: windFlow 2.5s ease-in-out infinite;
          will-change: transform;
        }

        [data-paused="true"] [data-name="grass-footer-dark"] *,
        [data-paused="true"] [data-name="robot+grass"] *,
        [data-paused="true"] [data-name="robot"] {
          animation-play-state: paused !important;
        }

        [data-name="grass-footer-dark"] > div:nth-child(even):not(:nth-last-child(1)):not(:nth-last-child(2)) { animation-delay: 0.1s; animation-duration: 2.7s; }
        [data-name="grass-footer-dark"] > div:nth-child(3n):not(:nth-last-child(1)):not(:nth-last-child(2)) { animation-delay: 0.4s; animation-duration: 2.2s; }
        [data-name="grass-footer-dark"] > div:nth-child(5n):not(:nth-last-child(1)):not(:nth-last-child(2)) { animation-delay: 0.2s; }
        [data-name="grass-footer-dark"] > div:nth-child(7n):not(:nth-last-child(1)):not(:nth-last-child(2)) { animation-delay: 0.7s; }
        [data-name="robot+grass"] > div:nth-child(even):not([data-name="robot"]) { animation-delay: 0.5s; animation-duration: 3s; }
        [data-name="robot+grass"] > div:nth-child(odd):not([data-name="robot"]) { animation-delay: 0.3s; }
        [data-name="robot"] > div:nth-child(even) { animation-delay: 0.6s; animation-duration: 2.8s; }
        [data-name="robot"] > div:nth-child(odd) { animation-delay: 0.2s; }

        [data-name="robot"] > img,
        [data-name="grass-footer-dark"] > div:nth-last-child(1),
        [data-name="grass-footer-dark"] > div:nth-last-child(2) {
          will-change: transform;
          transform: translate3d(
            calc((var(--mouse-y, 0) - var(--mouse-x, 0)) * 6px),
            calc((var(--mouse-x, 0) - var(--mouse-y, 0)) * 3px),
            0
          );
        }

        .grass-scene-center {
          display: grid;
          place-items: center;
        }

        .grass-scene-artboard {
          --grass-artboard-scale: 1;
          width: 1440px;
          height: 100%;
          max-width: none;
          transform: scale(var(--grass-artboard-scale));
          transform-origin: center top;
          will-change: transform;
        }

        @media (min-width: 1600px) {
          .grass-scene-artboard { --grass-artboard-scale: 1.12; }
        }

        @media (min-width: 1900px) {
          .grass-scene-artboard { --grass-artboard-scale: 1.24; }
        }

        @media (min-width: 2200px) {
          .grass-scene-artboard { --grass-artboard-scale: 1.36; }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-name="grass-footer-dark"] *,
          [data-name="robot+grass"] *,
          [data-name="robot"] {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="relative w-full h-full grass-scene-center">
        <div className="relative grass-scene-artboard">
          <GrassFooterDark />
        </div>
      </div>
    </div>
  );
}
