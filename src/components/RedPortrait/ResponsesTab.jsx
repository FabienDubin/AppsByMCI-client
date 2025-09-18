import { useState, useEffect } from "react";
import redPortraitService from "@/services/redportrait.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Mail,
  RefreshCw,
  Image,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

const ResponsesTab = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [viewDialog, setViewDialog] = useState({ open: false, response: null });
  const [processingAction, setProcessingAction] = useState(null);
  const { toast } = useToast();

  const fetchResponses = async (currentPage = 1) => {
    try {
      const data = await redPortraitService.getResults(currentPage, 20);
      setResponses(data.results);
      setPagination(data.pagination);
      setPage(currentPage);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les portraits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessingAction(`delete-${id}`);
    try {
      await redPortraitService.deleteResult(id);
      toast({
        title: "Succès",
        description: "Portrait supprimé avec succès",
      });
      fetchResponses(page);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le portrait",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleToggleVisibility = async (id) => {
    setProcessingAction(`visibility-${id}`);
    try {
      await redPortraitService.toggleVisibility(id);
      fetchResponses(page);
      toast({
        title: "Succès",
        description: "Visibilité modifiée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResendEmail = async (id) => {
    setProcessingAction(`email-${id}`);
    try {
      await redPortraitService.resendEmail(id);
      toast({
        title: "Succès",
        description: "Email renvoyé avec succès",
      });
      fetchResponses(page);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Portraits générés ({pagination?.total || 0})
        </h2>
        <Button onClick={() => fetchResponses(page)} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {responses.length === 0 ? (
        <Card className="p-8 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Aucun portrait généré pour le moment</p>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response._id}>
                  <TableCell>
                    {new Date(response.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{response.name}</TableCell>
                  <TableCell>{response.email}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {response.accessCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {response.originalImageUrl && (
                        <Badge variant="outline" className="text-xs">
                          Original
                        </Badge>
                      )}
                      {response.generatedImageUrl && (
                        <Badge className="text-xs bg-red-600">
                          Rouge&Noir
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {response.isVisibleOnScreen && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      )}
                      {response.emailSent ? (
                        <Badge className="text-xs bg-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                      ) : response.emailError ? (
                        <Badge variant="destructive" className="text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Erreur
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          En attente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewDialog({ open: true, response })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleVisibility(response._id)}
                        disabled={processingAction === `visibility-${response._id}`}
                      >
                        {processingAction === `visibility-${response._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : response.isVisibleOnScreen ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResendEmail(response._id)}
                        disabled={
                          !response.generatedImageUrl ||
                          processingAction === `email-${response._id}`
                        }
                      >
                        {processingAction === `email-${response._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteDialog({ open: true, id: response._id })}
                        disabled={processingAction === `delete-${response._id}`}
                      >
                        {processingAction === `delete-${response._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => fetchResponses(page - 1)}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4">
                Page {page} sur {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchResponses(page + 1)}
                disabled={page === pagination.pages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce portrait ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteDialog.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, response: null })}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails du portrait</DialogTitle>
          </DialogHeader>
          {viewDialog.response && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium">{viewDialog.response.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{viewDialog.response.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {new Date(viewDialog.response.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temps de traitement</p>
                  <p className="font-medium">
                    {viewDialog.response.processingTime
                      ? `${(viewDialog.response.processingTime / 1000).toFixed(2)}s`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {viewDialog.response.originalImageUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Image originale</p>
                    <img
                      src={viewDialog.response.originalImageUrl}
                      alt="Original"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(viewDialog.response.originalImageUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                )}
                {viewDialog.response.generatedImageUrl && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Portrait Rouge & Noir</p>
                    <img
                      src={viewDialog.response.generatedImageUrl}
                      alt="Généré"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(viewDialog.response.generatedImageUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>

              {viewDialog.response.emailError && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Erreur email : {viewDialog.response.emailError}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponsesTab;