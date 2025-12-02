import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class PowerUpService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    // Automatic JWT token injection if present
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

  // GET /powerup/config
  getConfig = async () => {
    const res = await this.api.get("/powerup/config");
    return res.data;
  };

  // POST /powerup/config
  updateConfig = async (requestBody) => {
    const res = await this.api.post("/powerup/config", requestBody);
    return res.data;
  };

  // POST /powerup/submit
  submitResponse = async (formData) => {
    const res = await this.api.post("/powerup/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // GET /powerup/results
  getResults = async (page, limit) => {
    const res = await this.api.get(
      `/powerup/results?page=${page}&limit=${limit}`
    );
    return res.data;
  };

  // DELETE /powerup/results/:id
  deleteSubmission = async (id) => {
    const res = await this.api.delete(`/powerup/results/${id}`);
    return res.data;
  };
}

const powerUpService = new PowerUpService();
export default powerUpService;
