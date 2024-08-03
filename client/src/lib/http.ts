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
      ? process.env.NEXT_PUBLIC_SERVER_URL
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
  });

  const payload: Response = await res.json();

  const data = {
    status: res.status,
    payload,
  };

  if (!res.ok) {
    throw new HttpError(data);
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
    body: any,
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

// I did not write this myself :)
