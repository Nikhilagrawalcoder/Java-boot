# @envsync/sdk

Official TypeScript client for the [EnvSync](https://envsync.dev) REST API
(`/api/v1`). Works in Node.js 18+ and in the browser — anywhere `fetch` is
available.

```bash
npm install @envsync/sdk
```

## Usage

Create an API key from **Settings → API keys** in the EnvSync dashboard,
then:

```ts
import { EnvSyncClient } from "@envsync/sdk";

const client = new EnvSyncClient({ apiKey: process.env.ENVSYNC_API_KEY! });

const repositories = await client.listRepositories();
console.log(repositories.map((r) => `${r.fullName}: ${r.healthScore}/100`));

const repo = await client.getRepository(repositories[0].id);
console.log(repo.issueCounts); // { critical: 3, warning: 1, healthy: 17 }

const criticalIssues = await client.listIssues(repo.id, { severity: "CRITICAL" });

const result = await client.rescan(repo.id);
console.log(`Rescanned — new score: ${result.healthScore}`);
```

## Self-hosted deployments

Point the client at your own instance with `baseUrl`:

```ts
const client = new EnvSyncClient({
  apiKey: process.env.ENVSYNC_API_KEY!,
  baseUrl: "https://envsync.internal.acme.com",
});
```

## Error handling

Every non-2xx response throws `EnvSyncApiError`, which carries the HTTP
`status` and the API's error message:

```ts
import { EnvSyncApiError } from "@envsync/sdk";

try {
  await client.getRepository("does-not-exist");
} catch (err) {
  if (err instanceof EnvSyncApiError && err.status === 404) {
    console.log("No such repository, or it belongs to another organization.");
  }
}
```

## What this does *not* give you access to

API keys — and this SDK — only ever see the same metadata the dashboard
shows: variable names, health scores, issue descriptions, and file/line
locations. EnvSync never stores actual secret values, so there is no
endpoint that could return one.

## Development

```bash
npm install
npm run dev    # tsx src/index.ts, for quick manual checks
npm run build  # emits dist/index.mjs, dist/index.cjs, dist/index.d.ts
```
