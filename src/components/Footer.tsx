
const Footer = () => (
  <footer className="w-full py-3 px-4 text-xs text-gray-500 bg-white border-t border-gray-200 flex items-center justify-between">
    <span>
      Version ${import.meta.env.VITE_FRONTEND_VERSION} &nbsp;|&nbsp; &copy; {new Date().getFullYear()} dhondpratyay
    </span>
    <div className="flex gap-3 items-center">
      <a
        href="https://github.com/PratyayDhond"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="hover:text-black transition"
      >
        {/* GitHub SVG */}
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/pratyaydhond/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="hover:text-blue-700 transition"
      >
        {/* LinkedIn SVG */}
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/>
        </svg>
      </a>
      <a
        href="https://pratyaydhond.github.io/secondBrain/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Second Brain"
        className="hover:opacity-80 transition"
      >
        {/* Second Brain PNG */}
        <img src="/secondBrain.png" alt="Second Brain" width={20} height={20} style={{ display: "inline-block" }} />
      </a>
    </div>
  </footer>
);

export default Footer;