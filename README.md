# Jira Release Notes GitHub Action

Creates a GitHub Release with formatted release notes. Each Jira issue is linked and labeled with its summary from Jira. Bugs and non-bug issues are listed in separate sections.

## Setup

1. Push this repository to GitHub.
2. Add repository secrets:
   - `JIRA_EMAIL` — Atlassian account email used for API access
   - `JIRA_API_TOKEN` — [API token](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Ensure the account can read issues in your Jira project.

## Run a release

1. Open **Actions** → **Create Jira Release Notes** → **Run workflow**.
2. Fill in the inputs:

| Input | Description |
|-------|-------------|
| **version** | Git tag name, e.g. `2.1.0` |
| **jira_tasks** | Issue keys, e.g. `PROJ-101, PROJ-102, PROJ-103` |
| **jira_base_url** | Browse URL prefix, e.g. `https://your-org.atlassian.net/browse/` |
| **pre_release** | `true` for a pre-release, `false` for a full release |
| **release_log_url** | Optional wiki/Confluence link appended at the end |
| **create_tag** | `true` to create and push the tag on the current commit |

The tag must already exist on GitHub unless **create_tag** is enabled.

## Example output

```markdown
# 📦 Release Notes

## 🔑 Version

2.1.0

---

## 🐞 Bug Fixes

* [PROJ-101](https://your-org.atlassian.net/browse/PROJ-101) - Fix login timeout on slow networks
* [PROJ-102](https://your-org.atlassian.net/browse/PROJ-102) - Correct pagination on search results

---

## ✅ Tasks

* [PROJ-103](https://your-org.atlassian.net/browse/PROJ-103) - Add CSV export for reports

---

## 📖 Full Release Log

👉 [https://your-org.atlassian.net/wiki/spaces/DOC/pages/123456/Release+Log](https://your-org.atlassian.net/wiki/spaces/DOC/pages/123456/Release+Log)
```

Issues with Jira type **Bug** appear under **Bug Fixes**. All other types (Task, Story, etc.) appear under **Tasks**.
