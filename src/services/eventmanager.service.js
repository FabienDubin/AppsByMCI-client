import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class EventManagerService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    // Ajout automatique du token JWT si présent
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

  // GET /eventmanager/config
  getConfig = async () => {
    const res = await this.api.get("/eventmanager/config");
    return res.data;
  };

  // POST /eventmanager/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/eventmanager/config", requestBody);
    return res.data;
  };

  // POST /eventmanager/submit
  submitResponse = async (formData) => {
    const res = await this.api.post("/eventmanager/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // GET /eventmanager/results
  getResults = async (page, limit) => {
    const res = await this.api.get(
      `/eventmanager/results?page=${page}&limit=${limit}`
    );
    return res.data;
  };

  // DELETE /eventmanager/results/:id
  deleteSubmission = async (id) => {
    const res = await this.api.delete(`/eventmanager/results/${id}`);
    return res.data;
  };
}

const eventManagerService = new EventManagerService();
export default eventManagerService;
