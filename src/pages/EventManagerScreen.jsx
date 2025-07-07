import React, { useState, useEffect, useRef } from "react";
import screenService from "@/services/screen.service";

const EventManagerScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  // Configuration
  const COLUMNS_COUNT = 3; // Modifiable facilement
  const SCROLL_SPEED = 1; // pixels par frame
  const REFRESH_INTERVAL = 5000; // 5 secondes pour vérifier nouvelles images

  // Récupérer les images visibles
  const fetchImages = async () => {
    try {
      const data = await screenService.getScreenImages(100);
      setImages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll automatique avec boucle infinie
  useEffect(() => {
    if (images.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAnimation = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Si on arrive en bas, on repart en haut
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        container.scrollTop = 0;
      } else {
        container.scrollTop += SCROLL_SPEED;
      }
    };

    const intervalId = setInterval(scrollAnimation, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [images]);

  // Afficher immédiatement dès qu'on a au moins une image
  useEffect(() => {
    if (images.length > 0) {
      setLoading(false);
    }
  }, [images]);

  // Refresh périodique des images
  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement des images...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl text-center">
          <div className="mb-4">🎭</div>
          <div>En attente des premières créations...</div>
        </div>
      </div>
    );
  }

  // Dupliquer les images pour créer un effet de boucle infinie
  const duplicatedImages = [...images, ...images];

  // Répartir les images dans les colonnes
  const distributeImages = (images, columnCount) => {
    const columns = Array.from({ length: columnCount }, () => []);
    images.forEach((image, index) => {
      columns[index % columnCount].push(image);
    });
    return columns;
  };

  const imageColumns = distributeImages(duplicatedImages, COLUMNS_COUNT);

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden relative">
      {/* Container scrollable avec masonry */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Layout masonry avec colonnes flexbox et décalage */}
        <div className="flex gap-4 p-4">
          {imageColumns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="flex-1 flex flex-col gap-4"
              style={{
                marginTop: `${(columnIndex % 2) * 100}px`, // Décalage progressif
              }}
            >
              {column.map((image, imageIndex) => (
                <div
                  key={`${image._id}-${columnIndex}-${imageIndex}`}
                  className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg"
                >
                  {image.generatedImageUrl && (
                    <img
                      src={image.generatedImageUrl}
                      alt={`Création de ${image.name}`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Overlay avec infos */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="text-white">
                      <div className="font-medium text-sm truncate">
                        {image.name}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        {new Date(image.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Compteur d'images */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {images.length} création{images.length > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default EventManagerScreen;
