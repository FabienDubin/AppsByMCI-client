import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import powerUpService from "@/services/powerup.service";
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
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";

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
      const data = await powerUpService.getResults(page, 10);
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
      await powerUpService.deleteSubmission(selectedResponse._id);
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

  const renderEmailStatus = (r) => {
    if (r.emailSent) {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" /> Envoyé
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-yellow-600">
        <Clock className="w-4 h-4" /> Non envoyé
      </span>
    );
  };

  const getProfileBadgeColor = (profile) => {
    switch (profile) {
      case "catalyseur":
        return "bg-orange-500";
      case "analyseur":
        return "bg-blue-500";
      case "acceleratrice":
        return "bg-amber-500";
      case "visionnaire":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Soumissions Power Up ({totalResults} au total)
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
                    <TableHead>Profil</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut email</TableHead>
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
                      <TableCell>
                        <Badge className={getProfileBadgeColor(r.profile)}>
                          {r.profileName || r.profile}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{r.email}</span>
                      </TableCell>
                      <TableCell>{renderEmailStatus(r)}</TableCell>
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
                                <div className="flex items-center gap-2 mb-4">
                                  <Badge
                                    className={getProfileBadgeColor(
                                      selectedResponse.profile
                                    )}
                                  >
                                    {selectedResponse.profileName}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedResponse.originalImageUrl && (
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Photo originale
                                      </h4>
                                      <img
                                        src={selectedResponse.originalImageUrl}
                                        alt="Original"
                                        className="rounded-lg"
                                      />
                                    </div>
                                  )}
                                  {selectedResponse.generatedImageUrl && (
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Avatar généré
                                      </h4>
                                      <img
                                        src={selectedResponse.generatedImageUrl}
                                        alt="Generated"
                                        className="rounded-lg"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Scores
                                    </h4>
                                    {selectedResponse.scores && (
                                      <div className="space-y-1 text-sm">
                                        <div>
                                          Catalyseur:{" "}
                                          {selectedResponse.scores.catalyseur}
                                        </div>
                                        <div>
                                          Analyseur:{" "}
                                          {selectedResponse.scores.analyseur}
                                        </div>
                                        <div>
                                          Accélératrice:{" "}
                                          {selectedResponse.scores.acceleratrice}
                                        </div>
                                        <div>
                                          Visionnaire:{" "}
                                          {selectedResponse.scores.visionnaire}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Réponses
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      {selectedResponse.answers?.map((a, i) => (
                                        <div key={i}>
                                          Q{i + 1}: {a}
                                        </div>
                                      ))}
                                    </div>
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
                                  </div>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
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
