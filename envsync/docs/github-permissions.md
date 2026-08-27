# What EnvSync accesses on GitHub, and why

EnvSync asks for the minimum GitHub access needed at each step — it never
requests more scope than the feature in front of you needs.

## Signing in (Phase 1)

Scope requested: `read:user`, `user:email`.

This only identifies who you are (name, email, avatar) so EnvSync can create
your account. It grants no access to any repository.

## Connecting a repository (Phase 2+)

When you choose to connect a repository, EnvSync requests read-only access to
that repository's contents so it can scan source files for environment
variable usage (`process.env.X`, `os.getenv(...)`, etc.) and read
`.env.example`. It does not request write access, and it does not read the
contents of `.env`, `.env.local`, `.env.staging`, or any other file that is
gitignored and never pushed to GitHub in the first place — those exist only
on your machine or your deploy platform, which is why EnvSync asks you to
describe them via configuration metadata rather than upload them.

## What EnvSync never does

- Never stores actual secret values.
- Never requests production secrets be uploaded.
- Never requests write access to your repository for scanning.
- Never automatically rotates or modifies credentials.

## Disconnecting

You can disconnect a repository and delete all of its scan data at any time
from the repository settings page. This revokes EnvSync's access and removes
the stored configuration metadata — see Settings → Repository → Disconnect.
