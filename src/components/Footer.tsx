export default function Footer() {
  return (
    <footer className="app-footer">
      <p className="app-footer-note">
        Note: Map coordinates may be inaccurate. Click the restaurant name to view Google Maps.
      </p>
      <p className="app-footer-credit">
        Creator:{" "}
        <a href="https://pcwu2022.github.io/" target="_blank" rel="noopener noreferrer">
          Po-Chun Wu
        </a>{" "}
        (
        <a href="https://pcwu2022.github.io" target="_blank" rel="noopener noreferrer">
          https://pcwu2022.github.io
        </a>
        )
      </p>
    </footer>
  );
}
