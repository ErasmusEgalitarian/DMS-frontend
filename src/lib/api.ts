import axios, {AxiosRequestConfig} from "axios";


const API_BASE_URL = 'https://674a-2a02-a44a-8e25-1-ad14-2a7d-c08c-6475.ngrok-free.app';

const globalConfig: AxiosRequestConfig = {
  headers: {
    "ngrok-skip-browser-warning": "placeholder",
  },
};


export async function fetchMeasurementsByUserId(userId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/measurements`, {
      params: {user_id: userId},
      ...globalConfig
    });
    return response.data; // Return the JSON data
  } catch (error) {
    console.error("Error fetching measurements:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function fetchWastePickers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/waste-pickers`, globalConfig);
    return response.data; // Return the JSON data
  } catch (error) {
    console.error("Error fetching waste pickers:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}


export async function fetchWastePickerById(id: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/waste-pickers/${id}`, globalConfig);
    return response.data; // Return the JSON data
  } catch (error) {
    console.error("Error fetching waste picker:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
