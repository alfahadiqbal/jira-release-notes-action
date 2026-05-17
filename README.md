# Jira Release Notes Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Jira%20Release%20Notes-blue?logo=github)](https://github.com/marketplace/actions/jira-release-notes)

Create a **GitHub Release** with formatted notes from **Jira** issues. Each issue is a clickable link with its summary. **Bugs** and **Tasks/Stories** are listed in separate sections.

Each user supplies **their own** Jira credentials via repository secrets. Your tokens are never shared with the action maintainer.

---

## Usage

### 1. Add secrets to your repository

**Settings → Secrets and variables → Actions**

| Secret | Description |
|--------|-------------|
| `JIRA_EMAIL` | Your Atlassian account email |
| `JIRA_API_TOKEN` | [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens) |

### 2. Add a workflow

```yaml
name: Release with Jira notes

on:
  workflow_dispatch:
    inputs:
      version:
        required: true
        type: string
      jira_tasks:
        required: true
        type: string
      jira_base_url:
        required: true
        type: string
      pre_release:
        required: false
        type: boolean
        default: false
      release_log_url:
        required: false
        type: string
      create_tag:
        required: false
        type: boolean
        default: false

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: alfahadiqbal/jira-release-notes-action@v1
        with:
          version: ${{ inputs.version }}
          jira_tasks: ${{ inputs.jira_tasks }}
          jira_base_url: ${{ inputs.jira_base_url }}
          pre_release: ${{ inputs.pre_release }}
          release_log_url: ${{ inputs.release_log_url }}
          create_tag: ${{ inputs.create_tag }}
        env:
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

See [`examples/workflow.yml`](examples/workflow.yml) for a copy-ready file.

### 3. Run the workflow

**Actions → Release with Jira notes → Run workflow**

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `version` | Yes | — | Git tag / release version |
| `jira_tasks` | Yes | — | Issue keys: `PROJ-101, PROJ-102` |
| `jira_base_url` | Yes | — | e.g. `https://your-org.atlassian.net/browse/` |
| `pre_release` | No | `false` | Mark release as pre-release |
| `release_log_url` | No | `""` | Optional wiki link at the end |
| `create_tag` | No | `false` | Create and push tag if missing |

Pass Jira credentials via `env` (not `with`):

- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

---

## Example output

```markdown
# 📦 Release Notes

## 🔑 Version

2.1.0

---

## 🐞 Bug Fixes

* [PROJ-101](https://your-org.atlassian.net/browse/PROJ-101) - Fix login timeout

---

## ✅ Tasks

* [PROJ-103](https://your-org.atlassian.net/browse/PROJ-103) - Add CSV export
```

---

## Publish to GitHub Marketplace (maintainers)

1. Push this repo to GitHub and set it to **public**
2. Create a release with tag **`v1.0.0`** (semver, with `v` prefix)
3. Open [GitHub Marketplace – Manage Actions](https://github.com/marketplace/actions/manage)
4. Select **Draft a new release** for this action
5. Add category (e.g. **Continuous integration**), description, and publish

Pin consumers to a major version: `@v1` → `v1.0.0` tag.

---

## License

[MIT](LICENSE)
