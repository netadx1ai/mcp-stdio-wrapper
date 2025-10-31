# Publishing Guide - @netadx1ai/mcp-stdio-wrapper

## Prerequisites

1. **npm Account**: Create account at https://www.npmjs.com/signup
2. **Organization Access**: Must be member of `@netadx1ai` organization on npm
3. **Node.js 18+**: Installed locally

## First Time Setup

### 1. Create npm Organization (if not exists)

```bash
# Login to npm
npm login

# Create organization (one-time)
# Go to: https://www.npmjs.com/org/create
# Organization name: netadx1ai
# Make it PUBLIC (not private)
```

### 2. Add Team Members

```bash
# Go to: https://www.npmjs.com/settings/netadx1ai/members
# Add team members who can publish
```

## Publishing Steps

### 1. Pre-publish Checks

```bash
cd /path/to/mcp-stdio-wrapper

# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Build TypeScript
npm run build

# 3. Verify dist/ was created
ls -la dist/

# 4. Check package.json
cat package.json | grep -E "(name|version|main|bin)"

# Expected output:
# "name": "@netadx1ai/mcp-stdio-wrapper"
# "version": "2.1.0"
# "main": "dist/index.js"
# "bin": { "mcp-netadx-api": "./dist/index.js" }
```

### 2. Test Package Locally

```bash
# Test that the built package works
npm pack

# This creates: netadx1ai-mcp-stdio-wrapper-2.1.0.tgz
# Install it locally to test:
npm install -g ./netadx1ai-mcp-stdio-wrapper-2.1.0.tgz

# Test the binary
which mcp-netadx-api
mcp-netadx-api --help  # Should start the server (will fail without env vars - that's OK)

# Clean up test
npm uninstall -g @netadx1ai/mcp-stdio-wrapper
rm netadx1ai-mcp-stdio-wrapper-2.1.0.tgz
```

### 3. Login to npm

```bash
npm login

# You'll be prompted:
# Username: your-npm-username
# Password: ***
# Email: your-email@example.com
# OTP (if 2FA enabled): 123456

# Verify login
npm whoami
# Should show your npm username
```

### 4. Publish to npm

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# Review output - should show:
# - package.json
# - dist/index.js
# - dist/index.d.ts
# - README.md
# - LICENSE

# Publish for real (PUBLIC)
npm publish --access public

# Expected output:
# + @netadx1ai/mcp-stdio-wrapper@2.1.0
```

### 5. Verify Publication

```bash
# Check on npm website
open https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper

# Or check via CLI
npm view @netadx1ai/mcp-stdio-wrapper

# Test installation globally
npm install -g @netadx1ai/mcp-stdio-wrapper@latest

# Test with npx (no install)
npx @netadx1ai/mcp-stdio-wrapper@latest
# Should fail with "JWT_TOKEN environment variable is required" - that's correct!
```

## Publishing Updates

### Patch Release (2.1.0 → 2.1.1)

```bash
# Bug fixes only
npm version patch
npm publish --access public
```

### Minor Release (2.1.0 → 2.2.0)

```bash
# New features, backward compatible
npm version minor
npm publish --access public
```

### Major Release (2.1.0 → 3.0.0)

```bash
# Breaking changes
npm version major
npm publish --access public
```

## Making the Package Public

The package is **already configured as public**:

1. **package.json** includes:
   ```json
   "publishConfig": {
     "access": "public"
   }
   ```

2. **License**: MIT (open source)

3. **Repository**: Public GitHub (when pushed)

4. **npm publish**: Uses `--access public` flag

### Why Public?

✅ **Anyone can use it** - `npx @netadx1ai/mcp-stdio-wrapper@latest`  
✅ **No npm subscription needed** - Free public packages  
✅ **Better for community** - Open source MCP wrapper  
✅ **Claude Desktop compatible** - Works via npx  

### If You Want Private Instead

To make it private (requires npm Pro/Teams):

```json
// package.json
"publishConfig": {
  "access": "restricted"  // Change from "public"
}
```

Then publish:
```bash
npm publish --access restricted
```

**Cost**: ~$7/month per user for private packages

## Troubleshooting

### Error: "You must sign in to publish packages"

```bash
npm login
# Follow prompts
```

### Error: "You do not have permission to publish @netadx1ai/mcp-stdio-wrapper"

**Solution**: You need to be added to the `@netadx1ai` organization.

Ask organization owner to:
1. Go to https://www.npmjs.com/settings/netadx1ai/members
2. Add your npm username as member

### Error: "Package name too similar to existing packages"

**Solution**: npm thinks the name is too similar to another package.

Options:
1. Use different name: `@netadx1ai/netadx-mcp-wrapper`
2. Contact npm support if you believe it's unique

### Error: "prepublishOnly script failed"

```bash
# The build failed
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Error: "402 Payment Required"

You're trying to publish a private package without paid plan.

**Solution**: Either:
1. Make it public: `npm publish --access public`
2. Or upgrade to npm Pro: https://www.npmjs.com/products

## Post-Publication

### 1. Update GitHub README

Add npm badge to main README:

```markdown
[![npm version](https://badge.fury.io/js/@netadx1ai%2Fmcp-stdio-wrapper.svg)](https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper)
```

### 2. Tag Git Release

```bash
git tag v2.1.0
git push origin v2.1.0
```

### 3. Announce

Update documentation with installation instructions:

```bash
# Now users can simply do:
npx @netadx1ai/mcp-stdio-wrapper@latest
```

## Maintenance

### Check Download Stats

```bash
# Via CLI
npm view @netadx1ai/mcp-stdio-wrapper

# Via web
open https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper
```

### Unpublish (if needed within 72 hours)

```bash
# Unpublish specific version
npm unpublish @netadx1ai/mcp-stdio-wrapper@2.1.0

# Unpublish entire package (use with caution!)
npm unpublish @netadx1ai/mcp-stdio-wrapper --force
```

**Note**: After 72 hours, you can't unpublish. You can only deprecate:

```bash
npm deprecate @netadx1ai/mcp-stdio-wrapper@2.1.0 "This version has a critical bug"
```

## Security

### Enable 2FA (Recommended)

```bash
npm profile enable-2fa auth-and-writes

# This requires OTP for:
# - npm login
# - npm publish
```

### Audit Package

```bash
npm audit
npm audit fix
```

## Support

- **npm Docs**: https://docs.npmjs.com/
- **Publishing Guide**: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- **Scoped Packages**: https://docs.npmjs.com/cli/v8/using-npm/scope

---

**Package**: @netadx1ai/mcp-stdio-wrapper  
**Registry**: https://www.npmjs.com/package/@netadx1ai/mcp-stdio-wrapper  
**License**: MIT (Public)  
**Author**: NetADX Team
