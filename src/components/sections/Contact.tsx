import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send, Loader2, Edit, Save, X, Github, Linkedin, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast: useToastHook } = useToast();
  const { isAdmin } = useAdmin();
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/contact'));

      if (!response.ok) {
        throw new Error(`Failed to fetch contact data: ${response.status}`);
      }

      const data = await response.json();
      setContactData(data);
      setEditForm(data);
    } catch (error: any) {
      console.error('Error fetching contact:', error);
      setError(error.message || 'Failed to load contact data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/api/contact/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || (data && data.success === false)) {
        const message = data?.error || data?.message || 'Failed to send message';
        throw new Error(message);
      }

      useToastHook({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error('Error sending message:', error);
      useToastHook({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Failed to update contact info');

      const updated = await response.json();
      setContactData(updated);
      setIsEditing(false);
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact information');
    }
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center" id="contact">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-lg">Loading...</p>
        </div>
      </section>
    );
  }

  if (error || !contactData) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center text-destructive" id="contact">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-xl font-semibold mb-2">Error Loading Contact</p>
          <p className="mb-4">{error}</p>
          <Button variant="outline" onClick={fetchContact}>Retry</Button>
        </div>
      </section>
    );
  }

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: contactData.email,
      href: `mailto:${contactData.email}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: contactData.location,
      href: null,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contactData.phone,
      href: contactData.phone ? `tel:${contactData.phone.replace(/\s/g, '')}` : null,
    },
  ];

  return (
    <section
      id="contact"
      className="py-20 md:py-32 bg-secondary/30"
      aria-labelledby="contact-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Have a question or want to work together? Feel free to reach out!
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" /> Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" /> Edit Contact Info
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Let's Connect
            </h3>
            {isEditing ? (
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Contact description"
                  rows={4}
                  className="bg-card"
                />
              </div>
            ) : (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {contactData.description || "I'm currently open to new opportunities and collaborations. Whether you have a project in mind or just want to say hello, I'd love to hear from you."}
              </p>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email"
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone"
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <Input
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location"
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Social Links</label>
                  <div className="space-y-2">
                    <Input
                      value={editForm.socialLinks?.github || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialLinks: { ...editForm.socialLinks, github: e.target.value }
                      })}
                      placeholder="GitHub URL"
                      className="bg-card"
                    />
                    <Input
                      value={editForm.socialLinks?.linkedin || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialLinks: { ...editForm.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="LinkedIn URL"
                      className="bg-card"
                    />
                    <Input
                      value={editForm.socialLinks?.twitter || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialLinks: { ...editForm.socialLinks, twitter: e.target.value }
                      })}
                      placeholder="Twitter URL"
                      className="bg-card"
                    />
                    <Input
                      value={editForm.socialLinks?.email || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialLinks: { ...editForm.socialLinks, email: e.target.value }
                      })}
                      placeholder="Email (mailto: link)"
                      className="bg-card"
                    />
                    <Input
                      value={editForm.socialLinks?.website || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialLinks: { ...editForm.socialLinks, website: e.target.value }
                      })}
                      placeholder="Website URL"
                      className="bg-card"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditForm(contactData);
                  }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button onClick={handleSaveContact}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <info.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-foreground hover:text-accent transition-colors font-medium"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-foreground font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Social Links - Only show if at least one social link exists */}
                {contactData.socialLinks && (
                  (contactData.socialLinks.github ||
                    contactData.socialLinks.linkedin ||
                    contactData.socialLinks.twitter ||
                    contactData.socialLinks.email ||
                    contactData.socialLinks.website) && (
                    <div className="flex items-center gap-4 pt-4">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Globe className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex gap-4">
                        {contactData.socialLinks.github && (
                          <a
                            href={contactData.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-accent transition-colors"
                            aria-label="GitHub"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                        {contactData.socialLinks.linkedin && (
                          <a
                            href={contactData.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-accent transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {contactData.socialLinks.twitter && (
                          <a
                            href={contactData.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-accent transition-colors"
                            aria-label="Twitter"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {contactData.socialLinks.email && (
                          <a
                            href={contactData.socialLinks.email}
                            className="text-foreground hover:text-accent transition-colors"
                            aria-label="Email"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
                        {contactData.socialLinks.website && (
                          <a
                            href={contactData.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-accent transition-colors"
                            aria-label="Website"
                          >
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="bg-card"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-card"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="bg-card"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  className="bg-card resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
