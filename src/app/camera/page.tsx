export default function CameraPage() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>Live Camera</h1>
      <iframe
        src="https://cam.nodolab.app/live/cam"
        allow="autoplay"
        style={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 12, background: "#000" }}
      />
    </main>
  );
}
