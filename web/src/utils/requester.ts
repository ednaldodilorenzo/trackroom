import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { store } from "@/store";
import { logout } from "@/store/authSlice";

const apiUrl = import.meta.env.VITE_API_URL || "/api";

export const request: AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Include cookies in requests
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      error.response.status === 403
    ) {
      // Unauthorized, dispatch logout action
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export type Params = Record<
  string,
  string | number | boolean | null | undefined | Object
>;

export class Requester {
  private instance: AxiosInstance;
  private baseUri: string;

  constructor(instance: AxiosInstance, baseUri: string) {
    this.instance = instance;
    this.baseUri = baseUri;
  }

  get<T>(
    uri: string = "",
    params: Params = {},
    url: string = this.baseUri
  ): Promise<AxiosResponse<T>> {
    // Let axios handle query-string encoding
    let queryParams = "";
    if(Object.keys(params).length > 0) {
      queryParams += "?";
      for (const [key, value] of Object.entries(params)) {
        queryParams += `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}&`;
      }
      queryParams = queryParams.slice(0, -1); // Remove trailing '&'
    }
    
    return this.instance.get<T>(`${url}${uri}${queryParams}`);
  }

  post<T, D>(
    data?: D,
    params: Params = {},
    url: string = this.baseUri,
    uri: string = ""
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(`${url}${uri}`, data, params);
  }

  postData<T, D>(
    url: string,
    data?: D,
    params: Params = {}
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, params);
  }

  patch<T, D>(data?: D, uri: string = ""): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(`${this.baseUri}${uri}`, data);
  }

  put<T, D>(
    data?: D,
    uri: string = "",
    params: Params = {},
    url: string = this.baseUri
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(`${url}/${uri}`, data, params);
  }

  putData<T, D>(
    url: string,
    data?: D,
    params: Params = {}
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, params);
  }

  delete<T>(uri: string = ""): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(`${this.baseUri}${uri}`);
  }
}

// export const requester = {
//   get<T>(
//     uri: string,
//     params: Params = {}
//   ): Promise<AxiosResponse<T>> {
//     // Let axios handle query-string encoding
//     return request.get<T>(uri, { params });
//   },
//   post<T, D>(
//     uri: string,
//     data?: D
//   ): Promise<AxiosResponse<T>> {
//     return request.post<T>(uri, data);
//   },
//   patch<T, D>(
//     url: string,
//     data?: D
//   ): Promise<AxiosResponse<T>> {
//     return request.patch<T>(url, data);
//   },
//   put<T, D>(
//     url: string,
//     data?: D
//   ): Promise<AxiosResponse<T>> {
//     return request.put<T>(url, data);
//   },
//   delete<T>(url: string): Promise<AxiosResponse<T>> {
//     return request.delete<T>(url);
//   },
// };

//export type Requester = typeof requester;
