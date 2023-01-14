import axios, {AxiosError, AxiosResponse} from "axios";
import {toast} from "react-hot-toast";
import {baseURL} from "./URLs";

interface requestInterface {
  url: string;
  params?: object;
  reqData?: object;
  showToast?: boolean;
}

interface responseWithMessage {
  success?: string;
  error?: string;
}

interface errorInterface {
  data: undefined;
  error: string;
  status: number;
}

const client = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{error: string}>) => {
    if (error.response) {
      if (error.response.data.error) {
        return Promise.reject({
          ...error.response.data,
          status: error.response.status,
        });
      } else {
        return Promise.reject({
          error: "An Internal Error has occurred..",
          status: error.response.status,
        });
      }
    } else {
      return Promise.reject({
        error: "Error Connecting to the server..",
        status: undefined,
      });
    }
  }
);

const postRequest = async <T,>({
  url,
  reqData = {},
  showToast = true,
}: requestInterface) => {
  try {
    let response: AxiosResponse = await client({
      method: "POST",
      url: url,
      data: reqData,
    });
    const {data, status}: {data: T & responseWithMessage; status: number} =
      response;
    if (showToast && data.success) {
      toast.success(data.success);
    }
    return {data, status, error: undefined};
  } catch (err: any) {
    const error = err as errorInterface;
    if (showToast && err.error) {
      toast.error(err.error);
    }
    return error;
  }
};

const getRequest = <T,>({
  url,
  params = {},
  showToast = false,
}: requestInterface) =>
  (async () => {
    try {
      let response: AxiosResponse = await client({
        method: "GET",
        url: url,
        params: params,
      });
      const {data, status}: {data: T & responseWithMessage; status: number} =
        response;
      if (showToast && data.success) {
        toast.success(data.success);
      }
      return {data, status, error: undefined};
    } catch (err: any) {
      const error = err as errorInterface;
      if (showToast && err.error) {
        toast.error(err.error);
      }
      return error;
    }
  })();

export {postRequest, getRequest, client};
