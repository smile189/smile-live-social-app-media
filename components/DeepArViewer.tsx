"use client";

import { useEffect, useRef } from "react";
import * as deepar from "deepar";

export default function DeepArViewer() {
  // Am adăugat tipizarea HTMLCanvasElement pentru claritate
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Folosim o variabilă locală pentru a urmări dacă componenta este încă montată
    let isMounted = true;
    let deepARInstance: deepar.DeepAR | null = null;

    async function initDeepAR() {
      if (!canvasRef.current) return;

      try {
        const instance = await deepar.initialize({
          licenseKey: process.env.NEXT_PUBLIC_DEEPAR_LICENSE_KEY || "",
          canvas: canvasRef.current,
          // rootPath: "https://jsdelivr.net" // Opțional, dacă ai probleme cu WASM
        });
        
        // Dacă componenta s-a demontat până s-a inițializat, o oprim imediat
        if (!isMounted) {
          instance.shutdown();
          return;
        }

        deepARInstance = instance;
        console.log("DeepAR s-a inițializat cu succes!");

      } catch (error) {
        console.error("Eroare la inițializarea DeepAR:", error);
      }
    }

    initDeepAR();

    // Curățarea memoriei la demontarea componentei
    return () => {
      isMounted = false;
      if (deepARInstance) {
        (deepARInstance as any).shutdown();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-white text-xl mb-4 font-bold">DeepAR Preview</h1>
      <div className="relative w-full max-w-[640px] aspect-video rounded-lg overflow-hidden shadow-2xl">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
