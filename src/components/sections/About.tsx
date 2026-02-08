import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Briefcase, GraduationCap, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [editingEduId, setEditingEduId] = useState<number | null>(null);
  const [editEduForm, setEditEduForm] = useState<any>({});
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ degree: '', school: '', period: '' });

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/about'));

      if (!response.ok) {
        throw new Error(`Failed to fetch about data: ${response.status}`);
      }

      const data = await response.json();
      setAboutData(data);
      setBioText(data.bio || '');
    } catch (error: any) {
      console.error('Error fetching about:', error);
      setError(error.message || 'Failed to load about data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(getApiUrl('/api/about'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...aboutData,
          bio: bioText,
        })
      });

      if (!response.ok) throw new Error('Failed to update bio');

      const updated = await response.json();
      setAboutData(updated);
      setIsEditingBio(false);
      toast.success('Bio updated successfully');
    } catch (error) {
      console.error('Error updating bio:', error);
      toast.error('Failed to update bio');
    }
  };

  const handleSaveEducation = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      let education = [...(aboutData.education || [])];

      if (editingEduId !== null) {
        // Update existing
        education[editingEduId] = editEduForm;
      } else if (isAddingEdu) {
        // Add new
        education.push(newEdu);
      }

      const response = await fetch(getApiUrl('/api/about'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...aboutData,
          education,
        })
      });

      if (!response.ok) throw new Error('Failed to update education');

      const updated = await response.json();
      setAboutData(updated);
      setEditingEduId(null);
      setIsAddingEdu(false);
      setEditEduForm({});
      setNewEdu({ degree: '', school: '', period: '' });
      toast.success('Education updated successfully');
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error('Failed to update education');
    }
  };

  const handleDeleteEducation = async (index: number) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const education = aboutData.education.filter((_: any, i: number) => i !== index);

      const response = await fetch(getApiUrl('/api/about'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...aboutData,
          education,
        })
      });

      if (!response.ok) throw new Error('Failed to delete education');

      const updated = await response.json();
      setAboutData(updated);
      toast.success('Education deleted successfully');
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error('Failed to delete education');
    }
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center" id="about">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-lg">Loading...</p>
        </div>
      </section>
    );
  }

  if (error || !aboutData) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center text-destructive" id="about">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-xl font-semibold mb-2">Error Loading About</p>
          <p className="mb-4">{error}</p>
          <Button variant="outline" onClick={fetchAbout}>Retry</Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="about"
      className="py-20 md:py-32 bg-secondary/30"
      aria-labelledby="about-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              About Me
            </h2>
            {isAdmin && !isEditingBio && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditingBio(true)}
                title="Edit About Me"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A passionate developer with a love for creating impactful solutions.
          </p>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-16"
        >
          {isEditingBio ? (
            <div className="space-y-4 w-full">
              <Textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="About Me Bio"
                rows={6}
                className="bg-card w-full resize-y min-h-[150px] max-h-[400px]"
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  overflowX: 'hidden',
                  maxWidth: '100%'
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditingBio(false);
                  setBioText(aboutData.bio);
                }}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSaveBio}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <article className="prose prose-lg dark:prose-invert mx-auto w-full text-center" style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflowX: 'hidden',
              maxWidth: '100%'
            }}>
              {aboutData.bio?.split('\n').map((paragraph: string, index: number) => (
                <p
                  key={index}
                  className={index === 0 ? "text-foreground leading-relaxed text-lg text-center" : "text-muted-foreground leading-relaxed text-center"}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    textAlign: 'center'
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </article>
          )}
        </motion.div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-accent" />
              Education
            </h3>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingEdu(true);
                  setEditingEduId(null);
                  setNewEdu({ degree: '', school: '', period: '' });
                }}
                disabled={isAddingEdu || editingEduId !== null}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Education
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Add New Education Form */}
            {isAdmin && isAddingEdu && (
              <article className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] border border-border">
                <div className="space-y-4">
                  <Input
                    value={newEdu.degree}
                    onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                    placeholder="Degree"
                  />
                  <Input
                    value={newEdu.school}
                    onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                    placeholder="School"
                  />
                  <Input
                    value={newEdu.period}
                    onChange={(e) => setNewEdu({ ...newEdu, period: e.target.value })}
                    placeholder="Period"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsAddingEdu(false);
                      setNewEdu({ degree: '', school: '', period: '' });
                    }}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button onClick={handleSaveEducation} disabled={!newEdu.degree || !newEdu.school || !newEdu.period}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              </article>
            )}

            {aboutData.education && aboutData.education.map((edu: any, index: number) => (
              <article
                key={index}
                className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] border border-border relative"
              >
                {isAdmin && editingEduId !== index && (
                  <div className="absolute top-2 right-2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingEduId(index);
                        setEditEduForm(edu);
                        setIsAddingEdu(false);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEducation(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {editingEduId === index ? (
                  <div className="space-y-4">
                    <Input
                      value={editEduForm.degree}
                      onChange={(e) => setEditEduForm({ ...editEduForm, degree: e.target.value })}
                      placeholder="Degree"
                    />
                    <Input
                      value={editEduForm.school}
                      onChange={(e) => setEditEduForm({ ...editEduForm, school: e.target.value })}
                      placeholder="School"
                    />
                    <Input
                      value={editEduForm.period}
                      onChange={(e) => setEditEduForm({ ...editEduForm, period: e.target.value })}
                      placeholder="Period"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditingEduId(null);
                        setEditEduForm({});
                      }}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button onClick={handleSaveEducation}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-foreground">{edu.degree}</h4>
                    <p className="text-accent font-medium">{edu.school}</p>
                    <p className="text-sm text-muted-foreground mt-2">{edu.period}</p>
                  </>
                )}
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
