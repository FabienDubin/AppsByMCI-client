import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import astronautService from "@/services/astronaut.service";
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
import { Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const ResponsesTab = () => {
  //STATES
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  //TOAST
  const { toast } = useToast();

  //FETCH RESPONSES
  const fetchResponses = async (page = 1) => {
    try {
      setLoading(true);
      const data = await astronautService.getResults(page, 10);
      setResponses(data.results || data.responses || []);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || data.total || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des réponses:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les soumissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  //HOOKS
  useEffect(() => {
    fetchResponses();
  }, []);

  //FUNCTIONS
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchResponses(newPage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteResponse = async () => {
    if (!selectedResponse) return;
    try {
      await astronautService.deleteSubmission(selectedResponse._id);
      fetchResponses(currentPage);
      setDialogOpen(false);
      setSelectedResponse(null);

      toast({
        title: "Supprimé !",
        description: "La soumission a été supprimée avec succès",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette soumission",
        variant: "destructive",
      });
    }
  };

  const getAnswersText = (answers) => {
    if (!answers || !Array.isArray(answers)) return "N/A";
    return answers.join(", ");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des réponses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Soumissions Profil d'Astronaute ({totalResults} au total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune soumission pour le moment
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
                    <TableHead>Code utilisé</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response._id}>
                      <TableCell className="font-medium">
                        {response.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.gender}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(response.createdAt)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {getAnswersText(response.answers)}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {response.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedResponse(response);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
                            <DialogHeader>
                              <DialogTitle>
                                Soumission de {response.name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedResponse && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedResponse.originalImageUrl && (
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Photo originale
                                      </h4>
                                      <img
                                        src={selectedResponse.originalImageUrl}
                                        alt="Photo originale"
                                        className="w-full rounded-lg shadow-md"
                                      />
                                    </div>
                                  )}
                                  {selectedResponse.generatedImageUrl && (
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Avatar d'astronaute généré
                                      </h4>
                                      <img
                                        src={selectedResponse.generatedImageUrl}
                                        alt="Avatar d'astronaute"
                                        className="w-full rounded-lg shadow-md"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Réponses au quiz d'astronaute
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedResponse.answers &&
                                    Array.isArray(selectedResponse.answers) ? (
                                      selectedResponse.answers.map(
                                        (answer, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-2"
                                          >
                                            <span className="text-sm font-medium">
                                              Question {index + 1}:
                                            </span>
                                            <Badge variant="outline">
                                              {answer}
                                            </Badge>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <span className="text-muted-foreground text-sm">
                                        Aucune réponse disponible
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {selectedResponse.prompt && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Prompt utilisé
                                    </h4>
                                    <div className="bg-muted p-3 rounded-lg text-sm">
                                      {selectedResponse.prompt}
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <strong>Date:</strong>{" "}
                                    {formatDate(selectedResponse.createdAt)}
                                  </div>
                                  <div>
                                    <strong>Genre:</strong>{" "}
                                    {selectedResponse.gender}
                                  </div>
                                  <div>
                                    <strong>Code:</strong>{" "}
                                    {selectedResponse.code}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="icon">
                                        <Trash2 />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Êtes-vous absolument sûr ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Cette action ne peut pas être annulée.
                                          Cela supprimera définitivement la
                                          soumission de {selectedResponse.name}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-500"
                                          onClick={() => handleDeleteResponse()}
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
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
