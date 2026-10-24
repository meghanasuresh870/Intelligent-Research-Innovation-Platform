import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Intelligence Modules', href: '#modules' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Data Sources', href: '#data-sources' },
  { label: 'About Platform', href: '#about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);

    const element = document.querySelector(href);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Logo */}
          <div
            className="logo"
            onClick={() => handleNavigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleNavigate('/');
              }
            }}
          >
            <div className="logo-icon">RI</div>

            <div className="logo-text">
              <div className="logo-name">
                Research Funding &amp; Innovation Intelligence
              </div>

              <div className="logo-subtitle">
                Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Authentication Buttons */}
          <div className="nav-buttons">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleNavigate('/login')}
            >
              Login
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleNavigate('/register')}
            >
              Sign Up
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={`hamburger${menuOpen ? ' active' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((previous) => !previous)}
            >
              <span
                style={
                  menuOpen
                    ? {
                        transform: 'rotate(45deg) translate(5px, 5px)',
                      }
                    : {}
                }
              />

              <span
                style={menuOpen ? { opacity: 0 } : {}}
              />

              <span
                style={
                  menuOpen
                    ? {
                        transform: 'rotate(-45deg) translate(5px, -5px)',
                      }
                    : {}
                }
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick(link.href)}
          >
            {link.label}
          </button>
        ))}

        <div className="mobile-nav-buttons">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleNavigate('/login')}
          >
            Login
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleNavigate('/register')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
}
