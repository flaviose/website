"use client";

import Link from "next/link";   
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "70vh", display: "grid", placeItems: "center" }}>
      Loading map…
    </div>
  ),
});

export default function BikeMap({ userName }: { userName: string }) {
  return (
    <main style={{ padding: 24 }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 8 }}>
        ← Dashboard
      </Link>
      <h1 style={{ marginBottom: 12 }}>Bike tracker</h1>
      <MapCanvas />
    </main>
  );
}