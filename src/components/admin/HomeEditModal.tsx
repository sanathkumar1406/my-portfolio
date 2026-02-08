import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface HomeEditModalProps {
  open: boolean;
  onClose: () => void;
  homeData: {
    name: string;
    tagline: string;
    resumeUrl?: string;
    photoUrl?: string;
    availableForOpportunities?: boolean;
  };
  onSave: (data: { name: string; tagline: string; availableForOpportunities: boolean }) => void;
  onResumeUpload: (file: File) => void;
  onResumeDelete: () => void;
  onPhotoUpload: (file: File) => void;
  onPhotoDelete: () => void;
}

const HomeEditModal: React.FC<HomeEditModalProps> = ({ open, onClose, homeData, onSave, onResumeUpload, onResumeDelete, onPhotoUpload, onPhotoDelete }) => {
  const [name, setName] = useState(homeData.name);
  const [tagline, setTagline] = useState(homeData.tagline);
  const [availableForOpportunities, setAvailableForOpportunities] = useState(homeData.availableForOpportunities !== false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(homeData.photoUrl || null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setName(homeData.name);
    setTagline(homeData.tagline);
    setAvailableForOpportunities(homeData.availableForOpportunities !== false);
    setPhotoPreview(homeData.photoUrl || null);
  }, [homeData, open]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({ name, tagline, availableForOpportunities });
      if (resumeFile) {
        await onResumeUpload(resumeFile);
      }
      if (photoFile) {
        await onPhotoUpload(photoFile);
      }
      // Note: Photo deletion is handled separately via the delete button if needed
      toast.success('Home section updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Home Section</DialogTitle>
          <DialogDescription>
            Update your name, tagline, and resume
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline *</Label>
            <Textarea
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Your tagline"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="cursor-pointer"
              />
              {photoPreview && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {!photoPreview && homeData.photoUrl && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Current photo: <a href={homeData.photoUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await onPhotoDelete();
                      toast.success('Photo deleted successfully');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to delete photo');
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove Photo
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            {homeData.resumeUrl && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Current resume: <a href={homeData.resumeUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await onResumeDelete();
                      toast.success('Resume deleted successfully');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to delete resume');
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove Resume
                </Button>
              </div>
            )}
            {!homeData.resumeUrl && !resumeFile && (
              <p className="text-sm text-muted-foreground">No resume uploaded yet</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="availableForOpportunities"
              checked={availableForOpportunities}
              onChange={(e) => setAvailableForOpportunities(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="availableForOpportunities" className="cursor-pointer">
              Available for Opportunities
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !tagline}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HomeEditModal;
