import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile?: any;
  onSave: (profile: any) => void;
}

const colorOptions = [
  { value: 'bg-foreground', label: 'Default' },
  { value: 'bg-amber-500', label: 'Amber' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-gray-500', label: 'Gray' },
  { value: 'bg-violet-500', label: 'Violet' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-green-500', label: 'Green' },
];

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    url: '',
    stats: '',
    description: '',
    color: 'bg-foreground',
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        url: profile.url || '',
        stats: profile.stats || '',
        description: profile.description || '',
        color: profile.color || 'bg-foreground',
        order: profile.order || 0,
      });
    } else {
      setFormData({
        name: '',
        username: '',
        url: '',
        stats: '',
        description: '',
        color: 'bg-foreground',
        order: 0,
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      let savedProfile;

      if (profile) {
        // Update existing profile
        const response = await fetch(`http://localhost:5000/api/profiles/${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || (data && data.success === false)) {
          const message = data?.error || data?.message || 'Failed to update profile';
          throw new Error(message);
        }
        savedProfile = data?.profile || data;
      } else {
        // Create new profile
        const response = await fetch('http://localhost:5000/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: Date.now().toString(),
            ...formData,
          })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || (data && data.success === false)) {
          const message = data?.error || data?.message || 'Failed to create profile';
          throw new Error(message);
        }
        savedProfile = data?.profile || data;
      }

      toast.success(profile ? 'Profile updated successfully' : 'Profile created successfully');
      onSave(savedProfile);
      onClose();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? 'Edit Profile' : 'Add New Profile'}</DialogTitle>
          <DialogDescription>
            {profile ? 'Update coding profile details' : 'Add a new coding profile platform'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Platform Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="GitHub"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@yourusername"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Profile URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://github.com/yourusername"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stats">Stats</Label>
            <Input
              id="stats"
              value={formData.stats}
              onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
              placeholder="500+ contributions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this profile"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.username || !formData.url}>
              {loading ? 'Saving...' : profile ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
