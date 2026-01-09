# Publishing Guide - @netadx1ai/mcp-stdio-wrapper

Official guide for publishing updates to the NetADX MCP Stdio Wrapper package.

## Quick Publish (For Maintainers)

```bash
# 1. Build and bump version
npm run build
npm version patch  # or minor/major

# 2. Publish to npm
npm publish --access public

# 3. Push to GitHub
git push origin main --tags
```

## Prerequisites

### Required Access

- **npm Account**: Member of `@netadx1ai` organization
- **GitHub Access**: Write access to https://github.com/netadx1ai/mcp-stdio-wrapper
- **Node.js**: Version 18.0.0 or higher

### Authentication Setup

#### npm Authentication

```bash
# Login to npm
npm login

# Verify access
npm whoami
npm access list packages @netadx1ai
```

#### GitHub Authentication

```bash
# Verify git remote
git remote -v

# Should show:
# origin  https://github.com/netadx1ai/mcp-stdio-wrapper (fetch)
# origin  https://github.com/netadx1ai/mcp-stdio-wrapper (push)
```

## Publishing Workflow

### 1. Pre-Release Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test` (if tests exist)
- [ ] Build succeeds: `npm run build`
- [ ] Code is committed: `git status` shows clean
- [ ] On main branch: `git branch` shows `* main`
- [ ] Up to date: `git pull origin main`

### 2. Update Version

Choose semantic versioning based on changes:

```bash
# Patch release (bug fixes): 2.1.5 → 2.1.6
npm version patch

# Minor release (new features): 2.1.5 → 2.2.0
npm version minor

# Major release (breaking changes): 2.1.5 → 3.0.0
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag

### 3. Build Package

```bash
# Clean build
npm run build

# Verify dist directory
ls -la dist/
# Should contain: index.js, index.d.ts, and map files
```

### 4. Test Package Locally (Optional)

```bash
# Create tarball
npm pack

# Install globally for testing
npm install -g ./netadx1ai-mcp-stdio-wrapper-*.tgz

# Test the binary
mcp-netadx-api
# Should error with "JWT_TOKEN environment variable is required" - this is correct!

# Cleanup
npm uninstall -g @netadx1ai/mcp-stdio-wrapper
rm netadx1ai-mcp-stdio-wrapper-*.tgz
```

### 5. Publish to npm

```bash
# Dry run (preview what will be published)
npm publish --dry-run --access public

# Review the file list, then publish
npm publish --access public
```

Expected output:
```
+ @netadx1ai/mcp-stdio-wrapper@2.1.6
```

### 6. Push to GitHub

```bash
# Push commits and tags
git push origin main
git push origin --tags
```

### 7. Verify Publication

```bash
# Check npm
npm view @netadx1ai/mcp-stdio-wrapper

# Test installation
npx @netadx1ai/mcp-stdio-wrapper@latest
```

Visit the package page:
- npm: https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper
- GitHub: https://github.com/netadx1ai/mcp-stdio-wrapper

## Package Configuration

### What Gets Published

Files included (defined in `package.json`):
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Package documentation
- `LICENSE` - MIT license file

Files excluded (defined in `.npmignore`):
- `src/` - Source TypeScript files
- `node_modules/` - Dependencies
- `.git/` - Git metadata
- `tsconfig.json` - TypeScript configuration

### Package Metadata

```json
{
  "name": "@netadx1ai/mcp-stdio-wrapper",
  "version": "2.1.5",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "mcp-netadx-api": "./dist/index.js"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

## Versioning Strategy

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

**Patch** (2.1.5 → 2.1.6)
- Bug fixes
- Documentation updates
- Performance improvements
- No API changes

**Minor** (2.1.5 → 2.2.0)
- New features
- New functionality
- Backward compatible changes
- New environment variables (optional)

**Major** (2.1.5 → 3.0.0)
- Breaking changes
- Removed features
- Changed API behavior
- Required environment variable changes

### Version Changelog

Update README.md changelog section after each release:

```markdown
## Changelog

**Version 2.1.6**
- Updated contact information to hello@netadx.ai
- Fixed repository URLs to standalone repo
- Improved error handling

**Version 2.1.5**
- Previous changes...
```

## Troubleshooting

### Common Errors

#### "You cannot publish over the previously published versions"

**Problem**: Version already exists on npm

**Solution**:
```bash
# Bump version again
npm version patch
npm publish --access public
```

#### "You do not have permission to publish"

**Problem**: Not a member of `@netadx1ai` organization

**Solution**: Contact NetADX Team (hello@netadx.ai) for access

#### "prepublishOnly script failed"

**Problem**: Build failed

**Solution**:
```bash
# Check TypeScript errors
npm run build

# Fix any TypeScript errors in src/
# Then try publishing again
```

#### "Git working directory not clean"

**Problem**: Uncommitted changes

**Solution**:
```bash
# Commit changes first
git add .
git commit -m "Your commit message"

# Then bump version
npm version patch
```

#### "Authentication failed"

**Problem**: Not logged in to npm

**Solution**:
```bash
npm login
# Enter credentials
npm whoami  # Verify
```

### Build Issues

```bash
# Clean everything and rebuild
rm -rf dist/ node_modules/ package-lock.json
npm install
npm run build
```

### Test Before Publishing

```bash
# Lint check (if configured)
npm run lint

# Type check
npx tsc --noEmit

# Dry run publish
npm publish --dry-run
```

## Rollback & Deprecation

### Unpublish (Within 72 hours)

```bash
# Unpublish specific version (only if just published)
npm unpublish @netadx1ai/mcp-stdio-wrapper@2.1.6
```

**Warning**: Can only unpublish within 72 hours of publication.

### Deprecate (After 72 hours)

```bash
# Mark version as deprecated
npm deprecate @netadx1ai/mcp-stdio-wrapper@2.1.6 "Use version 2.1.7 instead"

# Undeprecate if needed
npm deprecate @netadx1ai/mcp-stdio-wrapper@2.1.6 ""
```

### Publish Fixed Version

```bash
# Fix the issue
# ... make changes ...

# Publish new version
npm version patch
npm publish --access public
```

## Security Best Practices

### Enable Two-Factor Authentication

```bash
# Enable 2FA for login and publishing
npm profile enable-2fa auth-and-writes
```

### Audit Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Review before publishing
```

### Token Management

Never commit npm tokens to git:
- Use environment variables
- Use `.npmrc` (add to `.gitignore`)
- Rotate tokens periodically

## Monitoring

### Package Statistics

```bash
# View package info
npm view @netadx1ai/mcp-stdio-wrapper

# Check download stats
npm view @netadx1ai/mcp-stdio-wrapper downloads
```

### User Feedback

Monitor for issues:
- GitHub Issues: https://github.com/netadx1ai/mcp-stdio-wrapper/issues
- npm page: https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper
- Email: hello@netadx.ai

## Maintenance Schedule

### Regular Updates

- **Weekly**: Check for dependency updates
- **Monthly**: Review GitHub issues
- **Quarterly**: Update documentation
- **As needed**: Security patches

### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Test after updates
npm run build
npm test
```

## Support & Contact

### Getting Help

- **Documentation**: https://github.com/netadx1ai/mcp-stdio-wrapper
- **Issues**: https://github.com/netadx1ai/mcp-stdio-wrapper/issues
- **Email**: hello@netadx.ai
- **Website**: https://netadx.ai

### For New Maintainers

To request publishing access:

1. Contact NetADX Team at hello@netadx.ai
2. Provide your npm username
3. Provide your GitHub username
4. Wait for organization invite
5. Accept invite and follow this guide

---

**Maintained by:** NetADX Team  
**Contact:** hello@netadx.ai  
**Website:** https://netadx.ai  
**Last Updated:** 2025-01-09