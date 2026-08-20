export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-header-mark">CMU</span>
        <h1>CMU Food</h1>
      </div>
      <div className="app-header-links">
        <a
          className="btn btn--outline btn--small"
          href="https://docs.google.com/spreadsheets/d/1n-hqQO6TSDbK_mBBMKzMwUxBYnE6zElA46_3x6psPAM/edit?gid=0#gid=0"
          target="_blank"
          rel="noopener noreferrer"
        >
          📝 Add Restaurants
        </a>
        <a
          className="btn btn--outline btn--small"
          href="https://github.com/pcwu2022/cmufood"
          target="_blank"
          rel="noopener noreferrer"
        >
          🐙 GitHub
        </a>
      </div>
    </header>
  );
}
