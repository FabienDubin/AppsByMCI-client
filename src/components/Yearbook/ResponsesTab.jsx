import React, { useState, useEffect } from "react";
import yearbookService from "@/services/yearbook.service";
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
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const ResponsesTab = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const fetchResponses = async (page = 1) => {
    try {
      setLoading(true);
      const data = await yearbookService.getResults(page, 10);
      setResponses(data.results);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error("Erreur lors du chargement des réponses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

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
          <CardTitle>Soumissions Yearbook ({totalResults} au total)</CardTitle>
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
                      <TableCell>{response.gender}</TableCell>
                      <TableCell>{formatDate(response.createdAt)}</TableCell>
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
                              onClick={() => setSelectedResponse(response)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Soumission de {response.name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedResponse && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Photo yearbook générée
                                    </h4>
                                    <img
                                      src={selectedResponse.generatedImageUrl}
                                      alt="Photo yearbook"
                                      className="w-full rounded-lg shadow-md"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Prompt utilisé
                                  </h4>
                                  <div className="bg-muted p-3 rounded-lg text-sm">
                                    {selectedResponse.prompt}
                                  </div>
                                </div>
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
