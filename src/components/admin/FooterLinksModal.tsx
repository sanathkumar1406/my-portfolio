import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface FooterLinksModalProps {
  open: boolean;
  onClose: () => void;
  footerLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  onSave: (links: { github?: string; linkedin?: string; twitter?: string; email?: string }) => void;
}

const FooterLinksModal: React.FC<FooterLinksModalProps> = ({ open, onClose, footerLinks, onSave }) => {
  const [formData, setFormData] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (footerLinks) {
      setFormData({
        github: footerLinks.github || '',
        linkedin: footerLinks.linkedin || '',
        twitter: footerLinks.twitter || '',
        email: footerLinks.email?.replace('mailto:', '') || '',
      });
    }
  }, [footerLinks, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate URLs
      const links: any = {};
      
      if (formData.github.trim()) {
        if (!formData.github.startsWith('http://') && !formData.github.startsWith('https://')) {
          toast.error('GitHub URL must start with http:// or https://');
          setLoading(false);
          return;
        }
        links.github = formData.github.trim();
      }

      if (formData.linkedin.trim()) {
        if (!formData.linkedin.startsWith('http://') && !formData.linkedin.startsWith('https://')) {
          toast.error('LinkedIn URL must start with http:// or https://');
          setLoading(false);
          return;
        }
        links.linkedin = formData.linkedin.trim();
      }

      if (formData.twitter.trim()) {
        if (!formData.twitter.startsWith('http://') && !formData.twitter.startsWith('https://')) {
          toast.error('Twitter URL must start with http:// or https://');
          setLoading(false);
          return;
        }
        links.twitter = formData.twitter.trim();
      }

      if (formData.email.trim()) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          toast.error('Please enter a valid email address');
          setLoading(false);
          return;
        }
        links.email = `mailto:${formData.email.trim()}`;
      }

      await onSave(links);
      toast.success('Footer links updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update footer links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Footer Social Links</DialogTitle>
          <DialogDescription>
            Update the social media links displayed in the footer
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://www.linkedin.com/in/username"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X URL</Label>
            <Input
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/username"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              type="email"
            />
            <p className="text-xs text-muted-foreground">
              Enter email address only (mailto: will be added automatically)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FooterLinksModal;
