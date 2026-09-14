import server from '../dist/server/server.js';

export default async function (req, res) {
  // If Vercel passes a standard Web Request natively
  if (req instanceof Request) {
    return server.fetch(req);
  }
  
  // Otherwise, adapt the Node.js IncomingMessage to a Web Request
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  
  const init = {
    method: req.method,
    headers: req.headers,
  };
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req;
    init.duplex = 'half';
  }
  
  const request = new Request(url, init);
  const response = await server.fetch(request);
  
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}
