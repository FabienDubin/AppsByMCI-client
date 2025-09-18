import React, { useState, useEffect, useRef } from "react";
import redPortraitService from "@/services/redportrait.service";
import { Palette } from "lucide-react";

const RedPortraitScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const COLUMNS_COUNT = 4;
  const SCROLL_SPEED = 1;
  const REFRESH_INTERVAL = 5000;

  const fetchImages = async () => {
    try {
      const data = await redPortraitService.getScreenImages(100);
      setImages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (images.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAnimation = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        container.scrollTop = 0;
      } else {
        container.scrollTop += SCROLL_SPEED;
      }
    };

    const intervalId = setInterval(scrollAnimation, 16);
    return () => clearInterval(intervalId);
  }, [images]);

  useEffect(() => {
    if (images.length > 0) {
      setLoading(false);
    }
  }, [images]);

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-2xl animate-pulse">
          Chargement des portraits...
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-2xl text-center">
          <Palette className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <div>En attente des premiers portraits...</div>
          <div className="text-sm text-gray-600 mt-2">
            Créez votre portrait sur /redportrait
          </div>
        </div>
      </div>
    );
  }

  const duplicatedImages = [...images, ...images];

  const distributeImages = (images, columnCount) => {
    const columns = Array.from({ length: columnCount }, () => []);
    images.forEach((image, index) => {
      columns[index % columnCount].push(image);
    });
    return columns;
  };

  const imageColumns = distributeImages(duplicatedImages, COLUMNS_COUNT);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-red-950/20 pointer-events-none" />
      
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

        <div className="flex gap-3 p-3">
          {imageColumns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="flex-1 flex flex-col gap-3"
              style={{
                marginTop: `${(columnIndex % 2) * 120}px`,
              }}
            >
              {column.map((image, imageIndex) => (
                <div
                  key={`${image._id}-${columnIndex}-${imageIndex}`}
                  className="relative group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {image.generatedImageUrl && (
                      <img
                        src={image.generatedImageUrl}
                        alt={`Portrait de ${image.name}`}
                        className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="text-white">
                        <div className="font-bold text-lg text-red-400">
                          {image.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
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

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-red-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      Rouge & Noir
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-900/50">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-red-500" />
            <span className="text-red-400 font-bold text-lg">Red Portrait</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm text-red-400 px-3 py-1 rounded-full text-sm border border-red-900/50">
          {images.length} portrait{images.length > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default RedPortraitScreen;