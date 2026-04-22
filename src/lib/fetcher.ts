export const fetcher = <T = unknown>(url: string): Promise<T> =>
  fetch(url, { credentials: "same-origin" }).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`);
    }
    return res.json() as Promise<T>;
  });
