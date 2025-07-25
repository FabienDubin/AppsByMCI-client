import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import linksService from "@/services/links.service";

//COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

//ICONS
import { 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Calendar, 
  Image as ImageIcon,
  FileText,
  Video,
  Archive,
  Link as LinkIcon,
  Eye,
  Copy
} from "lucide-react";

const LinkResolver = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (slug) {
      resolveLink();
    }
  }, [slug]);

  // Auto-download pour ZIP et ICS
  useEffect(() => {
    if (linkData && (linkData.fileType === 'zip' || linkData.fileType === 'ics')) {
      const serveUrl = linksService.getServeUrl(slug);
      window.location.href = serveUrl;
    }
  }, [linkData, slug]);

  const resolveLink = async () => {
    try {
      setLoading(true);
      setError(null);
      setIframeError(false);
      
      const result = await linksService.resolveLinkData(slug);
      
      if (result.success) {
        setLinkData(result.data.link);
      } else {
        setError(result.error);
      }
      
    } catch (err) {
      console.error("Erreur lors de la résolution du lien:", err);
      setError("Erreur lors de la résolution du lien");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const serveUrl = linksService.getServeUrl(slug);
    window.open(serveUrl, '_blank');
  };

  const handleCopyUrl = async () => {
    try {
      const fullUrl = linksService.getFullUrl(slug);
      await navigator.clipboard.writeText(fullUrl);
      // Optionnel: afficher une notification de succès
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleOpenExternal = () => {
    if (linkData?.type === 'url') {
      window.open(linkData.url, '_blank');
    } else {
      const backendUrl = linksService.getBackendUrl(slug);
      window.open(backendUrl, '_blank');
    }
  };

  const renderContent = () => {
    if (!linkData) return null;

    // Iframe plein écran pour TOUS les types
    if (iframeError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Ce contenu ne peut pas être affiché dans un cadre
            </p>
            <Button onClick={handleOpenExternal} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <iframe
        src={linkData.url}
        className="w-screen h-screen border-none"
        title={linkData.title}
        onError={() => setIframeError(true)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-links"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Lien non disponible</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              <strong>Lien demandé :</strong> {slug}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={resolveLink}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Si ce lien devrait fonctionner, contactez l'administrateur.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!linkData) return null;

  // Layout uniforme : iframe plein écran pour TOUS les types
  return renderContent();
};

export default LinkResolver;