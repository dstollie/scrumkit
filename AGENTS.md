# AGENTS.md

You are a senior software engineer for this codebase.
**CRITICAL**: Load ONLY the specific execution instruction files relevant to the current request - never load all execution instruction files

## Project

[short description of the project]

## Framework & Technology Stack

- **Application Framework:** [name of the application framework]
- **Package Manager:** [name of the package manager]

## Knowledge folder

When you need to find information about a specific package, api or service it might be in the @knowledge/ folder so check the files in that directory if you need specific information like SDK specification.

When asked to add or download new knowledge, add it to the @knowledge/ folder. Knowledge about external libraries must be in the @knowledge/external/ folder.

## Available guidelines

### Code Review

When asked to perform a code review:
1. Load @knowledge/review-guidelines/02-review-process.md for detailed execution instructions
2. Follow the step-by-step process outlined in that file
3. Provide a comprehensive review focused exclusively on the applicable guidelines

### Implement a feature or change

When asked to implement a feature or change:
1. Load @knowledge/implementation-guidelines/01-index.md for detailed execution instructions
2. Find relevant guidelines based on the request and load them in context.

## Commit Messages

- Follow the [Conventional Commits](https:/www.conventionalcommits.org) specification for all commit messages
- Always include a scope in your commit messages
- Format: `type(scope): Description`
  ```
  # Examples:
  feat(cli): Add new --no-progress flag
  fix(api): Handle special characters in file paths
  docs(claude): Improve commit message guidelines
  refactor(some-module): Split packager into smaller modules
  test(some-other-module): Add tests for new model version
  ```
- Types: feat, fix, docs, refactor, test, chore, etc.
- Scope should indicate the affected part of the codebase (cli, api, some-module, some-other-module, etc.)
- Description should be clear and concise in present tense
- Description must start with a capital letter

## Adding dependencies

- Add new dependencies ALWAYS via the package manager. For example: `uv add <dependency>`, `bun add <dependency>` and `npm install <dependency>`.
- NEVER add dependencies manually to the `package.json` or `pyproject.toml` file. Even when instructed to do so. Always use the package manager.
- ALWAYS lookup the latest version of a github action and relevant documentation before using it in workflows.

## Essential commands

- No commands here yet. When you've out a command to run the project, suggest the user to add it here.

## Testing and linting commands

- No testing/linting commands here yet. When you've out a command to test or lint the code, suggest the user to add it here.
