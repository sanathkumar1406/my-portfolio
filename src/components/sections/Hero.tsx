import { motion } from "framer-motion";
import { Download, ArrowDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { useState, useEffect } from "react";
import HomeEditModal from "@/components/admin/HomeEditModal";
import { toast } from "sonner";

const Hero = () => {
  const { isAdmin } = useAdmin();
  const [homeData, setHomeData] = useState({
    name: "Your Name",
    tagline: "Full Stack Developer specializing in building exceptional digital experiences. I create elegant, performant, and accessible web applications.",
    resumeUrl: null as string | null,
    photoUrl: null as string | null,
    availableForOpportunities: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/home');
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        const home = payload?.home || payload;
        const resumeUrl = home?.resumeUrl || null;
        const photoUrl = home?.photoUrl || null;
        const resolvedResumeUrl = resumeUrl
          ? (resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000${resumeUrl}`)
          : null;
        const resolvedPhotoUrl = photoUrl
          ? (photoUrl.startsWith('http') ? photoUrl : `http://localhost:5000${photoUrl}`)
          : null;
        setHomeData({
          name: home?.name || "Your Name",
          tagline: home?.tagline || "Full Stack Developer specializing in building exceptional digital experiences. I create elegant, performant, and accessible web applications.",
          resumeUrl: resolvedResumeUrl,
          photoUrl: resolvedPhotoUrl,
          availableForOpportunities: home?.availableForOpportunities !== false,
        });
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { name: string; tagline: string; availableForOpportunities: boolean }) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5000/api/home', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      const message = payload?.error || payload?.message || 'Failed to update home';
      throw new Error(message);
    }

    const updatedHome = payload?.home || payload;
    const photoUrl = updatedHome?.photoUrl || homeData.photoUrl;
    const resolvedPhotoUrl = photoUrl
      ? (photoUrl.startsWith('http') ? photoUrl : `http://localhost:5000${photoUrl}`)
      : null;
    setHomeData({
      name: updatedHome?.name ?? homeData.name,
      tagline: updatedHome?.tagline ?? homeData.tagline,
      resumeUrl: homeData.resumeUrl,
      photoUrl: resolvedPhotoUrl,
      availableForOpportunities: data.availableForOpportunities,
    });
  };

  const handleResumeUpload = async (file: File) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('resume', file);
    const response = await fetch('http://localhost:5000/api/home/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      const message = payload?.error || payload?.message || 'Failed to upload resume';
      throw new Error(message);
    }

    // Extract resumeUrl from response - check both top-level and nested in home object
    const resumeUrl = payload?.resumeUrl || payload?.home?.resumeUrl || null;
    if (!resumeUrl) {
      throw new Error('Resume URL not found in response');
    }

    // Use full backend URL so the link works from the Vite dev server
    const resolvedUrl = resumeUrl.startsWith('http')
      ? resumeUrl
      : `http://localhost:5000${resumeUrl}`;

    // Update state immediately with the new resume URL
    setHomeData(prev => ({ ...prev, resumeUrl: resolvedUrl }));
  };

  const handlePhotoUpload = async (file: File) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('photo', file);
    const response = await fetch('http://localhost:5000/api/home/photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      const message = payload?.error || payload?.message || 'Failed to upload photo';
      throw new Error(message);
    }

    const photoUrl = payload?.photoUrl || homeData.photoUrl;
    const resolvedUrl = photoUrl?.startsWith('http')
      ? photoUrl
      : `http://localhost:5000${photoUrl}`;

    setHomeData({ ...homeData, photoUrl: resolvedUrl });
  };

  const handlePhotoDelete = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5000/api/home/photo', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      const message = payload?.error || payload?.message || 'Failed to delete photo';
      throw new Error(message);
    }

    setHomeData({ ...homeData, photoUrl: null });
  };

  const handleResumeDelete = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5000/api/home/resume', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || (payload && payload.success === false)) {
      const message = payload?.error || payload?.message || 'Failed to delete resume';
      throw new Error(message);
    }

    setHomeData({ ...homeData, resumeUrl: null });
  };

  if (loading) {
    return (
      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="section-container relative z-10">
          <p className="text-center">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 md:pt-20"
      aria-labelledby="hero-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,hsl(var(--accent)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,hsl(var(--accent)/0.1),transparent_50%)]" />

      <div className="section-container relative z-10">
        <div className={`max-w-4xl mx-auto ${homeData.photoUrl ? '' : 'text-center'}`}>
          {/* Conditional Layout: Side-by-side when image exists, centered when no image */}
          <div className={`flex flex-col ${homeData.photoUrl ? 'md:flex-row md:items-center md:gap-12' : 'items-center'} mb-8`}>
            {/* Profile Photo - Left side when image exists */}
            {homeData.photoUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex-shrink-0 mb-6 md:mb-0"
              >
                <img
                  src={homeData.photoUrl}
                  alt={homeData.name}
                  className="w-36 h-36 md:w-52 md:h-52 rounded-full object-cover border-4 border-accent/20 shadow-lg"
                />
              </motion.div>
            )}

            {/* Text Content - Right side when image exists, centered when no image */}
            <div className={`flex-1 ${homeData.photoUrl ? '' : 'text-center'}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Status Badge - Only show if availableForOpportunities is true */}
                {homeData.availableForOpportunities && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Available for opportunities
                  </span>
                )}
              </motion.div>

              <motion.h1
                id="hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 flex items-center flex-wrap md:flex-nowrap gap-3 md:gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="whitespace-nowrap">
                  Hi, I'm{" "}
                  <span className="text-accent whitespace-nowrap">{homeData.name}</span>
                </span>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-background/80 backdrop-blur-sm h-8 w-8 flex-shrink-0"
                    title="Edit Home Section"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {homeData.tagline}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {homeData.resumeUrl ? (
                  <Button variant="hero" size="lg" asChild>
                    <a href={homeData.resumeUrl} download aria-label="Download Resume PDF" target="_blank" rel="noopener noreferrer">
                      <Download className="h-5 w-5" />
                      Download Resume
                    </a>
                  </Button>
                ) : null}
                <Button variant="heroOutline" size="lg" asChild>
                  <a href="#contact">
                    Get in Touch
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Scroll to About section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </motion.a>

      <HomeEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        homeData={homeData}
        onSave={handleSave}
        onResumeUpload={handleResumeUpload}
        onResumeDelete={handleResumeDelete}
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
      />
    </section>
  );
};

export default Hero;
