# envsync (CLI)

Local, offline configuration health checks — the same detection engine the
EnvSync web app uses, running against your working directory with no network
calls and no account required.

```bash
npm run build       # bundles src/index.ts -> dist/index.js
node dist/index.js scan .
node dist/index.js check .
```

Once published, this becomes:

```bash
npm install -g envsync
envsync scan
envsync check   # non-zero exit code on critical issues — use in CI
```

## Commands

- `envsync scan [path]` — reports detected variables, `.env.example`
  coverage, unused declarations, and possible secret exposure. Defaults to
  the current directory.
- `envsync check [path]` — same report, and exits with status `1` if any
  critical issue exists (missing-from-example variable, or a detected
  secret). Wire this into CI:

  ```yaml
  - run: npx envsync check
  ```

It never reads variable *values* — only key names, file/line usage, and
pattern-based detection of likely secrets (masked in output).
