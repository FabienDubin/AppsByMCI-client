import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class LinksService {
  constructor() {
    this.API_URL = API_URL || "http://localhost:5005";
    this.api = axios.create({
      baseURL: this.API_URL,
    });

    // Automatically set JWT token in the headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = { Authorization: `Bearer ${storedToken}` };
      }

      return config;
    });
  }

  // GET /links/all
  // Gets all links with pagination and sorting
  getAllLinks(page = 1, limit = 10, sortBy = "createdAt", order = "desc") {
    return this.api.get(
      `/links/all?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`
    );
  }

  // GET /links/search
  // Search links by title, slug or type
  searchLinks(query, type = "all", isActive) {
    let url = `/links/search?query=${encodeURIComponent(query)}`;
    if (type !== "all") {
      url += `&type=${type}`;
    }
    if (isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }
    return this.api.get(url);
  }

  // GET /links/:id
  // Get a single link by ID
  getLinkById(id) {
    return this.api.get(`/links/${id}`);
  }

  // POST /links/create
  // Create a new URL link
  createUrlLink(linkData) {
    return this.api.post("/links/create", linkData);
  }

  // POST /links/upload
  // Create a new link with file upload
  createFileLink(linkData, file) {
    const formData = new FormData();
    
    // Add all the link data to formData
    Object.keys(linkData).forEach(key => {
      if (linkData[key] !== null && linkData[key] !== undefined) {
        formData.append(key, linkData[key]);
      }
    });
    
    // Add the file
    if (file) {
      formData.append("file", file);
    }

    return this.api.post("/links/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // POST /links/generate-ics
  // Generate an ICS event and create the link
  generateIcsEvent(linkData) {
    return this.api.post("/links/generate-ics", linkData);
  }

  // PUT /links/update/:id
  // Update an existing link
  updateLink(id, linkData) {
    return this.api.put(`/links/update/${id}`, linkData);
  }

  // PUT /links/update-file/:id
  // Update a link with new file
  updateFileLink(id, linkData, file) {
    const formData = new FormData();
    
    // Add all the link data to formData
    Object.keys(linkData).forEach(key => {
      if (linkData[key] !== null && linkData[key] !== undefined) {
        formData.append(key, linkData[key]);
      }
    });
    
    // Add the file
    if (file) {
      formData.append("file", file);
    }

    return this.api.put(`/links/update-file/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // PUT /links/update-ics/:id
  // Update an ICS generated event
  updateIcsEvent(id, eventData) {
    return this.api.put(`/links/update-ics/${id}`, { eventData });
  }

  // PATCH /links/reset-schedule/:id
  // Reset the schedule of a link
  resetLinkSchedule(id) {
    return this.api.patch(`/links/reset-schedule/${id}`);
  }

  // DELETE /links/delete/:id
  // Delete a link by ID
  deleteLink(id) {
    return this.api.delete(`/links/delete/${id}`);
  }

  // UTILITY FUNCTIONS

  // Copy URL to clipboard
  copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      if (navigator.clipboard && window.isSecureContext) {
        // Use the modern Clipboard API
        navigator.clipboard.writeText(text)
          .then(() => resolve(true))
          .catch(err => reject(err));
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) {
            resolve(true);
          } else {
            reject(new Error('Copy command failed'));
          }
        } catch (err) {
          document.body.removeChild(textArea);
          reject(err);
        }
      }
    });
  }

  // Generate a slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Validate slug format
  isValidSlug(slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
  }

  // Get file extension from filename
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  // Get extension from mimetype
  getExtensionFromMimetype(mimetype) {
    const mimetypeMap = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/avi': '.avi',
      'video/mov': '.mov',
      'video/wmv': '.wmv',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
      'application/x-zip-compressed': '.zip',
      'text/calendar': '.ics'
    };
    
    return mimetypeMap[mimetype] || '';
  }

  // Check if file type is supported
  isSupportedFileType(file) {
    const supportedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/calendar'
    ];
    
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.pdf', '.zip', '.ics'];
    const fileExtension = '.' + this.getFileExtension(file.name);
    
    return supportedTypes.includes(file.type) || supportedExtensions.includes(fileExtension);
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get display status color and text
  getStatusDisplay(displayStatus) {
    const statusMap = {
      active: { text: 'Actif', color: 'bg-green-100 text-green-800', variant: 'default' },
      inactive: { text: 'Inactif', color: 'bg-gray-100 text-gray-800', variant: 'secondary' },
      scheduled: { text: 'Programmé', color: 'bg-blue-100 text-blue-800', variant: 'default' },
      expired: { text: 'Expiré', color: 'bg-red-100 text-red-800', variant: 'destructive' }
    };
    
    return statusMap[displayStatus] || statusMap.inactive;
  }

  // Get type display information
  getTypeDisplay(type, fileType, isGeneratedIcs) {
    if (type === 'url') {
      return { text: 'URL', icon: 'Link', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (type === 'file') {
      if (fileType === 'ics') {
        if (isGeneratedIcs) {
          return { text: 'Événement', icon: 'Calendar', color: 'bg-purple-100 text-purple-800' };
        }
        return { text: 'Calendrier', icon: 'Calendar', color: 'bg-indigo-100 text-indigo-800' };
      }
      
      // Other file types
      const fileTypeMap = {
        pdf: { text: 'PDF', icon: 'FileText', color: 'bg-red-100 text-red-800' },
        zip: { text: 'ZIP', icon: 'Archive', color: 'bg-yellow-100 text-yellow-800' },
        jpg: { text: 'Image', icon: 'Image', color: 'bg-green-100 text-green-800' },
        jpeg: { text: 'Image', icon: 'Image', color: 'bg-green-100 text-green-800' },
        png: { text: 'Image', icon: 'Image', color: 'bg-green-100 text-green-800' },
        gif: { text: 'Image', icon: 'Image', color: 'bg-green-100 text-green-800' },
        webp: { text: 'Image', icon: 'Image', color: 'bg-green-100 text-green-800' },
        mp4: { text: 'Vidéo', icon: 'Video', color: 'bg-pink-100 text-pink-800' },
        avi: { text: 'Vidéo', icon: 'Video', color: 'bg-pink-100 text-pink-800' },
        mov: { text: 'Vidéo', icon: 'Video', color: 'bg-pink-100 text-pink-800' },
      };
      
      return fileTypeMap[fileType] || { text: 'Fichier', icon: 'File', color: 'bg-gray-100 text-gray-800' };
    }
    
    return { text: 'Inconnu', icon: 'HelpCircle', color: 'bg-gray-100 text-gray-800' };
  }

  // Get full URL for link
  getFullUrl(slug) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/links/${slug}`;
  }

  // Get full subscription URL for calendar
  getFullSubscriptionUrl(slug) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/calendar/${slug}.ics`;
  }

  // ================================
  // NOUVELLES FONCTIONS POUR LINKRESOLVER
  // ================================

  // Résoudre les métadonnées d'un lien (pour le frontend)
  async resolveLinkData(slug) {
    try {
      const response = await this.api.get(`/links/resolve/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la résolution du lien:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Obtenir l'URL de service direct d'un lien
  getServeUrl(slug) {
    // Enlever le slash final s'il existe pour éviter les doubles slashes
    const baseUrl = this.API_URL.endsWith('/') ? this.API_URL.slice(0, -1) : this.API_URL;
    return `${baseUrl}/links/serve/${slug}`;
  }

  // Obtenir l'URL de téléchargement/affichage depuis le backend
  getBackendUrl(slug) {
    // Enlever le slash final s'il existe pour éviter les doubles slashes
    const baseUrl = this.API_URL.endsWith('/') ? this.API_URL.slice(0, -1) : this.API_URL;
    return `${baseUrl}/links/public/${slug}`;
  }

  // Vérifier si un type de fichier peut être affiché inline
  canDisplayInline(mimeType) {
    if (!mimeType) return false;
    
    const inlineTypes = [
      'image/',
      'application/pdf',
      'video/',
      'audio/',
      'text/plain'
    ];
    
    return inlineTypes.some(type => mimeType.startsWith(type));
  }

  // Obtenir le bon Content-Type pour l'affichage
  getContentTypeDisplay(mimeType, fileType) {
    const typeMap = {
      'application/pdf': 'PDF Document',
      'application/zip': 'Archive ZIP',
      'text/calendar': 'Fichier Calendrier',
      'image/jpeg': 'Image JPEG',
      'image/png': 'Image PNG',
      'image/gif': 'Image GIF',
      'image/webp': 'Image WebP',
      'video/mp4': 'Vidéo MP4',
      'video/avi': 'Vidéo AVI',
      'video/mov': 'Vidéo MOV'
    };
    
    return typeMap[mimeType] || `Fichier ${fileType?.toUpperCase() || 'inconnu'}`;
  }

  // Déterminer le mode d'affichage selon le type
  getDisplayMode(type, mimeType, fileType) {
    if (type === 'url') {
      return 'iframe'; // Ou 'redirect' selon les préférences
    }
    
    if (type === 'file') {
      if (mimeType?.startsWith('image/')) {
        return 'image';
      }
      
      if (mimeType === 'application/pdf') {
        return 'pdf';
      }
      
      if (mimeType?.startsWith('video/')) {
        return 'video';
      }
      
      if (fileType === 'ics') {
        return 'download';
      }
      
      if (mimeType === 'application/zip') {
        return 'download';
      }
    }
    
    return 'download'; // Par défaut
  }
}

// Create one instance of the service
const linksService = new LinksService();

export default linksService;