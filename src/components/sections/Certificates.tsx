import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FileText, Image as ImageIcon, Edit, Plus, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";
import { usePdfThumbnail } from "@/hooks/usePdfThumbnail";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiUrl, getAssetUrl } from "@/config/api";

const Certificates = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [deleteCertificateId, setDeleteCertificateId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/certificates'));

      if (!response.ok) {
        throw new Error(`Failed to fetch certificates: ${response.status}`);
      }

      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      setError(error.message || 'Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCertificate(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (certificate: any) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (certificateId: string) => {
    setDeleteCertificateId(certificateId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCertificateId) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(getApiUrl(`/api/certificates/${deleteCertificateId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete certificate');
      }

      toast.success('Certificate deleted successfully');
      fetchCertificates();
      setDeleteCertificateId(null);
    } catch (error: any) {
      console.error('Error deleting certificate:', error);
      toast.error(error.message || 'Failed to delete certificate');
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const url = editingCertificate
        ? getApiUrl(`/api/certificates/${editingCertificate._id}`)
        : getApiUrl('/api/certificates');

      const response = await fetch(url, {
        method: editingCertificate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save certificate');
      }

      toast.success(editingCertificate ? 'Certificate updated successfully' : 'Certificate added successfully');
      setIsModalOpen(false);
      setEditingCertificate(null);
      fetchCertificates();
    } catch (error: any) {
      console.error('Error saving certificate:', error);
      toast.error(error.message || 'Failed to save certificate');
    }
  };

  const handleCertificateClick = (certificate: any) => {
    const fileUrl = getAssetUrl(certificate.fileUrl);

    if (certificate.fileType === 'pdf') {
      window.open(fileUrl, '_blank');
    } else {
      setPreviewUrl(fileUrl);
      setPreviewType('image');
    }
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center" id="certificates">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Certificates</h2>
          <p className="text-lg">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-32 bg-secondary/30 text-center text-destructive" id="certificates">
        <div className="section-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Certificates</h2>
          <p className="text-xl font-semibold mb-2">Error Loading Certificates</p>
          <p className="mb-4">{error}</p>
          <Button variant="outline" onClick={fetchCertificates}>Retry</Button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="certificates"
      className="py-20 md:py-32 bg-secondary/30"
      aria-labelledby="certificates-heading"
      ref={ref}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 id="certificates-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Certificates
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Professional certifications and achievements
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </div>
          )}
        </motion.div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No certificates yet.</p>
            {isAdmin && (
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Certificate
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {certificates.map((certificate) => {
              const fileUrl = getAssetUrl(certificate.fileUrl);

              return (
                <CertificateCard
                  key={certificate._id}
                  certificate={certificate}
                  fileUrl={fileUrl}
                  isInView={isInView}
                  isAdmin={isAdmin}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onClick={handleCertificateClick}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCertificate(null);
        }}
        certificate={editingCertificate}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCertificateId} onOpenChange={() => setDeleteCertificateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      {previewUrl && previewType === 'image' && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Certificate preview"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewUrl(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificate: any | null;
  onSave: (formData: FormData) => void;
}

const CertificateModal = ({ open, onClose, certificate, onSave }: CertificateModalProps) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certificate) {
      setTitle(certificate.title || '');
      setIssuer(certificate.issuer || '');
      const fileUrl = getAssetUrl(certificate.fileUrl);
      setFilePreview(fileUrl);
    } else {
      setTitle('');
      setIssuer('');
      setFile(null);
      setFilePreview(null);
    }
  }, [certificate, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer) {
      toast.error('Title and issuer are required');
      return;
    }

    if (!certificate && !file) {
      toast.error('Please upload a certificate file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('issuer', issuer);
      if (file) {
        formData.append('file', file);
      }

      await onSave(formData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{certificate ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Certificate title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Issuing Organization *</Label>
            <Input
              id="issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Issuing organization"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Certificate File {!certificate && '*'}</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {filePreview && (
              <div className="mt-2">
                {filePreview.startsWith('data:') || filePreview.endsWith('.pdf') ? (
                  <p className="text-sm text-muted-foreground">File selected</p>
                ) : (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-32 rounded border"
                  />
                )}
              </div>
            )}
            {certificate && !file && (
              <p className="text-sm text-muted-foreground">
                Leave empty to keep current file
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title || !issuer || (!certificate && !file)}>
              {loading ? 'Saving...' : certificate ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Certificate Card Component with PDF Thumbnail Support
interface CertificateCardProps {
  certificate: any;
  fileUrl: string;
  isInView: boolean;
  isAdmin: boolean;
  onEdit: (certificate: any) => void;
  onDelete: (id: string) => void;
  onClick: (certificate: any) => void;
}

const CertificateCard = ({
  certificate,
  fileUrl,
  isInView,
  isAdmin,
  onEdit,
  onDelete,
  onClick,
}: CertificateCardProps) => {
  const { thumbnailUrl, loading: pdfLoading, error: pdfError } = usePdfThumbnail(
    certificate.fileType === 'pdf' ? fileUrl : null
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <div
        className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300 h-full flex flex-col"
        onClick={() => onClick(certificate)}
      >
        <div className="flex justify-center items-center mb-3 h-24 overflow-hidden">
          {certificate.fileType === 'pdf' ? (
            <>
              {pdfLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                </div>
              ) : thumbnailUrl && !pdfError ? (
                <img
                  src={thumbnailUrl}
                  alt={certificate.title}
                  className="max-h-24 max-w-full object-cover rounded w-full h-full"
                />
              ) : (
                <FileText className="h-12 w-12 text-accent" />
              )}
            </>
          ) : (
            <img
              src={fileUrl}
              alt={certificate.title}
              className="max-h-24 max-w-full object-cover rounded w-full h-full"
            />
          )}
        </div>
        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
          {certificate.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {certificate.issuer}
        </p>
      </div>

      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(certificate);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/90 hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(certificate._id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Certificates;
