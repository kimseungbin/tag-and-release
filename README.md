# Tag and Release

This repository demonstrates how to automate the release process using semantic versioning and GitHub Actions.
It provides a simple and effective way to manage versioned releases, ensuring consistent version control and streamlined
workflows.
By leveraging a custom JavaScript GitHub Action, this project helps you automate the creation of GitHub Releases based
on tagged versions.

# Features

## Label Checker

This application will manage semantic versioning labels (`major`, `minor`, and `patch`) for issues and pull requests.
These labels are essential for determining version bumps and maintaining consistent release workflow.

Planned features include:

- Automatic label creation and management
- Integration with issue and PR creation events
- Support for label modifications
- Externalized label configurations

### Default Label Configuration

The following labels are automatically managed:

| Label | Description           | Color                                       |
|-------|-----------------------|---------------------------------------------|
| major | Breaking Changes      | <span style="color:#d73a4a;">#d73a4a</span> |
| minor | New Features          | <span style="color:#2ea44f;">#2ea44f</span> |
| patch | Bug fixes and patches | <span style="color:#0969da;">#0969da</span> |

### Usage

Note: Automatic label checking is currently under development. Please refer to issue #7 for implementation status and
planned features.
The label checker runs automatically when tag-and-release action is run.

# Tools used

## Vite

- Why Vite was chosen
- How it's configured in the project
- Its role in the build process

## Vitest

Used Vitest instead of Jest for out-of-box TypeScript support.
Jest alone can't handle dependencies like octokit and even with ts-jest, it required additional configurations.
Whereas Vitest can run tests without any specific configurations.

# Prerequisites

# Installation

# Usage

## Setting Up the Repository

## Tagging a Release

# Workflow Overview

# Semantic Versioning Guide

# Contributing

# License