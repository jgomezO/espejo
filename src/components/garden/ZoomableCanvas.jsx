import { useState, useRef, useEffect, useCallback } from "react";
import { useGesture } from "@use-gesture/react";

function getViewBox(origW, origH, zoom, pan) {
  const visibleW = origW / zoom;
  const visibleH = origH / zoom;
  const centerX = origW / 2 - pan.x;
  const centerY = origH / 2 - pan.y;
  let newX = centerX - visibleW / 2;
  let newY = centerY - visibleH / 2;

  const pad = 0.1;
  newX = Math.max(-origW * pad, Math.min(newX, origW - visibleW + origW * pad));
  newY = Math.max(-origH * pad, Math.min(newY, origH - visibleH + origH * pad));

  return `${newX} ${newY} ${visibleW} ${visibleH}`;
}

function ZoomControls({ zoom, minZoom, maxZoom, onZoomIn, onZoomOut, onReset, showReset }) {
  return (
    <div className="garden-zoom-controls">
      <button
        className="garden-zoom-btn"
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        aria-label="Acercar"
      >
        +
      </button>
      <div className="garden-zoom-divider" />
      <button
        className="garden-zoom-btn"
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        aria-label="Alejar"
      >
        −
      </button>
      {showReset && (
        <>
          <div className="garden-zoom-divider" />
          <button
            className="garden-zoom-btn"
            onClick={onReset}
            aria-label="Restablecer vista"
          >
            ⟲
          </button>
        </>
      )}
      <div className="garden-zoom-level">{zoom.toFixed(1)}x</div>
    </div>
  );
}

function GestureHint({ onDismiss }) {
  const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="garden-gesture-hint" onClick={onDismiss}>
      <span className="garden-gesture-icon">{isMobile ? "🤏" : "🖱️"}</span>
      <span className="garden-gesture-text">
        {isMobile
          ? "Pellizca para acercar, arrastra para explorar"
          : "Usa scroll para zoom, arrastra para mover"}
      </span>
    </div>
  );
}

export default function ZoomableCanvas({
  children,
  viewBox,
  minZoom = 1,
  maxZoom = 3,
  initialZoom = 1,
  onZoomChange,
  style,
}) {
  const [origX, origY, origW, origH] = viewBox.split(" ").map(Number);
  const [zoom, setZoom] = useState(initialZoom);
  const zoomRef = useRef(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(() => {
    try {
      return !localStorage.getItem("gardenZoomHintSeen");
    } catch {
      return false;
    }
  });
  const containerRef = useRef(null);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try { localStorage.setItem("gardenZoomHintSeen", "1"); } catch {}
  }, []);

  const clampZoom = (z) => Math.max(minZoom, Math.min(maxZoom, z));

  const applyZoom = useCallback((newZoom) => {
    zoomRef.current = newZoom;
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [onZoomChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ── Wheel (desktop zoom + trackpad pinch) ──
    let pointerInside = false;
    const onEnter = () => { pointerInside = true; };
    const onLeave = () => { pointerInside = false; };

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = clampZoom(zoomRef.current - e.deltaY * 0.003);
      zoomRef.current = next;
      setZoom(next);
      onZoomChange?.(next);
    };

    const blockPageZoom = (e) => {
      if (pointerInside && (e.ctrlKey || e.metaKey)) e.preventDefault();
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("wheel", blockPageZoom, { passive: false });

    // ── Touch drag + pinch (mobile) ──
    let lastTouches = null;

    const onTouchStart = (e) => {
      lastTouches = e.touches;
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const touches = e.touches;

      if (touches.length === 1 && lastTouches?.length === 1) {
        // Single finger drag → pan
        const dx = touches[0].clientX - lastTouches[0].clientX;
        const dy = touches[0].clientY - lastTouches[0].clientY;
        setPan((prev) => ({
          x: prev.x + dx / zoomRef.current,
          y: prev.y + dy / zoomRef.current,
        }));
      } else if (touches.length === 2 && lastTouches?.length === 2) {
        // Two fingers → pinch zoom
        const prevDist = Math.hypot(
          lastTouches[0].clientX - lastTouches[1].clientX,
          lastTouches[0].clientY - lastTouches[1].clientY
        );
        const newDist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        if (prevDist > 0) {
          const next = clampZoom(zoomRef.current * (newDist / prevDist));
          zoomRef.current = next;
          setZoom(next);
          onZoomChange?.(next);
        }
      }

      lastTouches = touches;
    };

    const onTouchEnd = () => { lastTouches = null; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      document.removeEventListener("wheel", blockPageZoom);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [minZoom, maxZoom, onZoomChange]);

  // useGesture only used for mouse drag on desktop now
  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        if (event.pointerType === "touch") return; // handled natively above
        setPan((prev) => ({
          x: prev.x + dx / zoomRef.current,
          y: prev.y + dy / zoomRef.current,
        }));
      },
    },
    {
      drag: { filterTaps: true },
    }
  );

  const isDefault = zoom === 1 && pan.x === 0 && pan.y === 0;
  const dynamicViewBox = getViewBox(origW, origH, zoom, pan);

  return (
    <div
      ref={containerRef}
      {...bind()}
      style={{
        touchAction: "none",
        overflow: "hidden",
        borderRadius: 16,
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: zoom > 1 ? "grab" : "default",
        ...style,
      }}
    >
      <svg
        viewBox={dynamicViewBox}
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label="Jardín interior isométrico"
      >
        {children}
      </svg>

      <ZoomControls
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onZoomIn={() => applyZoom(clampZoom(zoom + 0.3))}
        onZoomOut={() => applyZoom(clampZoom(zoom - 0.3))}
        onReset={() => { applyZoom(1); setPan({ x: 0, y: 0 }); }}
        showReset={!isDefault}
      />

      {showHint && <GestureHint onDismiss={dismissHint} />}
    </div>
  );
}
