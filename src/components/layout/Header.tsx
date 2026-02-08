import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#certificates", label: "Certificates" },
  { href: "#projects", label: "Projects" },
  { href: "#profiles", label: "Profiles" },
  { href: "#contact", label: "Contact" },
];

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ isDarkMode, toggleDarkMode }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to scroll to section with header offset
  const scrollToSection = (sectionId: string, closeMenu = false) => {
    if (closeMenu) {
      setIsMenuOpen(false);
    }

    // Small delay to ensure menu closes before scrolling (mobile only)
    const scrollDelay = closeMenu ? 100 : 0;

    setTimeout(() => {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        // Get header height (64px on mobile, 80px on desktop)
        const headerHeight = window.innerWidth >= 768 ? 80 : 64;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        // Scroll with offset to account for fixed header
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, scrollDelay);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
        : "bg-transparent"
        }`}
      role="banner"
    >
      <nav className="section-container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo removed - empty space */}
          <div></div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1" role="menubar">
            {navLinks.map((link) => (
              <li key={link.href} role="none">
                <a
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = link.href.substring(1);
                    scrollToSection(targetId);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-lg border-t border-border"
            >
              <ul className="py-4 space-y-1" role="menu">
                {navLinks.map((link) => (
                  <li key={link.href} role="none">
                    <a
                      href={link.href}
                      className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        const targetId = link.href.substring(1);
                        scrollToSection(targetId, true);
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
