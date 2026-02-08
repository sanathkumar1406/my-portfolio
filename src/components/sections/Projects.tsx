import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Github, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";
import ProjectModal from "@/components/admin/ProjectModal";
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
import { getApiUrl, getAssetUrl } from "@/config/api";

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/projects'));

      if (!response.ok) {
        let errorMessage = `Failed to fetch projects: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        setError('Invalid response format: expected an array');
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      let errorMessage = 'Failed to load projects.';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to backend server. Make sure the server is running on port 5000.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (project: any) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (projectId: string) => {
    setDeleteProjectId(projectId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProjectId) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(getApiUrl(`/api/projects/${deleteProjectId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter((p: any) => p.id !== deleteProjectId));
      toast.success('Project deleted successfully');
      setDeleteProjectId(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleSave = (savedProject: any) => {
    if (editingProject) {
      setProjects(projects.map((p: any) => p.id === savedProject.id ? savedProject : p));
    } else {
      setProjects([...projects, savedProject]);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center" id="projects">
        <div className="section-container">
          <p className="text-lg">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center text-destructive" id="projects">
        <div className="section-container">
          <p className="text-xl font-semibold mb-2">Error Loading Projects</p>
          <p className="mb-4 text-sm max-w-2xl mx-auto">{error}</p>
          <Button variant="outline" onClick={fetchProjects}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center" id="projects">
        <div className="section-container">
          <p className="text-xl text-muted-foreground">No projects found.</p>
          {isAdmin && (
            <div className="mt-4">
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="py-20 md:py-32 bg-secondary/30"
      aria-labelledby="projects-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="projects-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A selection of projects that showcase my skills and passion for development.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          )}
        </motion.div>

        {/* Projects Grid - 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any, index: number) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group bg-card rounded-xl overflow-hidden shadow-[var(--card-shadow)] border border-border card-hover relative"
            >
              {isAdmin && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditClick(project)}
                    title="Edit project"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(project.id)}
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Project Image */}
              <div className="h-48 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={getAssetUrl(project.imageUrl)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-accent/50 group-hover:text-accent transition-colors">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies && project.technologies.slice(0, 4).map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies && project.technologies.length > 4 && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3">
                  {project.liveUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live demo`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Live
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} source code on GitHub`}
                      >
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProjectId !== null} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteProjectId(null)}>Cancel</AlertDialogCancel>
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

export default Projects;
