# Development Guide - Panchanga Calculator

This guide helps you set up and work with the Panchanga Calculator project locally.

---

## 🛠️ Prerequisites

Before you start, make sure you have:

- **Git** - Version control
- **Podman** (or Docker) - Containerization
- **Node.js** (v18+) - JavaScript runtime (for running tests locally)
- **podman-compose** (or docker-compose) - Container orchestration

Check versions:
```bash
git --version
podman --version
node --version
npm --version
podman-compose --version
```

---

## 📦 Project Structure

```
/home/jsnadmin/apps/shivavakkiyar/
├── .claude/
│   ├── config.json              ← Project configuration (THIS FILE)
│   ├── WORKFLOW.md              ← Mandatory workflow guide (READ THIS!)
│   └── DEVELOPMENT.md           ← This file
│
├── CLAUDE.md                    ← Main project documentation
├── SKILLS.md                    ← Technical skills & infrastructure
├── TESTING.md                   ← Complete testing guide
├── VERSION                      ← Semantic version (1.0.0-beta.2)
│
├── assets/
│   ├── js/
│   │   ├── astronomy.browser.js       (413KB - NASA JPL ephemeris)
│   │   ├── panchanga-calculator.js    (22KB - Core calculations)
│   │   └── location-manager.js        (9.4KB - Geolocation & caching)
│   └── css/
│       ├── cayman-theme.css
│       ├── panchanga.css
│       └── custom.css
│
├── _includes/
│   ├── panchanga-widget-simple.html   (Pradosha page)
│   └── panchanga-widget-full.html     (Full calculator page)
│
├── scripts/
│   ├── feature-workflow.sh            (MANDATORY workflow script)
│   └── push-to-github.sh              (Push to GitHub)
│
├── tests/
│   ├── panchanga-calculator.test.js
│   ├── panchanga-calculator-integration.test.js
│   ├── e2e.spec.js
│   ├── playwright.config.js
│   └── run-tests.sh
│
├── package.json                  ← npm dependencies
├── podman-compose.yml            ← Container configuration
├── Dockerfile.test               ← E2E test container
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shivavakkiyar.git
cd shivavakkiyar
```

### 2. Install Node Dependencies

```bash
npm install
```

This installs:
- `@playwright/test` - E2E testing framework
- `c8` - Code coverage tool

### 3. Start Development Server

```bash
podman-compose up -d saivamcloud-dev
```

Check it's running:
```bash
podman-compose ps
curl http://localhost:5080/panchanga/
```

Access locally:
- **Panchanga Calculator**: http://localhost:5080/panchanga/
- **Pradosha Page**: http://localhost:5080/pradoshakalapooja/

### 4. Run Tests

#### Unit Tests
```bash
node tests/panchanga-calculator.test.js
```

#### Integration Tests
```bash
node tests/panchanga-calculator-integration.test.js
```

#### Both
```bash
npm test
```

#### E2E Tests (requires browser setup)
```bash
podman-compose --profile test up saivamcloud-test
```

---

## 🔄 Development Workflow

### The Golden Rule
**ALWAYS follow this pattern:**

```bash
# 1. Start feature branch
./scripts/feature-workflow.sh start feature-name

# 2. Make changes (edit files)

# 3. Run tests
./scripts/feature-workflow.sh test

# 4. Commit (using workflow script!)
./scripts/feature-workflow.sh commit "commit message"

# 5. Repeat 2-4 until feature done

# 6. Finish
./scripts/feature-workflow.sh finish

# 7. Push
./scripts/push-to-github.sh
```

**⚠️ NEVER use `git commit` directly - always use the workflow script!**

See [WORKFLOW.md](.claude/WORKFLOW.md) for detailed instructions.

---

## 🧪 Testing

### Running Tests Locally

#### All Tests
```bash
npm test
```

#### Specific Test File
```bash
node tests/panchanga-calculator.test.js
node tests/panchanga-calculator-integration.test.js
```

#### E2E Tests with Coverage
```bash
npm run test:coverage
```

#### E2E Tests in Debug Mode
```bash
npm run test:e2e:debug
```

#### E2E Tests with UI Inspector
```bash
npm run test:e2e:ui
```

### Test Results

After E2E tests, view results:
```bash
# HTML report (open in browser)
open tests/test-results/index.html

# Code coverage
open tests/test-results/coverage/index.html

# Failure screenshots
ls tests/test-results/screenshots/
```

### Understanding Test Output

**Good output:**
```
✅ PASS: Test name
✅ All 15 tests passed
✅ Coverage: 85%
```

**Bad output:**
```
❌ FAIL: Test name
  Error: Expected X but got Y
```

If tests fail:
1. Read the error message
2. Fix the code
3. Run tests again
4. Only commit when all pass

---

## 🐳 Container Management

### Dev Container (Jekyll)

**Start:**
```bash
podman-compose up -d saivamcloud-dev
```

**Check status:**
```bash
podman-compose ps
```

**View logs:**
```bash
podman-compose logs -f saivamcloud-dev
```

**Stop:**
```bash
podman-compose down
```

**Rebuild:**
```bash
podman-compose build saivamcloud-dev
podman-compose up -d saivamcloud-dev
```

### Test Container (Playwright E2E)

**Start (requires dev container running):**
```bash
podman-compose --profile test up saivamcloud-test
```

**With logs:**
```bash
podman-compose --profile test up saivamcloud-test --no-detach
```

**Stop:**
```bash
podman-compose --profile test down
```

---

## 🔧 Common Tasks

### Add a New Feature

```bash
# 1. Start feature branch
./scripts/feature-workflow.sh start add-new-feature

# 2. Create/modify files
vim assets/js/panchanga-calculator.js
vim _includes/panchanga-widget-full.html

# 3. Test your changes
./scripts/feature-workflow.sh test

# 4. Commit
./scripts/feature-workflow.sh commit "Add new feature

- Describe what you added
- Why you added it
- Any related tests"

# 5. More changes? Go back to step 2

# 6. When done
./scripts/feature-workflow.sh finish
./scripts/push-to-github.sh
```

### Fix a Bug

```bash
./scripts/feature-workflow.sh start fix-bug-description
# ... edit files ...
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "Fix bug description

- What was broken
- How you fixed it
- Tests confirming fix"
./scripts/feature-workflow.sh finish
./scripts/push-to-github.sh
```

### Update Documentation

```bash
./scripts/feature-workflow.sh start update-docs
# Edit CLAUDE.md, SKILLS.md, etc.
./scripts/feature-workflow.sh test
./scripts/feature-workflow.sh commit "Update documentation"
./scripts/feature-workflow.sh finish
./scripts/push-to-github.sh
```

---

## 📝 Editing Files

### Key Files to Know

#### Core Calculations
- **assets/js/panchanga-calculator.js** - All astronomical calculations
  - Functions: `getDrikAyanamsa()`, `calculateTithi()`, `calculateNakshatra()`, etc.

#### Location Management
- **assets/js/location-manager.js** - Geolocation and geocoding
  - Functions: `geocodeLocation()`, `getStoredLocation()`, `saveLocationToStorage()`

#### UI Widgets
- **_includes/panchanga-widget-full.html** - Full calculator page widget
- **_includes/panchanga-widget-simple.html** - Simplified Pradosha page widget

#### Styling
- **assets/css/panchanga.css** - All panchanga-specific CSS

#### Tests
- **tests/panchanga-calculator.test.js** - Unit tests
- **tests/panchanga-calculator-integration.test.js** - Integration tests
- **tests/e2e.spec.js** - End-to-end browser tests

### Making Changes

1. **Edit the file**
   ```bash
   vim assets/js/panchanga-calculator.js
   ```

2. **Test your changes**
   ```bash
   ./scripts/feature-workflow.sh test
   ```

3. **If tests fail:**
   - Read error message
   - Fix the code
   - Test again

4. **If tests pass:**
   ```bash
   ./scripts/feature-workflow.sh commit "Your change"
   ```

---

## 🐛 Debugging

### Browser Debugging

1. **Open dev tools in browser:**
   - Chrome/Firefox: Press `F12`
   - View source with `Ctrl+U` (or `Cmd+U` on Mac)

2. **Check console for errors:**
   - Look for red error messages
   - Note the line number

3. **Fix the code:**
   - Edit the JavaScript file
   - The page auto-reloads (if using dev server)
   - Check console again

### Test Debugging

1. **Run a specific test:**
   ```bash
   node tests/panchanga-calculator.test.js
   ```

2. **Look at the error:**
   ```
   ❌ Test: Tithi calculation
   Expected: 15
   Got: undefined
   ```

3. **Find the issue:**
   - Search for "Tithi" in panchanga-calculator.js
   - Check if function returns undefined

4. **Fix and test again:**
   ```bash
   ./scripts/feature-workflow.sh test
   ```

### E2E Test Debugging

1. **Run with debug mode:**
   ```bash
   npm run test:e2e:debug
   ```

2. **Use UI inspector:**
   ```bash
   npm run test:e2e:ui
   ```

3. **Check screenshots:**
   ```bash
   ls tests/test-results/screenshots/
   ```

---

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| [CLAUDE.md](../CLAUDE.md) | Project overview, architecture, features |
| [SKILLS.md](../SKILLS.md) | Technical skills, infrastructure details |
| [TESTING.md](../TESTING.md) | Complete testing strategy and guide |
| [.claude/WORKFLOW.md](./WORKFLOW.md) | Development workflow (READ THIS!) |
| [.claude/config.json](./config.json) | Machine-readable project config |
| [WIDGET_BUG_FIXES.md](../WIDGET_BUG_FIXES.md) | Known widget issues and fixes |

---

## 🆘 Getting Help

### If Something Breaks

1. **Read the error message carefully**
2. **Check the documentation** (especially TESTING.md)
3. **Look at similar code** that works
4. **Run tests** to identify the issue
5. **Fix the code**
6. **Test again**

### Common Issues

**Q: Tests fail with "SearchSunLongitude failed"**
A: This is expected - it's a fallback calculation. Tests should still pass overall.

**Q: Container won't start**
A: Check `podman-compose logs saivamcloud-dev` for error messages.

**Q: Location search returns no results**
A: Check internet connection (uses Nominatim API), or try a different location.

**Q: VERSION file is wrong**
A: The post-commit hook has a bug. Manually edit VERSION file and commit again.

---

## 🚀 Deployment

### Before Pushing to GitHub

**Checklist:**
- [ ] Feature branch created (not main)
- [ ] All changes committed with workflow script
- [ ] All tests passing: `npm test`
- [ ] E2E tests passing (optional): `npm run test:e2e`
- [ ] VERSION file incremented
- [ ] Feature merged to main: `./scripts/feature-workflow.sh finish`

**Then push:**
```bash
./scripts/push-to-github.sh
```

### GitHub Pages Deployment

Once pushed to main:
1. GitHub automatically triggers Actions
2. Jekyll builds the site
3. Site updates at https://your-username.github.io/shivavakkiyar/

No additional deployment needed!

---

## 💡 Tips & Best Practices

1. **Commit frequently** - After every testable change (5-10 min of work)
2. **Write clear messages** - Future you will thank you
3. **Test before committing** - Always
4. **Use feature branches** - Never commit to main directly
5. **Keep changes focused** - Don't mix unrelated changes
6. **Read error messages** - They tell you exactly what's wrong
7. **Ask for help** - Stuck? Ask someone or check docs

---

## 📞 Contact & Support

- **Issues**: Check GitHub Issues for known problems
- **Documentation**: See files in `.claude/` and project root
- **Configuration**: Edit `.claude/config.json` for project settings

**Remember:** Always follow the workflow. Always test. Always commit with the script.

Enjoy developing! 🎉
