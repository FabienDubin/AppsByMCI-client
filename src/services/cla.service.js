import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class CLAService {
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

  // ✅ GET /cla/config
  getConfig = async () => {
    const res = await this.api.get("/cla/config");
    return res.data;
  };

  // ✅ POST /cla/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/cla/config", requestBody);
    return res.data;
  };

  // ✅ POST /cla/submit
  submitAnswer = async (requestBody) => {
    const res = await this.api.post("/cla/submit", requestBody);
    return res.data;
  };

  // ✅ GET /cla/results
  getResults = async (page, limit) => {
    const res = await this.api.get(`/cla/results?page=${page}&limit=${limit}`);
    return res.data;
  };
}

// Création d'une instance unique du service
const claService = new CLAService();

export default claService;
