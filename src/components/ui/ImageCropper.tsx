import React, { useCallback, useEffect, useRef, useState } from "react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeHandle = "tl" | "tr" | "bl" | "br";

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedBlob: Blob, croppedUrl: string) => void;
  onCancel: () => void;
  /**
   * width / height ratio — default 1 (square)
   * Examples: 1 → 1:1 | 16/9 → 16:9 | 4/3 → 4:3 | 3/2 → 3:2
   */
  aspectRatio?: number;
}

const CANVAS_SIZE = 400;
const HANDLE_RADIUS = 14;
const MIN_SIZE = 40;

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropDone,
  onCancel,
  aspectRatio = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState("crosshair");

  // Crop box state (canvas coords)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 40, y: 40, width: 240, height: 240 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.1);
  const [maxZoom, setMaxZoom] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Single interaction ref — avoids stale closures
  const ia = useRef<{
    type: "none" | "move" | "pan" | "resize";
    handle: ResizeHandle | null;
    startMx: number;
    startMy: number;
    startCrop: CropArea;
    startOffset: { x: number; y: number };
  }>({ type: "none", handle: null, startMx: 0, startMy: 0, startCrop: { x: 0, y: 0, width: 0, height: 0 }, startOffset: { x: 0, y: 0 } });

  // Keep latest values for wheel handler (avoids stale closure)
  const cropRef = useRef(cropArea);
  const offsetRef = useRef(offset);
  const zoomRef = useRef(zoom);
  useEffect(() => { cropRef.current = cropArea; }, [cropArea]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Trigger entrance animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = (cb: () => void) => {
    setVisible(false);
    setTimeout(cb, 220);
  };

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      setZoom(scale);
      setMinZoom(scale);
      setMaxZoom(scale * 4);
      setOffset({
        x: (CANVAS_SIZE - img.width * scale) / 2,
        y: (CANVAS_SIZE - img.height * scale) / 2,
      });
      // Initial crop: 75% of canvas, locked to aspectRatio
      const initW = aspectRatio >= 1
        ? Math.floor(CANVAS_SIZE * 0.75)
        : Math.floor(CANVAS_SIZE * 0.75 * aspectRatio);
      const initH = Math.floor(initW / aspectRatio);
      setCropArea({
        x: Math.floor((CANVAS_SIZE - initW) / 2),
        y: Math.floor((CANVAS_SIZE - initH) / 2),
        width: initW,
        height: initH,
      });
      setLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // Draw everything
  useEffect(() => {
    if (!loaded || !imageRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imageRef.current;
    const { x, y, width, height } = cropArea;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(img, offset.x, offset.y, img.width * zoom, img.height * zoom);

    // Dark overlay — evenodd clips out the crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.rect(x, y, width, height);
    ctx.clip("evenodd");
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)"; // Sleeker, more aesthetic slate overlay
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    // Redraw image inside crop area (bright, undarked)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.drawImage(img, offset.x, offset.y, img.width * zoom, img.height * zoom);
    ctx.restore();

    // Crop box border
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 6;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Grid lines (rule of thirds)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.75;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (width / 3) * i, y);
      ctx.lineTo(x + (width / 3) * i, y + height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + (height / 3) * i);
      ctx.lineTo(x + width, y + (height / 3) * i);
      ctx.stroke();
    }

    // Corner handles (aesthetic, thicker white handles)
    const hLen = 14;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const corners: [number, number, number, number][] = [
      [x, y, 1, 1],
      [x + width, y, -1, 1],
      [x, y + height, 1, -1],
      [x + width, y + height, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * hLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * hLen);
      ctx.stroke();
    }
    ctx.restore();
  }, [loaded, cropArea, zoom, offset]);

  const getCanvasPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const getResizeHandle = (x: number, y: number, crop: CropArea): ResizeHandle | null => {
    const { x: cx, y: cy, width, height } = crop;
    if (Math.abs(x - cx) <= HANDLE_RADIUS && Math.abs(y - cy) <= HANDLE_RADIUS) return "tl";
    if (Math.abs(x - (cx + width)) <= HANDLE_RADIUS && Math.abs(y - cy) <= HANDLE_RADIUS) return "tr";
    if (Math.abs(x - cx) <= HANDLE_RADIUS && Math.abs(y - (cy + height)) <= HANDLE_RADIUS) return "bl";
    if (Math.abs(x - (cx + width)) <= HANDLE_RADIUS && Math.abs(y - (cy + height)) <= HANDLE_RADIUS) return "br";
    return null;
  };

  const isInsideCropBox = (x: number, y: number, crop: CropArea) =>
    x >= crop.x && x <= crop.x + crop.width &&
    y >= crop.y && y <= crop.y + crop.height;

  const cursorForHandle: Record<ResizeHandle, string> = {
    tl: "nwse-resize", br: "nwse-resize",
    tr: "nesw-resize", bl: "nesw-resize",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);
    const handle = getResizeHandle(x, y, cropArea);
    if (handle) {
      ia.current = { type: "resize", handle, startMx: x, startMy: y, startCrop: { ...cropArea }, startOffset: { ...offset } };
    } else if (isInsideCropBox(x, y, cropArea)) {
      ia.current = { type: "move", handle: null, startMx: x, startMy: y, startCrop: { ...cropArea }, startOffset: { ...offset } };
    } else {
      ia.current = { type: "pan", handle: null, startMx: x, startMy: y, startCrop: { ...cropArea }, startOffset: { ...offset } };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);
    const current = ia.current;

    if (current.type === "none") {
      const handle = getResizeHandle(x, y, cropArea);
      if (handle) setCursor(cursorForHandle[handle]);
      else if (isInsideCropBox(x, y, cropArea)) setCursor("move");
      else setCursor("default");
      return;
    }

    const dx = x - current.startMx;
    const dy = y - current.startMy;
    const sc = current.startCrop;

    if (current.type === "move") {
      let nx = sc.x + dx;
      let ny = sc.y + dy;
      nx = Math.max(0, Math.min(CANVAS_SIZE - sc.width, nx));
      ny = Math.max(0, Math.min(CANVAS_SIZE - sc.height, ny));
      setCropArea((prev) => ({ ...prev, x: nx, y: ny }));

    } else if (current.type === "pan") {
      setOffset({ x: current.startOffset.x + dx, y: current.startOffset.y + dy });

    } else if (current.type === "resize" && current.handle) {
      const diagonals: Record<ResizeHandle, [number, number]> = {
        br: [1, 1], tr: [1, -1], bl: [-1, 1], tl: [-1, -1],
      };
      const [dAxis1, dAxis2] = diagonals[current.handle];
      const projection = (dx * dAxis1 + dy * dAxis2) / Math.SQRT2;
      let newW = Math.max(MIN_SIZE, sc.width + projection);
      let newH = newW / aspectRatio;

      let newX = sc.x;
      let newY = sc.y;
      if (current.handle === "tl") { newX = sc.x + sc.width - newW; newY = sc.y + sc.height - newH; }
      else if (current.handle === "tr") { newX = sc.x; newY = sc.y + sc.height - newH; }
      else if (current.handle === "bl") { newX = sc.x + sc.width - newW; newY = sc.y; }

      if (newX < 0) { newW += newX; newH = newW / aspectRatio; newX = 0; }
      if (newY < 0) { newH += newY; newW = newH * aspectRatio; newY = 0; }
      if (newX + newW > CANVAS_SIZE) { newW = CANVAS_SIZE - newX; newH = newW / aspectRatio; }
      if (newY + newH > CANVAS_SIZE) { newH = CANVAS_SIZE - newY; newW = newH * aspectRatio; }

      if (newW >= MIN_SIZE && newH >= MIN_SIZE) {
        setCropArea({ x: newX, y: newY, width: newW, height: newH });
      }
    }
  };

  const handleMouseUp = () => {
    ia.current = { ...ia.current, type: "none" };
  };

  // Scroll wheel zoom — zoom toward canvas center
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const prevZoom = zoomRef.current;
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    const newZoom = Math.min(5, Math.max(minZoom, prevZoom + delta));
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const prev = offsetRef.current;
    const ratio = newZoom / prevZoom;
    setOffset({
      x: cx - (cx - prev.x) * ratio,
      y: cy - (cy - prev.y) * ratio,
    });
    setZoom(newZoom);
  }, [minZoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel, loaded]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    const prevZoom = zoom;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const prev = offset;
    const ratio = newZoom / prevZoom;
    setOffset({
      x: cx - (cx - prev.x) * ratio,
      y: cy - (cy - prev.y) * ratio,
    });
    setZoom(newZoom);
  };

  const handleCropDone = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const { x, y, width, height } = cropArea;
    const srcX = (x - offset.x) / zoom;
    const srcY = (y - offset.y) / zoom;
    const srcW = width / zoom;
    const srcH = height / zoom;
    const outW = 512;
    const outH = Math.round(outW / aspectRatio);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        handleClose(() => onCropDone(blob, url));
      }
    }, "image/jpeg", 0.92);
  };

  const ratioLabel = (() => {
    if (aspectRatio === 1) return "1:1";
    if (Math.abs(aspectRatio - 16 / 9) < 0.01) return "16:9";
    if (Math.abs(aspectRatio - 4 / 3) < 0.01) return "4:3";
    if (Math.abs(aspectRatio - 3 / 2) < 0.01) return "3:2";
    return `${aspectRatio.toFixed(2)}:1`;
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="bg-white dark:bg-navy-card border border-slate-200/80 dark:border-navy-border rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col transition-all duration-300 max-w-full"
        style={{
          width: 500,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-navy-border flex justify-between items-center bg-slate-50/45 dark:bg-navy-950/20">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12.24 10.285V17m0 0v-4.286M12.24 17h4.285m-4.285 0h-4.286M6.242 12.242a5 5 0 010-7.07l7.071 7.07m-7.07 0a5 5 0 007.07 7.072m0-7.07a5 5 0 017.07-7.07m-7.07 7.07a5 5 0 007.07 7.072M12.24 3v4.286m0 0H17m-4.76 0H8" />
              </svg>
              Crop Profile Picture
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Fine-tune details before saving</p>
          </div>
          
          <button
            onClick={() => handleClose(onCancel)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-navy-950 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-205 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Canvas Area - Dynamic blurred picture matching backdrop */}
        <div className="w-full flex justify-center py-6 border-b border-slate-100 dark:border-navy-border relative overflow-hidden group">
          {/* Outer Blurred Backdrop */}
          <div className="absolute inset-0 select-none pointer-events-none scale-110">
            <img
              src={imageSrc}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-30 dark:opacity-20"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-slate-50/70 dark:bg-navy-950/80" />
          </div>

          <div className="border border-slate-200/50 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl relative z-10 bg-slate-100/40 dark:bg-navy-950/40">
            {/* Inner Blurred Backdrop for empty canvas sidebars */}
            <div className="absolute inset-0 select-none pointer-events-none scale-105">
              <img
                src={imageSrc}
                alt=""
                className="w-full h-full object-cover blur-lg opacity-40 dark:opacity-25"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-slate-100/30 dark:bg-navy-950/50" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="relative z-10"
              style={{ display: "block", width: CANVAS_SIZE, height: CANVAS_SIZE, cursor }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 dark:bg-navy-950/20 border-b border-slate-100 dark:border-navy-border">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zoom</span>
          <button 
            type="button" 
            onClick={() => setZoom(prev => Math.max(minZoom, prev - 0.2))}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            onChange={handleSliderChange}
            className="flex-1 accent-accent-600 cursor-ew-resize h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
          />

          <button 
            type="button" 
            onClick={() => setZoom(prev => Math.min(maxZoom, prev + 0.2))}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 transition-colors p-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="flex justify-center items-center gap-4 py-3 px-6 bg-slate-50/30 dark:bg-navy-950/10 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-navy-border">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-accent-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11M5 11a9 9 0 019-9v1c0 2.503-1.066 4.777-2.793 6.386M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Scroll or slide to Zoom
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-accent-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Drag corners to scale ({ratioLabel})
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 py-4 px-6 bg-slate-50/45 dark:bg-navy-950/20 justify-end">
          <button
            onClick={() => handleClose(onCancel)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 bg-slate-100/50 hover:bg-slate-150/70 dark:bg-navy-950 dark:hover:bg-navy-900 border border-slate-200/60 dark:border-navy-border transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCropDone}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-md shadow-accent-500/10 hover:shadow-accent-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
