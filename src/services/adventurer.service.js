import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class AdventurerService {
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

  // ✅ GET /adventurer/config
  getConfig = async () => {
    const res = await this.api.get("/adventurer/config");
    return res.data;
  };

  // ✅ POST /adventurer/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/adventurer/config", requestBody);
    return res.data;
  };

  // ✅ POST /adventurer/submit
  submitResponse = async (formData) => {
    const res = await this.api.post("/adventurer/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // ✅ GET /adventurer/results
  getResults = async (page, limit) => {
    const res = await this.api.get(
      `/adventurer/results?page=${page}&limit=${limit}`
    );
    return res.data;
  };

  // ✅ DELETE /adventurer/results/:id
  deleteSubmission = async (id) => {
    const res = await this.api.delete(`/adventurer/results/${id}`);
    return res.data;
  };
}

// Création d'une instance unique du service
const adventurerService = new AdventurerService();

export default adventurerService;
