import { useEffect, useState } from "react";
import claService from "@/services/cla.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ResultSheet from "./ResultSheet";

export default function ResponsesTab() {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [totalResults, setTotalResults] = useState(null);
  const limit = 8;

  //Sheet management
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchResponses = async (currentPage, currentLimit) => {
    try {
      console.log("the req", currentPage, limit);
      const data = await claService.getResults(currentPage, limit);
      console.log(data);
      setResponses(data);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
    } catch (err) {
      console.error("Erreur lors du chargement des réponses :", err);
    } finally {
      setIsLoading(false);
    }
  };

  //FUNCTIONS
  // Move to the page number
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  useEffect(() => {
    fetchResponses(page, limit);
  }, [page]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Réponses des utilisateurs</h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-md" />
            ))}
        </div>
      ) : (
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Réponses</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.results.map((r) => (
              <TableRow
                key={r._id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => {
                  setSelectedResponse(r);
                  setSheetOpen(true);
                }}
              >
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.gender}</TableCell>
                <TableCell>{r.answers.join(", ")}</TableCell>
                <TableCell>
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={`Avatar de ${r.name}`}
                      className="w-16 h-16 object-cover rounded shadow"
                    />
                  ) : (
                    <span className="text-muted-foreground italic">
                      Pas d'image
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(r.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Bottom block with the users displayed count and the navigation throw pages buttons */}
      <div className="flex justify-between items-center w-full py-4">
        <p className="font-thin text-sm italic">{totalResults} réponses </p>
        <div>
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant="outline"
            className="mx-2"
          >
            Prev
          </Button>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            variant="outline"
            className="mx-2"
          >
            Next
          </Button>
        </div>
      </div>
      {selectedResponse && (
        <ResultSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          response={selectedResponse}
        />
      )}
    </div>
  );
}
