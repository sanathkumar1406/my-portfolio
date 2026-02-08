import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Code, Server, Database, Cloud, Wrench, Users, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Icon mapping
const iconMap: { [key: string]: any } = {
  Code,
  Server,
  Database,
  Cloud,
  Wrench,
  Users,
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState({
    title: '',
    icon: 'Code',
    skills: '',
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/skills');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSkillCategories(data);
      } else {
        setSkillCategories([]);
        setError('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      setError(error.message || 'Failed to load skills');
      setSkillCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category: any) => {
    setEditingId(category.id);
    setEditForm({
      ...category,
      skills: Array.isArray(category.skills) ? category.skills.join(', ') : category.skills,
    });
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
    setNewCategory({ title: '', icon: 'Code', skills: '' });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      if (editingId) {
        // Update existing
        const updateData = {
          ...editForm,
          skills: typeof editForm.skills === 'string' 
            ? editForm.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
            : editForm.skills,
        };

        const response = await fetch(`http://localhost:5000/api/skills/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update skill category');

        const updated = await response.json();
        setSkillCategories(skillCategories.map((c: any) => c.id === editingId ? updated : c));
        setEditingId(null);
        setEditForm({});
        toast.success('Skill category updated successfully');
      } else if (isAddingNew) {
        // Create new
        const newData = {
          id: Date.now().toString(),
          title: newCategory.title,
          icon: newCategory.icon,
          skills: newCategory.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
          order: skillCategories.length,
        };

        const response = await fetch('http://localhost:5000/api/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newData)
        });

        if (!response.ok) throw new Error('Failed to create skill category');

        const created = await response.json();
        setSkillCategories([...skillCategories, created]);
        setIsAddingNew(false);
        setNewCategory({ title: '', icon: 'Code', skills: '' });
        toast.success('Skill category created successfully');
      }
    } catch (error) {
      console.error('Error saving skill category:', error);
      toast.error(editingId ? 'Failed to update skill category' : 'Failed to create skill category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this skill category?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/skills/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete skill category');

      setSkillCategories(skillCategories.filter((c: any) => c.id !== categoryId));
      toast.success('Skill category deleted successfully');
    } catch (error) {
      console.error('Error deleting skill category:', error);
      toast.error('Failed to delete skill category');
    }
  };

  const handleAddClick = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setEditForm({});
    setNewCategory({ title: '', icon: 'Code', skills: '' });
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 text-center" id="skills">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Skills & Technologies</h2>
          <p className="text-lg">Loading skills...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-32 text-center text-destructive" id="skills">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Skills & Technologies</h2>
          <p className="text-xl font-semibold mb-2">Error Loading Skills</p>
          <p className="mb-4">{error}</p>
          <Button variant="outline" onClick={fetchSkills}>Retry</Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="skills"
      className="py-20 md:py-32"
      aria-labelledby="skills-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="skills-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Skills & Technologies
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A comprehensive overview of my technical expertise and professional competencies.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddClick}
                disabled={isAddingNew || editingId !== null}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Category Form */}
          {isAdmin && isAddingNew && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] border border-border relative"
            >
              <div className="space-y-4">
                <Input
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  placeholder="Category Title"
                />
                <select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="Code">Code</option>
                  <option value="Server">Server</option>
                  <option value="Database">Database</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Users">Users</option>
                </select>
                <Textarea
                  value={newCategory.skills}
                  onChange={(e) => setNewCategory({ ...newCategory, skills: e.target.value })}
                  placeholder="Skills (comma separated)"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!newCategory.title || !newCategory.skills}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </motion.article>
          )}

          {skillCategories.map((category, categoryIndex) => {
            const IconComponent = iconMap[category.icon] || Code;
            
            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
                className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] border border-border card-hover relative"
              >
                {isAdmin && editingId !== category.id && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditClick(category)}
                      title="Edit category"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {editingId === category.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Category Title"
                    />
                    <select
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="Code">Code</option>
                      <option value="Server">Server</option>
                      <option value="Database">Database</option>
                      <option value="Cloud">Cloud</option>
                      <option value="Wrench">Wrench</option>
                      <option value="Users">Users</option>
                    </select>
                    <Textarea
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      placeholder="Skills (comma separated)"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <IconComponent className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                    </div>

              <ul className="space-y-2" aria-label={`${category.title} skills`}>
                      {category.skills && category.skills.map((skill: string, skillIndex: number) => (
                  <li
                          key={skillIndex}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-sm">{skill}</span>
                  </li>
                ))}
              </ul>
                  </>
                )}
            </motion.article>
            );
          })}
        </div>

        {/* ATS-friendly skills summary */}
        <div className="sr-only">
          <h3>Technical Skills Summary</h3>
          <p>
            {skillCategories.flatMap((cat: any) => cat.skills || []).join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Skills;
