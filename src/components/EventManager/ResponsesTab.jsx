import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import eventManagerService from "@/services/eventmanager.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Tooltip } from "@radix-ui/react-tooltip";

const ResponsesTab = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const { toast } = useToast();

  const fetchResponses = async (page = 1) => {
    try {
      setLoading(true);
      const data = await eventManagerService.getResults(page, 10);
      setResponses(data.results || []);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les soumissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      fetchResponses(p);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = async () => {
    if (!selectedResponse) return;
    try {
      await eventManagerService.deleteSubmission(selectedResponse._id);
      toast({ title: "Supprimé", description: "Soumission supprimée" });
      fetchResponses(currentPage);
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (responseId) => {
    try {
      const result = await eventManagerService.toggleVisibility(responseId);
      toast({
        title: "Visibilité mise à jour",
        description: result.isVisibleOnScreen
          ? "Image visible sur l'écran"
          : "Image masquée de l'écran",
      });
      fetchResponses(currentPage);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      });
    }
  };

  const renderEmailStatus = (r) => {
    if (r.emailSent) {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" /> Envoyé
        </span>
      );
    }
    if (r.emailError) {
      return (
        <Tooltip>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="w-4 h-4" />
            Erreur
            <span
              className="ml-1 text-xs underline cursor-help"
              title={r.emailError}
            >
              (voir)
            </span>
          </span>
        </Tooltip>
      );
    }
    return (
      <span className="flex items-center gap-1 text-yellow-600">
        <Clock className="w-4 h-4" /> En attente
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Soumissions Event Manager ({totalResults} au total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune soumission
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Réponses</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut email</TableHead>
                    <TableHead>Écran</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.gender}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {Array.isArray(r.answers) ? r.answers.join(", ") : ""}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{r.email}</span>
                      </TableCell>
                      <TableCell>{renderEmailStatus(r)}</TableCell>
                      <TableCell>
                        <Button
                          variant={r.isVisibleOnScreen ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleVisibility(r._id)}
                        >
                          {r.isVisibleOnScreen ? (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Masqué
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResponse(r)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Soumission de {selectedResponse?.name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedResponse && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedResponse.originalImageUrl && (
                                    <img
                                      src={selectedResponse.originalImageUrl}
                                      alt="Original"
                                      className="rounded-lg"
                                    />
                                  )}
                                  {selectedResponse.generatedImageUrl && (
                                    <img
                                      src={selectedResponse.generatedImageUrl}
                                      alt="Generated"
                                      className="rounded-lg"
                                    />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Réponses
                                  </h4>
                                  <div className="space-y-1">
                                    {selectedResponse.answers.map((a, i) => (
                                      <div key={i}>
                                        Question {i + 1}: {a}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Email</h4>
                                  <div>
                                    <span className="font-mono">
                                      {selectedResponse.email}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    {renderEmailStatus(selectedResponse)}
                                    {selectedResponse.emailError && (
                                      <div className="text-xs text-red-600 mt-1">
                                        {selectedResponse.emailError}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {}}
                                    >
                                      <Trash2 />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirmation
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Supprimer cette soumission ?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Annuler
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500"
                                        onClick={handleDelete}
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsesTab;
