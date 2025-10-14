# Mini Dealabs CLI - TRAORE Alexy

A professional TypeScript CLI application for managing deals, votes, and statistics - built with clean code principles, comprehensive testing, and robust error handling.

**Author**: Alexy TRAORE  
**Project**: TP Final - Bonne Pratique Dev

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Development](#development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Deal Management

- **Create deals** with title, prices, URL, and category
- **List deals** sorted by temperature (hotness)
- **View deal details** with full information
- **Search deals** by keyword and/or category

### Voting System

- Vote **HOT** (+1 temperature) or **COLD** (-1 temperature)
- Automatic temperature calculation
- Vote statistics per deal

### Statistics

- Top 3 hottest deals
- Deal count by category
- Discount percentage calculation

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Language**: TypeScript (strict mode)
- **CLI Framework**: Inquirer v8 (interactive menus)
- **Logging**: Winston (structured logging)
- **Testing**: Jest with ts-jest
- **Documentation**: TypeDoc (TSDoc comments)
- **Code Quality**: ESLint + Prettier (Airbnb style)
- **Styling**: Chalk (terminal colors)

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Setup

```bash
# Clone or extract the project
cd TRAORE-Alexy-mini-dealabs

# Install dependencies
npm install

# Build the project
npm run build
```

## 🚀 Usage

### Development Mode (TypeScript)

```bash
npm run dev
```

### Production Mode (Compiled)

```bash
npm start
```

### Interactive Menu

Once started, you'll see an interactive menu:

```
🎯 Welcome to Mini Dealabs CLI

? What would you like to do?
  Create a new deal
  List all deals
  View deal details
  Search deals
  Vote HOT on a deal
  Vote COLD on a deal
  View statistics
  Exit
```

### Example Workflow

1. **Create a Deal**
   - Select "Create a new deal"
   - Enter title: `Gaming Laptop RTX 4060`
   - Enter original price: `1200`
   - Enter discounted price: `999`
   - Enter URL: `https://amazon.com/laptop`
   - Select category: `Tech`

2. **Vote on a Deal**
   - Select "Vote HOT on a deal"
   - Enter the deal ID (shown in list)
   - Confirm the vote

3. **View Statistics**
   - Select "View statistics"
   - See top 3 hottest deals and category breakdown

## 📁 Project Structure

```
TRAORE-Alexy-mini-dealabs/
├─ src/
│   ├─ index.ts               # CLI entry point (Inquirer menu)
│   ├─ dealManager.ts         # Deal business logic
│   ├─ voteManager.ts         # Vote logic
│   ├─ validators.ts          # Input validation
│   ├─ logger.ts              # Winston configuration
│   ├─ storage.ts             # JSON persistence
│   ├─ types.ts               # TypeScript types & Result monad
│   └─ data/
│       └─ deals.json         # Persistent data (auto-created)
├─ __tests__/
│   ├─ validators.test.ts     # Validator tests
│   ├─ dealManager.test.ts    # Deal manager tests
│   └─ voteManager.test.ts    # Vote manager tests
├─ docs/                      # Generated TypeDoc HTML
├─ dist/                      # Compiled JavaScript (git-ignored)
├─ logs/                      # Application logs (git-ignored)
├─ package.json
├─ tsconfig.json
├─ jest.config.ts
├─ .eslintrc.json
├─ .prettierrc
├─ typedoc.json
└─ README.md
```

## 📜 Scripts

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Run CLI in development mode (tsx) |
| `npm run build`      | Compile TypeScript to dist/       |
| `npm start`          | Run compiled CLI (production)     |
| `npm run lint`       | Check code with ESLint            |
| `npm run lint:fix`   | Auto-fix ESLint issues            |
| `npm run format`     | Format code with Prettier         |
| `npm test`           | Run all tests                     |
| `npm run test:watch` | Run tests in watch mode           |
| `npm run docs`       | Generate TypeDoc documentation    |

## 🔧 Development

### Code Style

This project follows strict coding standards:

- **Clean Code**: SRP, DRY, KISS principles
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`
- **Line Length**: Max 100 characters
- **Naming**: camelCase for variables/functions, PascalCase for types
- **Comments**: TSDoc for all public functions
- **Error Handling**: Result/Either pattern, no crashes

### Adding a New Feature

1. Define types in `src/types.ts`
2. Add validation in `src/validators.ts`
3. Implement logic in appropriate manager
4. Add tests in `__tests__/`
5. Update CLI menu in `src/index.ts`
6. Run lint, format, and tests

### Logging

Use logger functions instead of console:

```typescript
import { logInfo, logError, logDebug } from './logger';

logInfo('Deal created', { dealId: '123' });
logError('Failed to save', error);
```

Logs are written to:

- `logs/combined.log` (all levels)
- `logs/error.log` (errors only)
- Console (development)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Test Structure

- **Unit tests**: All business logic and validators
- **Mocks**: Storage and logger are mocked
- **Coverage**: Target 80%+ for core logic

### Example Test

```typescript
it('should create a valid deal with temperature 0', async () => {
  const input = {
    title: 'Test Deal',
    originalPrice: 100,
    discountedPrice: 80,
    url: 'https://example.com',
    category: 'Tech' as const,
  };

  const result = await createDeal(input);

  expect(isSuccess(result)).toBe(true);
  if (isSuccess(result)) {
    expect(result.value.temperature).toBe(0);
  }
});
```

## 📚 Documentation

### Generate Docs

```bash
npm run docs
```

Docs are generated to `docs/` folder. Open `docs/index.html` in browser.

### TSDoc Comments

All public functions have TSDoc comments:

```typescript
/**
 * Creates a new deal and persists it
 * @param input - Deal creation input data
 * @returns Result containing the created deal or an error
 */
export async function createDeal(input: CreateDealInput): Promise<Result<Deal>>;
```

## ✅ Code Quality

### ESLint + Prettier

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Format all files
npm run format
```

### Pre-commit Checklist

```bash
npm run lint
npm run format
npm test
npm run build
```

All commands should pass without errors.

## 🔍 Troubleshooting

### Issue: Dependencies not found

**Solution**: Run `npm install`

### Issue: TypeScript errors

**Solution**: Ensure TypeScript is installed: `npm install -D typescript`

### Issue: Can't run dev mode

**Solution**: Install tsx: `npm install -D tsx`

### Issue: Tests fail

**Solution**:

- Check Node version (>= 16)
- Clear Jest cache: `npx jest --clearCache`
- Reinstall: `rm -rf node_modules && npm install`

### Issue: Data file missing

**Solution**: The app auto-creates `src/data/deals.json` with sample data on first run.

### Issue: Port/Permission errors

**Solution**: This is a CLI app, not a server - no ports used.

### Issue: ESLint/Prettier conflicts

**Solution**: Prettier is configured to disable conflicting ESLint rules. Run `npm run format` then `npm run lint:fix`.

## 🎯 Complete Verification

Run all checks:

```bash
npm install
npm run lint
npm run format
npm run build
npm test
npm run docs
npm run dev        # Test interactively
npm start          # Test compiled version
```

All commands should succeed ✅

## 📝 License

MIT

## 👤 Author

**Alexy TRAORE**

---

**Built with ❤️ using TypeScript, Clean Code principles, and best practices**
