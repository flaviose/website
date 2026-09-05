"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Pos = { ts: string; lat: number; lng: number; speed_kmh: number | null };

const DEVICE = "bike-1";
const FALLBACK: [number, number] = [47.3769, 8.5417]; // Zürich, until real data arrives

export default function MapCanvas() {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval>;

    (async () => {
      const L = (await import("leaflet")).default; // client-only import → no SSR crash
      if (cancelled || !elRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(elRef.current).setView(FALLBACK, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);

      await draw();
      timer = setInterval(draw, 15000);
    })();

    async function draw() {
      const L = LRef.current, map = mapRef.current, layer = layerRef.current;
      if (!L || !map || !layer) return;

      let points: Pos[] = [];
      try {
        const r = await fetch(`/api/positions?device=${DEVICE}`, { cache: "no-store" });
        if (r.ok) points = await r.json();
      } catch {}

      layer.clearLayers();
      if (!points.length) return;

      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);

      // the route so far
      L.polyline(latlngs, { color: "#2593a0", weight: 3 }).addTo(layer);
      latlngs.slice(0, -1).forEach((ll) =>
        L.circleMarker(ll, { radius: 3, color: "#2593a0", fillOpacity: 1 }).addTo(layer)
      );

      // last known position — CSS dot, so no missing-marker-image issues
      const last = points[points.length - 1];
      const dot = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#dd6b3f;border:3px solid #fff;box-shadow:0 0 0 2px #dd6b3f"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([last.lat, last.lng], { icon: dot })
        .bindPopup(
          `Last seen ${new Date(last.ts).toLocaleString()}` +
            (last.speed_kmh != null ? `<br>${last.speed_kmh.toFixed(1)} km/h` : "")
        )
        .addTo(layer);

      map.fitBounds(latlngs, { padding: [40, 40], maxZoom: 16 });
    }

    return () => {
      cancelled = true;
      clearInterval(timer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={elRef} style={{ height: "70vh", width: "100%", borderRadius: 12 }} />;
}
