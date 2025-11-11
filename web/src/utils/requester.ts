import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export const request: AxiosInstance = axios.create({
  baseURL: "/api",
});

export type Params = Record<string, string | number | boolean | null | undefined | Object>;

export class Requester {
  private instance: AxiosInstance;
  private baseUri: string;

  constructor(instance: AxiosInstance, baseUri: string) {
    this.instance = instance;
    this.baseUri = baseUri;
  }

  get<T>(uri: string = "", params: Params = {}): Promise<AxiosResponse<T>> {
    // Let axios handle query-string encoding
    return this.instance.get<T>(`${this.baseUri}${uri}`, { params });
  }

  post<T, D>(data?: D, params: Params = {}): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(this.baseUri, data, params);
  }

  patch<T, D>(data?: D): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(this.baseUri, data);
  }

  put<T, D>(data?: D): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(this.baseUri, data);
  }

  delete<T>(): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(this.baseUri);
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
