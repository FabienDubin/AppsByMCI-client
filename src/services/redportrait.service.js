import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class RedPortraitService {
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

  // GET /redportrait/config
  getConfig = async () => {
    const res = await this.api.get("/redportrait/config");
    return res.data;
  };

  // POST /redportrait/config
  updateConfig = async (config) => {
    const res = await this.api.post("/redportrait/config", config);
    return res.data;
  };

  // POST /redportrait/validate-code
  validateCode = async (code) => {
    const res = await this.api.post("/redportrait/validate-code", { code });
    return res.data;
  };

  // POST /redportrait/submit
  submitPortrait = async (formData) => {
    const res = await this.api.post("/redportrait/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  // GET /redportrait/results
  getResults = async (page = 1, limit = 20) => {
    const res = await this.api.get("/redportrait/results", {
      params: { page, limit },
    });
    return res.data;
  };

  // DELETE /redportrait/results/:id
  deleteResult = async (id) => {
    const res = await this.api.delete(`/redportrait/results/${id}`);
    return res.data;
  };

  // PUT /redportrait/results/:id/visibility
  toggleVisibility = async (id) => {
    const res = await this.api.put(`/redportrait/results/${id}/visibility`);
    return res.data;
  };

  // GET /redportrait/screen/images
  getScreenImages = async (limit = 100) => {
    const res = await this.api.get("/redportrait/screen/images", {
      params: { limit },
    });
    return res.data;
  };

  // POST /redportrait/results/:id/resend-email
  resendEmail = async (id) => {
    const res = await this.api.post(
      `/redportrait/results/${id}/resend-email`,
      {}
    );
    return res.data;
  };
}

const redPortraitService = new RedPortraitService();
export default redPortraitService;
