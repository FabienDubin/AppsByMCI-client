import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class YearbookService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    // Ajout automatique du token JWT pour chaque requête
    this.api.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${storedToken}`,
        };
      }

      return config;
    });
  }

  // ✅ GET /yearbook/config
  getConfig = async () => {
    const res = await this.api.get("/yearbook/config");
    return res.data;
  };

  // ✅ POST /yearbook/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/yearbook/config", requestBody);
    return res.data;
  };

  // ✅ POST /yearbook/submit
  submitPhoto = async (formData) => {
    const res = await this.api.post("/yearbook/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // ✅ GET /yearbook/results
  getResults = async (page = 1, limit = 10) => {
    const res = await this.api.get(
      `/yearbook/results?page=${page}&limit=${limit}`
    );
    return res.data;
  };
}

// Création d'une instance unique du service
const yearbookService = new YearbookService();

export default yearbookService;
