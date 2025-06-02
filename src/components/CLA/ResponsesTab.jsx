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
import { Skeleton } from "@/components/ui/skeleton";

export default function ResponsesTab() {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResponses = async () => {
    try {
      const data = await claService.getResults();
      setResponses(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réponses :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

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
            {responses.map((r) => (
              <TableRow key={r._id}>
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
    </div>
  );
}
