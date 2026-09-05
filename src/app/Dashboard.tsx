"use client";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
);

const TEMP = "#dd6b3f";
const HUM = "#2593a0";

type Reading = { ts: string; station: string; temp_c: number; humidity: number };
type Station = { station: string; ts: string; temp_c: number; humidity: number };

const RANGES: { label: string; hours: number }[] = [
  { label: "6H", hours: 6 },
  { label: "24H", hours: 24 },
  { label: "7D", hours: 24 * 7 },
  { label: "30D", hours: 24 * 30 },
];

export default function Dashboard({ userName }: { userName: string }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [station, setStation] = useState<string>("");
  const [hours, setHours] = useState<number>(24);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  // Load station list (and pick the first) once.
  useEffect(() => {
    fetch("/api/stations", { cache: "no-store" })
      .then((r) => r.json())
      .then((s: Station[]) => {
        setStations(s);
        if (s.length) setStation((cur) => cur || s[0].station);
      })
      .catch(() => {});
  }, []);

  // Load readings whenever station or range changes, then poll every 15s.
  useEffect(() => {
    if (!station) return;
    let alive = true;
    const load = () => {
      fetch(`/api/readings?station=${encodeURIComponent(station)}&hours=${hours}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d: Reading[]) => {
          if (alive) {
            setReadings(d);
            setLoading(false);
          }
        })
        .catch(() => alive && setLoading(false));
    };
    setLoading(true);
    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [station, hours]);

  //const latest = stations.find((s) => s.station === station);
   const latest = readings.length ? readings[readings.length - 1] : undefined;
  const data = useMemo(
    () => ({
      datasets: [
        {
          label: "Temperature",
          data: readings.map((r) => ({ x: new Date(r.ts).getTime(), y: r.temp_c })),
          borderColor: TEMP,
          backgroundColor: "rgba(221,107,63,0.08)",
          yAxisID: "yTemp",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          fill: true,
        },
        {
          label: "Humidity",
          data: readings.map((r) => ({ x: new Date(r.ts).getTime(), y: r.humidity })),
          borderColor: HUM,
          backgroundColor: "rgba(37,147,160,0.06)",
          yAxisID: "yHum",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          fill: false,
        },
      ],
    }),
    [readings]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      scales: {
        x: {
          type: "time" as const,
          grid: { color: "#eef2f1" },
          ticks: { color: "#5e6e79", maxRotation: 0, autoSkipPadding: 20 },
        },
        yTemp: {
          type: "linear" as const,
          position: "left" as const,
          grid: { color: "#eef2f1" },
          ticks: { color: TEMP, callback: (v: any) => `${v}°` },
          title: { display: true, text: "°C", color: TEMP },
        },
        yHum: {
          type: "linear" as const,
          position: "right" as const,
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: HUM, callback: (v: any) => `${v}%` },
          title: { display: true, text: "%RH", color: HUM },
        },
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { usePointStyle: true, color: "#14212b", boxWidth: 8 },
        },
        tooltip: { mode: "index" as const, intersect: false },
      },
    }),
    []
  );

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="mark" aria-hidden />
          <span className="wordmark">NODOLAB</span>
        </div>
        <div className="who">
          <Link href="/map" className="link-btn">Bike tracker</Link>
          <Link href="/camera" className="link-btn">Camera</Link>
          <span>Signed in as {userName}</span>
          <form action="/api/logout" method="post">
            <button className="link-btn" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="shell">
        <div className="controls">
          <span className="eyebrow">Field Telemetry</span>
          <select
            className="select"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            aria-label="Station"
          >
            {stations.length === 0 && <option>No stations yet</option>}
            {stations.map((s) => (
              <option key={s.station} value={s.station}>
                {s.station}
              </option>
            ))}
          </select>
          <div className="range" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.hours}
                aria-pressed={hours === r.hours}
                onClick={() => setHours(r.hours)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <section className="readouts">
          <div className="readout temp">
            <div className="label">Temperature · now</div>
            <div className="value mono">
              {latest ? latest.temp_c.toFixed(1) : "—"}
              <span className="unit">°C</span>
            </div>
          </div>
          <div className="readout hum">
            <div className="label">Humidity · now</div>
            <div className="value mono">
              {latest ? latest.humidity.toFixed(0) : "—"}
              <span className="unit">%RH</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{station || "—"} · last {RANGES.find((r) => r.hours === hours)?.label}</h2>
          <div className="chart-box">
            {loading ? (
              <p className="empty">Loading…</p>
            ) : readings.length === 0 ? (
              <p className="empty">No readings in this window.</p>
            ) : (
              <Line data={data} options={options} />
            )}
          </div>
          {latest && (
            <p className="updated mono">
              Last reading {new Date(latest.ts).toLocaleString()}
            </p>
          )}
        </section>
      </main>
    </>
  );
}
