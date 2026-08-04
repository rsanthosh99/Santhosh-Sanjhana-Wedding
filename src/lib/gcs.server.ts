// Server-only helpers for reading photo listings out of Google Cloud Storage.
// Never import this from client code.

type GcsObject = { name: string; size?: string; updated?: string };

type ListResponse = { items?: GcsObject[]; nextPageToken?: string };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://storage.googleapis.com/storage/v1/b";

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)!;
  return bytes.buffer;
}

/** Mints a read-only GCS access token from a service-account key, if one is configured. */
async function getAccessToken(): Promise<string | null> {
  const raw = process.env["GCS_SERVICE_ACCOUNT_JSON"];
  if (!raw) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.value;

  const key = JSON.parse(raw) as { client_email: string; private_key: string };
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/devstorage.read_only",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(key.private_key.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  const assertion = `${header}.${claims}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google auth failed [${res.status}]: ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: now + json.expires_in };
  return json.access_token;
}

export function getBucket(): string | null {
  return process.env["GCS_BUCKET"] || null;
}

/** Lists every object name under a prefix (follows pagination). */
export async function listPrefix(bucket: string, prefix: string): Promise<string[]> {
  const token = await getAccessToken();
  const names: string[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${API}/${encodeURIComponent(bucket)}/o`);
    url.searchParams.set("prefix", prefix);
    url.searchParams.set("maxResults", "1000");
    url.searchParams.set("fields", "items(name),nextPageToken");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error(`Google Cloud Storage list failed [${res.status}]: ${await res.text()}`);
    }
    const json = (await res.json()) as ListResponse;
    for (const item of json.items ?? []) {
      if (!item.name.endsWith("/")) names.push(item.name);
    }
    pageToken = json.nextPageToken;
  } while (pageToken);

  return names;
}

export function publicUrl(bucket: string, objectName: string): string {
  const encoded = objectName.split("/").map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${bucket}/${encoded}`;
}

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif|heic)$/i;

export function isImage(name: string): boolean {
  return IMAGE_RE.test(name);
}
