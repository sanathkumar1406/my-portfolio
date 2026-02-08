import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";
import ProfileModal from "@/components/admin/ProfileModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profiles = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/profiles');

      if (!response.ok) {
        let errorMessage = `Failed to fetch profiles: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
      } else if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        setProfiles([]);
        setError('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      let errorMessage = 'Failed to load profiles.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to backend server. Make sure the server is running on port 5000.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (profile: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (profileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteProfileId(profileId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProfileId) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profiles/${deleteProfileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || (data && data.success === false)) {
        const message = data?.error || data?.message || 'Failed to delete profile';
        throw new Error(message);
      }

      setProfiles(profiles.filter((p: any) => p.id !== deleteProfileId));
      toast.success('Profile deleted successfully');
      setDeleteProfileId(null);
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error(error.message || 'Failed to delete profile');
    }
  };

  const handleSave = (savedProfile: any) => {
    if (editingProfile) {
      setProfiles(profiles.map((p: any) => p.id === savedProfile.id ? savedProfile : p));
    } else {
      setProfiles([...profiles, savedProfile]);
    }
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 text-center" id="profiles">
        <div className="section-container">
          <p className="text-lg">Loading profiles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-32 text-center text-destructive" id="profiles">
        <div className="section-container">
          <p className="text-xl font-semibold mb-2">Error Loading Profiles</p>
          <p className="mb-4 text-sm max-w-2xl mx-auto">{error}</p>
          <Button variant="outline" onClick={fetchProfiles}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="profiles"
      className="py-20 md:py-32"
      aria-labelledby="profiles-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="profiles-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Coding Profiles
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Find me on various platforms where I code, learn, and share knowledge.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </div>
          )}
        </motion.div>

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No profiles found.</p>
            {isAdmin && (
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Profile
              </Button>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile: any, index: number) => (
              <motion.div
                key={profile.id || profile.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group relative"
              >
                <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
                  className="block"
              aria-label={`Visit my ${profile.name} profile`}
            >
              <article className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] border border-border card-hover h-full">
                    {isAdmin && (
                      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleEditClick(profile, e)}
                          title="Edit profile"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteClick(profile.id, e)}
                          title="Delete profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${profile.color || 'bg-foreground'} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {profile.username}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                    {profile.description && (
                <p className="text-muted-foreground text-sm mb-4">
                  {profile.description}
                </p>
                    )}

                    {profile.stats && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  {profile.stats}
                </span>
                    )}
              </article>
                </a>
              </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        profile={editingProfile}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProfileId !== null} onOpenChange={(open) => !open && setDeleteProfileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coding profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteProfileId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Profiles;
