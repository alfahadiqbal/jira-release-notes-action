#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const VERSION = process.env.VERSION?.trim();
const JIRA_TASKS = process.env.JIRA_TASKS ?? "";
const JIRA_BASE_URL = process.env.JIRA_BASE_URL?.trim();
const RELEASE_LOG_URL = process.env.RELEASE_LOG_URL?.trim() || "";
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

if (!VERSION) fail("VERSION is required.");
if (!JIRA_BASE_URL) fail("JIRA_BASE_URL is required.");
if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  fail("JIRA_EMAIL and JIRA_API_TOKEN secrets are required.");
}

function parseIssueKeys(raw) {
  return [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .map((key) => key.trim().toUpperCase())
        .filter((key) => /^[A-Z][A-Z0-9]+-\d+$/.test(key))
    ),
  ];
}

function normalizeBrowseBaseUrl(url) {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/browse") ? `${trimmed}/` : `${trimmed}/browse/`;
}

function jiraSiteFromBrowseUrl(browseBase) {
  const match = browseBase.match(/^(https?:\/\/[^/]+)/i);
  if (!match) fail(`Invalid JIRA_BASE_URL: ${browseBase}`);
  return match[1];
}

function isBug(issueTypeName) {
  return issueTypeName.toLowerCase() === "bug";
}

async function fetchIssue(site, issueKey) {
  const url = `${site}/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,issuetype`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`Failed to fetch ${issueKey} (${response.status}): ${body}`);
  }

  const data = await response.json();
  return {
    key: data.key,
    summary: data.fields.summary,
    issueType: data.fields.issuetype.name,
  };
}

function formatBullet(key, browseBase, summary) {
  return `* [${key}](${browseBase}${key}) - ${summary}`;
}

function buildReleaseNotes({ version, browseBase, bugs, tasks, releaseLogUrl }) {
  const lines = [
    "# 📦 Release Notes",
    "",
    "## 🔑 Version",
    "",
    version,
    "",
    "---",
    "",
  ];

  if (bugs.length > 0) {
    lines.push("## 🐞 Bug Fixes", "", ...bugs.map((item) => formatBullet(item.key, browseBase, item.summary)), "", "---", "");
  }

  if (tasks.length > 0) {
    lines.push("## ✅ Tasks", "", ...tasks.map((item) => formatBullet(item.key, browseBase, item.summary)), "", "---", "");
  }

  if (releaseLogUrl) {
    lines.push("## 📖 Full Release Log", "", `👉 [${releaseLogUrl}](${releaseLogUrl})`, "");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "---") {
    lines.pop();
  }
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const issueKeys = parseIssueKeys(JIRA_TASKS);
  if (issueKeys.length === 0) {
    fail("No valid Jira issue keys found in JIRA_TASKS.");
  }

  const browseBase = normalizeBrowseBaseUrl(JIRA_BASE_URL);
  const site = jiraSiteFromBrowseUrl(browseBase);

  const issues = [];
  for (const key of issueKeys) {
    console.log(`Fetching ${key}...`);
    issues.push(await fetchIssue(site, key));
  }

  const bugs = issues.filter((issue) => isBug(issue.issueType));
  const tasks = issues.filter((issue) => !isBug(issue.issueType));

  const markdown = buildReleaseNotes({
    version: VERSION,
    browseBase,
    bugs,
    tasks,
    releaseLogUrl: RELEASE_LOG_URL,
  });

  writeFileSync("release-notes.md", markdown, "utf8");
  console.log("Generated release-notes.md:");
  console.log(markdown);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
