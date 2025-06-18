import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class AstronautService {
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

  // ✅ GET /astronaut/config
  getConfig = async () => {
    const res = await this.api.get("/astronaut/config");
    return res.data;
  };

  // ✅ POST /astronaut/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/astronaut/config", requestBody);
    return res.data;
  };

  // ✅ POST /astronaut/submit
  submitResponse = async (formData) => {
    const res = await this.api.post("/astronaut/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // ✅ GET /astronaut/results
  getResults = async (page, limit) => {
    const res = await this.api.get(
      `/astronaut/results?page=${page}&limit=${limit}`
    );
    return res.data;
  };

  // ✅ DELETE /astronaut/results/:id
  deleteSubmission = async (id) => {
    const res = await this.api.delete(`/astronaut/results/${id}`);
    return res.data;
  };
}

// Création d'une instance unique du service
const astronautService = new AstronautService();

export default astronautService;
