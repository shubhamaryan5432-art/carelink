"use client";
import { useRef, useState } from "react";

type P = React.PointerEvent<HTMLCanvasElement>;

export default function SignaturePad({ existing }: { existing: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [data, setData] = useState("");

  const pos = (e: P) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * e.currentTarget.width) / r.width,
      y: ((e.clientY - r.top) * e.currentTarget.height) / r.height,
    };
  };
  const down = (e: P) => {
    drawing.current = true;
    const c = ref.current!.getContext("2d")!;
    const p = pos(e);
    c.beginPath();
    c.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: P) => {
    if (!drawing.current) return;
    const c = ref.current!.getContext("2d")!;
    const p = pos(e);
    c.lineWidth = 3;
    c.lineCap = "round";
    c.strokeStyle = "#111";
    c.lineTo(p.x, p.y);
    c.stroke();
  };
    const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const cv = ref.current!;
    const w = cv.width, h = cv.height;
    const px = cv.getContext("2d")!.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (px[(y * w + x) * 4 + 3] > 0) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < x0) return;
    const pad = 6;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    const out = document.createElement("canvas");
    out.width = x1 - x0 + 1;
    out.height = y1 - y0 + 1;
    out.getContext("2d")!.drawImage(cv, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    setData(out.toDataURL("image/png"));
  };
  const clear = () => {
    const cv = ref.current!;
    cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
    setData("");
  };

  return (
    <div>
      {existing && !data && (
        <div>
          <p>Current signature:</p>
          <img src={existing} alt="Current signature" style={{ maxWidth: 240, border: "1px solid #ddd" }} />
        </div>
      )}
      <p>Sign with your finger or a stylus{existing ? " (only if you want to replace it)" : ""}:</p>
      <canvas
        ref={ref}
        width={600}
        height={200}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{ width: "100%", maxWidth: 420, height: "auto", border: "1px solid #999", borderRadius: 8, touchAction: "none", background: "#fff" }}
      />
      <input type="hidden" name="signature" value={data} />
      <div><button type="button" onClick={clear}>Clear signature</button></div>
    </div>
  );
}
