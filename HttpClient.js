class HttpClient {
  async get(url, headers) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return response.json();
  }

  async post(url, body, headers) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }
}

export { HttpClient };