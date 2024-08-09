import env from "@/validation/env-validation";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ToManyRequestError,
  UnauthorizedError,
} from "./http-errors";

type customOptions = RequestInit & { baseURL?: string | undefined };

class HttpError extends Error {
  status: number;
  payload: any;

  constructor({ status, payload }: { status: number; payload: any }) {
    super("Http Error");
    this.status = status;
    this.payload = payload;
  }
}

const request = async <Response>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  options?: customOptions
) => {
  const baseURL =
    options?.baseURL === undefined
      ? env.NEXT_PUBLIC_SERVER_URL
      : options.baseURL;

  const baseHeaders = {
    "Content-Type": "application/json",
  };

  const body = options?.body ? JSON.stringify(options.body) : undefined;

  const fullUrl = url.startsWith("/")
    ? `${baseURL}${url}`
    : `${baseURL}/${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  let payload: Response;

  if (contentType && contentType.includes("application/json")) {
    payload = await res.json();
  } else {
    payload = (await res.text()) as unknown as Response;
  }

  const data = {
    status: res.status,
    payload,
  };

  if (!res.ok) {
    const errorMsg =
      payload && typeof payload === "object" && "message" in payload
        ? (payload.message as string)
        : "An error occurred";

    switch (res.status) {
      case 400:
        throw new BadRequestError(errorMsg);
      case 401:
        throw new UnauthorizedError(errorMsg);
      case 404:
        throw new NotFoundError(errorMsg);
      case 409:
        throw new ConflictError(errorMsg);
      case 429:
        throw new ToManyRequestError(errorMsg);
      default:
        throw new HttpError(data);
    }
  }

  return data;
};

const http = {
  get<Response>(
    url: string,
    options?: Omit<customOptions, "body"> | undefined
  ) {
    return request<Response>("GET", url, options);
  },

  post<Response>(
    url: string,
    body?: any,
    options?: Omit<customOptions, "body"> | undefined
  ) {
    return request<Response>("POST", url, { ...options, body });
  },

  patch<Response>(
    url: string,
    body: any,
    options?: Omit<customOptions, "body"> | undefined
  ) {
    return request<Response>("PATCH", url, { ...options, body });
  },

  delete<Response>(
    url: string,
    body: any,
    options?: Omit<customOptions, "body"> | undefined
  ) {
    return request<Response>("DELETE", url, { ...options, body });
  },
};

export default http;
