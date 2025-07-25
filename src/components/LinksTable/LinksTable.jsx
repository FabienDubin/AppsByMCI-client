import React, { useEffect, useMemo, useState } from "react";
import linksService from "@/services/links.service";
import _ from "lodash";

//COMPONENTS
import LinksSheet from "@/components/LinksTable/LinksSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

//ICONS
import {
  ArrowUpDown,
  ChevronDown,
  Plus,
  Copy,
  Calendar,
  Edit,
  RotateCcw,
  Trash2,
  ExternalLink,
  Link,
  File,
  FileText,
  Archive,
  Image,
  Video,
  MoreHorizontal,
} from "lucide-react";

//TABLE FORMATTING
const columns = [
  { label: "Titre", key: "title" },
  { label: "Type", key: "type" },
  { label: "Slug", key: "slug" },
  { label: "Statut", key: "displayStatus" },
  { label: "Créé le", key: "createdAt" },
  { label: "Actions", key: "actions", sortable: false },
];

const LinksTable = () => {
  const { toast } = useToast();

  // STATES
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [selectedLink, setSelectedLink] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // DEBOUNCED SEARCH
  const debouncedSearch = useMemo(
    () =>
      _.debounce((searchTerm) => {
        if (searchTerm.trim()) {
          performSearch(searchTerm);
        } else {
          fetchLinks();
        }
      }, 300),
    [currentPage, sortBy, order]
  );

  // EFFECTS
  useEffect(() => {
    fetchLinks();
  }, [currentPage, sortBy, order]);

  useEffect(() => {
    debouncedSearch(search);
    return () => debouncedSearch.cancel();
  }, [search, debouncedSearch]);

  // FUNCTIONS
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await linksService.getAllLinks(
        currentPage,
        10,
        sortBy,
        order
      );
      setLinks(response.data.links);
      setTotalPages(response.data.totalPages);
      setTotalLinks(response.data.totalLinks);
    } catch (error) {
      console.error("Erreur lors du chargement des liens:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await linksService.searchLinks(searchTerm);
      setLinks(response.data.links);
      setTotalPages(1);
      setTotalLinks(response.data.links.length);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (!column.sortable && column.sortable !== undefined) return;

    if (sortBy === column.key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column.key);
      setOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleCopyUrl = async (link) => {
    try {
      await linksService.copyToClipboard(link.fullUrl);
      toast({
        title: "Copié !",
        description: "L'URL a été copiée dans le presse-papier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'URL",
        variant: "destructive",
      });
    }
  };

  const handleCopySubscription = async (link) => {
    try {
      await linksService.copyToClipboard(link.fullSubscriptionUrl);
      toast({
        title: "Copié !",
        description: "L'URL d'abonnement a été copiée dans le presse-papier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'URL d'abonnement",
        variant: "destructive",
      });
    }
  };

  const handleResetSchedule = async (link) => {
    try {
      await linksService.resetLinkSchedule(link._id);
      toast({
        title: "Succès",
        description: "La planification a été remise à zéro",
      });
      fetchLinks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de remettre à zéro la planification",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (link) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le lien "${link.title}" ?`
      )
    ) {
      return;
    }

    try {
      await linksService.deleteLink(link._id);
      toast({
        title: "Succès",
        description: "Le lien a été supprimé",
      });
      fetchLinks();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (link) => {
    setSelectedLink(link);
    setIsCreating(false);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedLink(null);
    setIsCreating(true);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedLink(null);
    setIsCreating(false);
    fetchLinks();
  };

  const getTypeIcon = (type, fileType) => {
    if (type === "url") return <Link className="h-4 w-4" />;

    const iconMap = {
      ics: <Calendar className="h-4 w-4" />,
      pdf: <FileText className="h-4 w-4" />,
      zip: <Archive className="h-4 w-4" />,
      jpg: <Image className="h-4 w-4" />,
      jpeg: <Image className="h-4 w-4" />,
      png: <Image className="h-4 w-4" />,
      gif: <Image className="h-4 w-4" />,
      webp: <Image className="h-4 w-4" />,
      mp4: <Video className="h-4 w-4" />,
      avi: <Video className="h-4 w-4" />,
      mov: <Video className="h-4 w-4" />,
    };

    return iconMap[fileType] || <File className="h-4 w-4" />;
  };

  const getStatusBadge = (displayStatus) => {
    const statusConfig = linksService.getStatusDisplay(displayStatus);
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.color}>
        {statusConfig.text}
      </Badge>
    );
  };

  const getTypeBadge = (type, fileType, isGeneratedIcs) => {
    const typeConfig = linksService.getTypeDisplay(
      type,
      fileType,
      isGeneratedIcs
    );
    return (
      <Badge className={typeConfig.color}>
        {getTypeIcon(type, fileType)}
        <span className="ml-1">{typeConfig.text}</span>
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && links.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with search and actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher des liens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Colonnes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns[column.key]}
                  onCheckedChange={() => handleColumnVisibility(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau lien
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {totalLinks} lien{totalLinks > 1 ? "s" : ""} au total
          </TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map(
                (column) =>
                  visibleColumns[column.key] && (
                    <TableHead
                      key={column.key}
                      className={
                        column.sortable !== false
                          ? "cursor-pointer hover:bg-gray-50"
                          : ""
                      }
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable !== false && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  {search
                    ? "Aucun lien trouvé pour cette recherche"
                    : "Aucun lien créé"}
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link._id}>
                  {visibleColumns.title && (
                    <TableCell className="font-medium">{link.title}</TableCell>
                  )}
                  {visibleColumns.type && (
                    <TableCell>
                      {getTypeBadge(
                        link.type,
                        link.fileType,
                        link.isGeneratedIcs
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.slug && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {link.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(link.fullUrl, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.displayStatus && (
                    <TableCell>{getStatusBadge(link.displayStatus)}</TableCell>
                  )}
                  {visibleColumns.createdAt && (
                    <TableCell>{formatDate(link.createdAt)}</TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyUrl(link)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copier URL
                          </DropdownMenuItem>

                          {link.fileType === "ics" &&
                            link.allowCalendarSubscription && (
                              <DropdownMenuItem
                                onClick={() => handleCopySubscription(link)}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Copier URL abonnement
                              </DropdownMenuItem>
                            )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => handleEdit(link)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Éditer
                          </DropdownMenuItem>

                          {(link.publishDate || link.unpublishDate) && (
                            <DropdownMenuItem
                              onClick={() => handleResetSchedule(link)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reset dates
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleDelete(link)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Sheet for create/edit */}
      <LinksSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        link={selectedLink}
        isCreating={isCreating}
      />
    </div>
  );
};

export default LinksTable;
