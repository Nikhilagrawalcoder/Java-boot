export function generateWorkflowYaml(): string {
  return `name: EnvSync Check

on:
  pull_request:

jobs:
  envsync:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run EnvSync
        run: npx envsync check
`;
}
