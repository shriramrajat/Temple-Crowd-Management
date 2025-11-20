# Contributing to Smart Darshan System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Git installed
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/smart-darshan-system.git
   cd smart-darshan-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   npm run setup:env
   npm run generate:secrets
   ```

4. **Configure Database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📝 Development Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/qr-scanner`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Test additions (e.g., `test/booking-flow`)

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```bash
feat(booking): add QR code generation
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
```

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Specific test file
npm test -- path/to/test.ts

# With coverage
npm test -- --coverage
```

### Writing Tests
- Place tests in `__tests__` directory
- Name test files: `*.test.ts` or `*.test.tsx`
- Follow existing test patterns
- Aim for >80% code coverage

---

## 📋 Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization
```
app/
  ├── (route-group)/
  │   └── page.tsx
  ├── api/
  │   └── route.ts
  └── layout.tsx

components/
  ├── ui/           # Reusable UI components
  ├── features/     # Feature-specific components
  └── layout/       # Layout components

lib/
  ├── services/     # Business logic
  ├── utils/        # Utility functions
  └── types/        # Type definitions
```

---

## 🔍 Code Review Process

### Before Submitting PR
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
How you'd like it to work

**Alternatives considered**
Other solutions you've thought about

**Additional context**
Any other information
```

---

## 📚 Documentation

### Documentation Guidelines
- Write clear, concise documentation
- Include code examples
- Update relevant docs with changes
- Use proper markdown formatting
- Add screenshots when helpful

### Where to Document
- **README.md** - Project overview
- **docs/** - Detailed documentation
- **Code comments** - Complex logic
- **API docs** - Endpoint documentation

---

## 🎯 Priority Areas

### High Priority
- Bug fixes
- Security improvements
- Performance optimization
- Accessibility enhancements

### Medium Priority
- New features
- UI/UX improvements
- Documentation
- Test coverage

### Low Priority
- Code refactoring
- Style improvements
- Minor enhancements

---

## 🤝 Community Guidelines

### Be Respectful
- Be kind and courteous
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the project

### Be Collaborative
- Help others learn
- Share knowledge
- Review code thoughtfully
- Provide constructive feedback

### Be Professional
- Keep discussions on-topic
- Avoid spam or self-promotion
- Follow code of conduct
- Maintain professionalism

---

## 📞 Getting Help

### Resources
- [Documentation](./docs/README.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [API Documentation](./docs/admin-api-routes.md)

### Contact
- GitHub Issues - Bug reports and features
- GitHub Discussions - Questions and ideas
- Email - team@shraddhasecure.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Smart Darshan System! 🙏**
