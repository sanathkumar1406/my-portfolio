import { Github, Linkedin, Mail, Twitter, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import FooterLinksModal from "@/components/admin/FooterLinksModal";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAdmin();
  const [footerLinks, setFooterLinks] = useState({
    github: 'https://github.com/sanathkumar1406',
    linkedin: 'https://www.linkedin.com/in/sanath-kumar-1a690a338',
    twitter: 'https://twitter.com',
    email: 'mailto:your.email@example.com',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  const fetchFooterLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/site-settings'));
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.footerLinks) {
          setFooterLinks({
            github: data.settings.footerLinks.github || '',
            linkedin: data.settings.footerLinks.linkedin || '',
            twitter: data.settings.footerLinks.twitter || '',
            email: data.settings.footerLinks.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching footer links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (links: { github?: string; linkedin?: string; twitter?: string; email?: string }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(getApiUrl('/api/site-settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ footerLinks: links })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update footer links');
      }

      const data = await response.json();
      setFooterLinks({
        github: data.settings.footerLinks.github || '',
        linkedin: data.settings.footerLinks.linkedin || '',
        twitter: data.settings.footerLinks.twitter || '',
        email: data.settings.footerLinks.email || '',
      });
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <footer className="bg-secondary/50 border-t border-border" role="contentinfo">
      <div className="section-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Sanath Kumar. All rights reserved.
          </p>

          {/* Social Links */}
          <nav aria-label="Social media links">
            <ul className="flex items-center gap-4">
              {footerLinks.github && (
                <li>
                  <a
                    href={footerLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="GitHub Profile"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </li>
              )}
              {footerLinks.linkedin && (
                <li>
                  <a
                    href={footerLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </li>
              )}
              {footerLinks.twitter && (
                <li>
                  <a
                    href={footerLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Twitter Profile"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </li>
              )}
              {footerLinks.email && (
                <li>
                  <a
                    href={footerLinks.email}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Send Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsModalOpen(true)}
                    title="Edit Footer Links"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      <FooterLinksModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footerLinks={footerLinks}
        onSave={handleSave}
      />
    </footer>
  );
};

export default Footer;
