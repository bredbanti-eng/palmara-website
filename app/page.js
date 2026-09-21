import PalmUploader from '../components/PalmUploader';

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1>Palmara</h1>
        <p>
          Upload a clear photo of your open palm. We read your hand&apos;s shape
          right there in your browser — your photo never leaves your device —
          and write you a personalized reading.
        </p>
      </header>

      <PalmUploader />

      <footer className="honesty">
        <p>
          <strong>Being upfront:</strong> Palmara classifies your hand into one
          of four traditional palmistry shapes from real, measured
          proportions, then uses that to write reflective, personalized-
          feeling text. It&apos;s a traditional practice turned into a fun,
          thoughtful moment — not scientifically validated fortune telling.
        </p>
      </footer>
    </main>
  );
}
