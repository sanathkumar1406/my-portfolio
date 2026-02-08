import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project?: any;
  onSave: (project: any) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
        liveUrl: project.liveUrl || '',
        githubUrl: project.githubUrl || '',
        featured: project.featured || false,
      });
      setImagePreview(project.imageUrl || null);
      setCurrentImageUrl(project.imageUrl || null);
      setShouldRemoveImage(false);
    } else {
      setFormData({
        title: '',
        description: '',
        technologies: '',
        liveUrl: '',
        githubUrl: '',
        featured: false,
      });
      setImagePreview(null);
      setCurrentImageUrl(null);
      setShouldRemoveImage(false);
    }
    setImageFile(null);
  }, [project, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const technologies = formData.technologies
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      let savedProject: any;

      if (project) {
        // Update existing project
        const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            technologies,
            liveUrl: formData.liveUrl || undefined,
            githubUrl: formData.githubUrl || undefined,
          })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || (data && data.success === false)) {
          const message = data?.error || data?.message || 'Failed to update project';
          throw new Error(message);
        }
        savedProject = data?.project || data;
      } else {
        // Create new project
        const response = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: Date.now().toString(),
            ...formData,
            technologies,
            liveUrl: formData.liveUrl || undefined,
            githubUrl: formData.githubUrl || undefined,
          })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || (data && data.success === false)) {
          const message = data?.error || data?.message || 'Failed to create project';
          throw new Error(message);
        }
        savedProject = data?.project || data;
      }

      // Delete image if marked for removal
      if (shouldRemoveImage && savedProject.imageUrl) {
        const deleteResponse = await fetch(`http://localhost:5000/api/projects/${savedProject.id}/image`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const deleteData = await deleteResponse.json().catch(() => null);
        if (!deleteResponse.ok || (deleteData && deleteData.success === false)) {
          const message = deleteData?.error || deleteData?.message || 'Failed to delete image';
          throw new Error(message);
        }
        savedProject = deleteData?.project || { ...savedProject, imageUrl: null };
      }

      // Upload image if selected (only if not removing)
      if (imageFile && !shouldRemoveImage) {
        const imgForm = new FormData();
        imgForm.append('image', imageFile);
        const imageResponse = await fetch(`http://localhost:5000/api/projects/${savedProject.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imgForm
        });

        const imgData = await imageResponse.json().catch(() => null);
        if (!imageResponse.ok || (imgData && imgData.success === false)) {
          const message = imgData?.error || imgData?.message || 'Failed to upload image';
          throw new Error(message);
        }
        savedProject = imgData?.project || imgData;
      }

      toast.success(project ? 'Project updated successfully' : 'Project created successfully');
      onSave(savedProject);
      onClose();
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update project details' : 'Fill in the details to add a new project'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Project title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated) *</Label>
            <Input
              id="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="React, Node.js, MongoDB"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {!imagePreview && currentImageUrl && !shouldRemoveImage && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current image: <a href={`http://localhost:5000${currentImageUrl}`} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShouldRemoveImage(true);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove Image
                </Button>
              </div>
            )}
            {shouldRemoveImage && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Image will be removed when you save
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShouldRemoveImage(false);
                    setImagePreview(currentImageUrl);
                  }}
                >
                  Cancel Removal
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured Project</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.description}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
