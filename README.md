# Tag and Release

This repository demonstrates how to automate the release process using semantic versioning and GitHub Actions.
It provides a simple and effective way to manage versioned releases, ensuring consistent version control and streamlined
workflows.
By leveraging a custom JavaScript GitHub Action, this project helps you automate the creation of GitHub Releases based
on tagged versions.

# Features

## Label Checker

This application manages semantic versioning labels (`major`, `minor`, and `patch`) for issues and pull requests,
automatically creating them if they don't exist. These labels are essential for determining version bumps and
maintaining consistent release workflow. The checker is triggered when new issues are created or when labels are
modified, ensuring consistent label management throughout the repository's lifecycle.

### Default Label Configuration

The following labels are automatically managed:

| Label | Description           | Color                                       |
|-------|-----------------------|---------------------------------------------|
| major | Breaking Changes      | <span style="color:#d73a4a;">#d73a4a</span> |
| minor | New Features          | <span style="color:#2ea44f;">#2ea44f</span> |
| patch | Bug fixes and patches | <span style="color:#0969da;">#0969da</span> |

### Usage

The label checker runs automatically when tag-and-release action is ran.

# Prerequisites

# Installation

# Usage

## Setting Up the Repository

## Tagging a Release

# Workflow Overview

# Semantic Versioning Guide

# Contributing

# License