import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class ScreenService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });
  }

  // GET /eventmanager/screen/images
  getScreenImages = async (limit = 100) => {
    const res = await this.api.get(
      `/eventmanager/screen/images?limit=${limit}`
    );
    return res.data;
  };
}

const screenService = new ScreenService();
export default screenService;
