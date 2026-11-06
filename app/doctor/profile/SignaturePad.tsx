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
    setData(ref.current!.toDataURL("image/png"));
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
