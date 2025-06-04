# Contributing to MCP Fixer Server

Thank you for your interest in contributing to MCP Fixer Server! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Bugs
1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information** including:
   - Operating system and version
   - Node.js version
   - Claude Desktop version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs

### Suggesting Features
1. **Check the roadmap** to see if it's already planned
2. **Use the feature request template**
3. **Describe the use case** and problem being solved
4. **Provide examples** of how it would work

### Contributing Code

#### Prerequisites
- Node.js 18+
- Git
- Code editor (VS Code recommended)
- Understanding of MCP protocol basics

#### Development Setup
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR-USERNAME/mcp-fixer-server.git
cd mcp-fixer-server

# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Start development
npm run dev
```

#### Making Changes
1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run the test suite**
   ```bash
   npm test
   npm run lint
   ```

6. **Commit your changes** with clear messages
   ```bash
   git commit -m "feat: add port conflict resolution tool"
   ```

7. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### Code Style
- Use **ESLint** configuration provided
- **2 spaces** for indentation
- **camelCase** for variables and functions
- **PascalCase** for classes
- **UPPER_SNAKE_CASE** for constants

### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for adding tests
- `refactor:` for code refactoring
- `style:` for formatting changes
- `chore:` for maintenance tasks

### Testing
- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Include both positive and negative test cases

### Documentation
- Update README if adding new features
- Document new functions and classes with JSDoc
- Add examples for complex functionality
- Keep documentation up to date

## 🏗️ Project Structure

```
src/
├── index.js              # Main MCP server entry point
├── tools/                # Individual diagnostic tools
│   ├── configAnalysis.js
│   ├── serverStatus.js
│   ├── dependencyCheck.js
│   └── ...
├── utils/                # Utility functions
│   ├── fileUtils.js
│   ├── pathUtils.js
│   └── ...
└── constants/            # Configuration constants
    └── defaults.js

test/
├── unit/                 # Unit tests
├── integration/          # Integration tests
└── fixtures/             # Test data and mocks

docs/                     # Documentation
├── api/                  # API documentation
├── guides/               # User guides
└── examples/             # Usage examples
```

## 🔍 Code Review Process

### For Contributors
1. **Self-review** your code before submitting
2. **Ensure all tests pass** locally
3. **Write clear pull request descriptions**
4. **Respond to feedback** promptly and professionally
5. **Keep pull requests focused** on a single feature/fix

### For Reviewers
1. **Be constructive and kind** in feedback
2. **Focus on code quality** and maintainability
3. **Check for security issues** and best practices
4. **Verify tests cover the changes**
5. **Approve when satisfied** with the quality

## 🎯 Development Guidelines

### Adding New Diagnostic Tools
1. Create a new file in `src/tools/`
2. Export a function that matches the tool interface
3. Add comprehensive error handling
4. Include input validation
5. Write unit tests
6. Update the main server to register the tool
7. Document the tool's purpose and usage

### Example Tool Structure
```javascript
export async function newDiagnosticTool(args) {
  // Input validation
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid arguments provided');
  }

  // Tool logic
  const results = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    issues: [],
    recommendations: []
  };

  try {
    // Perform diagnostic logic
    // ...
    
    results.status = 'success';
  } catch (error) {
    results.status = 'error';
    results.error = error.message;
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(results, null, 2)
    }]
  };
}
```

### Error Handling Best Practices
- Always wrap async operations in try-catch
- Provide meaningful error messages
- Log errors for debugging
- Return structured error responses
- Handle platform-specific errors (Windows vs macOS/Linux)

### Platform Compatibility
- Test on Windows, macOS, and Linux
- Handle path differences correctly
- Use cross-platform utilities where possible
- Document platform-specific requirements

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

### Release Checklist
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create release notes
5. Tag the release
6. Publish to npm (maintainers only)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Special recognition for significant contributions

## 📞 Getting Help

- **GitHub Discussions** for questions and ideas
- **Issues** for bug reports and feature requests
- **Discord/Slack** (if available) for real-time chat
- **Email** maintainers for sensitive issues

## 📋 Checklist for Pull Requests

Before submitting a pull request, ensure:

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## 🎉 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort in helping improve MCP Fixer Server!

---

*This contributing guide is itself open to contributions and improvements!*