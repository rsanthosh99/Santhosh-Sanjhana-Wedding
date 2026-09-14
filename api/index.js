export const config = {
  runtime: 'edge',
};

import server from '../dist/server/server.js';

export default function (req, ctx) {
  return server.fetch(req, ctx);
}
