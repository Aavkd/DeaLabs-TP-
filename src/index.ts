/**
 * @file CLI entry point with Inquirer interactive menu
 * @description Main application loop with user interaction - Enhanced with animations
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import Table from 'cli-table3';
import figlet from 'figlet';
import {
  createDeal,
  listDeals,
  getDealById,
  searchDeals,
  getTopHottest,
  getCategoryStats,
  calculateDiscount,
} from './dealManager';
import { voteHot, voteCold, getVoteStats } from './voteManager';
import { seedDataIfEmpty } from './storage';
import { getValidCategories } from './validators';
import { logError } from './logger';
import { isSuccess, CategoryValue } from './types';

const MENU_CHOICES = {
  CREATE: '📝  Create a new deal',
  LIST: '📋  List all deals',
  DETAIL: '🔍  View deal details',
  SEARCH: '🔎  Search deals',
  VOTE_HOT: '🔥  Vote HOT on a deal',
  VOTE_COLD: '❄️   Vote COLD on a deal',
  STATS: '📊  View statistics',
  EXIT: '👋  Exit',
};

/**
 * Utility function to create a delay (for animations)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Safely formats a date string, returning the original if parsing fails
 * @param dateString - The date string to format
 * @returns Formatted date or original string if invalid
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

/**
 * Display a styled banner
 */
function displayBanner(): void {
  const banner = figlet.textSync('Mini Dealabs', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
  });
  // eslint-disable-next-line no-console
  console.log(gradient.pastel.multiline(banner));
  // eslint-disable-next-line no-console
  console.log(
    boxen(chalk.white.bold('Your CLI for managing deals and votes'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      align: 'center',
    })
  );
}

/**
 * Display a styled section header
 */
function displaySectionHeader(icon: string, title: string, subtitle?: string): void {
  // eslint-disable-next-line no-console
  console.log('\n');
  // eslint-disable-next-line no-console
  console.log(
    boxen(chalk.cyan.bold(`${icon}  ${title}`) + (subtitle ? `\n${chalk.gray(subtitle)}` : ''), {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'cyan',
      dimBorder: true,
    })
  );
  // eslint-disable-next-line no-console
  console.log('');
}

/**
 * Display a success message
 */
function displaySuccess(message: string, details?: string): void {
  // eslint-disable-next-line no-console
  console.log(
    boxen(chalk.green.bold(`✅ ${message}`) + (details ? `\n\n${chalk.gray(details)}` : ''), {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'green',
    })
  );
}

/**
 * Display an error message
 */
function displayError(message: string): void {
  // eslint-disable-next-line no-console
  console.log(
    boxen(chalk.red.bold(`❌ ${message}`), {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'red',
    })
  );
}

/**
 * Display an info box
 */
function displayInfo(title: string, content: string): void {
  const formattedContent = `${chalk.yellow.bold(title)}\n\n${content}`;
  // eslint-disable-next-line no-console
  console.log(
    boxen(formattedContent, {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
    })
  );
}


/**
 * Handles creating a new deal
 */
async function handleCreateDeal(): Promise<void> {
  try {
    displaySectionHeader('📝', 'Create a New Deal', 'Fill in the deal information below');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: chalk.cyan('Deal title:'),
        validate: (input: string) =>
          input.trim().length >= 3 || 'Title must be at least 3 characters',
        prefix: '  ',
      },
      {
        type: 'number',
        name: 'originalPrice',
        message: chalk.cyan('Original price (€):'),
        validate: (input: number) =>
          (!Number.isNaN(input) && input >= 0) || 'Must be a valid positive number',
        prefix: '  ',
      },
      {
        type: 'number',
        name: 'discountedPrice',
        message: chalk.cyan('Discounted price (€):'),
        validate: (input: number) =>
          (!Number.isNaN(input) && input >= 0) || 'Must be a valid positive number',
        prefix: '  ',
      },
      {
        type: 'input',
        name: 'url',
        message: chalk.cyan('Deal URL:'),
        validate: (input: string) =>
          /^https?:\/\/.+/i.test(input) || 'Must be a valid HTTP/HTTPS URL',
        prefix: '  ',
      },
      {
        type: 'list',
        name: 'category',
        message: chalk.cyan('Category:'),
        choices: getValidCategories(),
        prefix: '  ',
      },
    ]);

    const spinner = ora({
      text: 'Creating deal...',
      color: 'cyan',
    }).start();

    await sleep(500); // Smooth animation

    const result = await createDeal(answers);

    if (isSuccess(result)) {
      spinner.succeed('Deal created successfully!');
      const discount = calculateDiscount(result.value);

      const details = [
        `${chalk.bold('ID:')} ${chalk.gray(result.value.id)}`,
        `${chalk.bold('Discount:')} ${chalk.green(`-${discount}%`)}`,
        `${chalk.bold('Temperature:')} ${chalk.yellow(`${result.value.temperature}°`)}`,
      ].join('\n');

      displaySuccess('Deal Created', details);
    } else {
      spinner.fail('Failed to create deal');
      displayError(result.error.message);
    }
  } catch (error) {
    logError('Error creating deal', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Handles listing all deals
 */
async function handleListDeals(): Promise<void> {
  try {
    displaySectionHeader('📋', 'All Deals', 'Sorted by temperature (hottest first)');

    const spinner = ora({
      text: 'Loading deals...',
      color: 'cyan',
    }).start();

    await sleep(300);

    const result = await listDeals();

    if (isSuccess(result)) {
      spinner.stop();

      if (result.value.length === 0) {
        displayInfo('No Deals Found', 'Create your first deal to get started!');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan.bold('Title'),
          chalk.cyan.bold('Category'),
          chalk.cyan.bold('Price'),
          chalk.cyan.bold('Discount'),
          chalk.cyan.bold('Temp'),
          chalk.cyan.bold('Votes'),
          chalk.cyan.bold('ID'),
        ],
        colWidths: [28, 12, 15, 10, 8, 12, 10],
        style: {
          head: [],
          border: ['gray'],
        },
      });

      result.value.forEach((deal) => {
        const discount = calculateDiscount(deal);
        const tempColor = deal.temperature > 0 ? chalk.red : chalk.blue;
        const priceDisplay = `${chalk.gray.strikethrough(`€${deal.originalPrice}`)} → ${chalk.green(`€${deal.discountedPrice}`)}`;
        const shortId = deal.id.substring(0, 8);

        table.push([
          chalk.bold(deal.title.length > 25 ? `${deal.title.substring(0, 25)}...` : deal.title),
          chalk.gray(deal.category),
          priceDisplay,
          chalk.green(`-${discount}%`),
          tempColor(`${deal.temperature}°`),
          `👍 ${deal.votesHot} 👎 ${deal.votesCold}`,
          chalk.gray(shortId),
        ]);
      });

      // eslint-disable-next-line no-console
      console.log(table.toString());
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`\nTotal: ${result.value.length} deal(s)\n`));
    } else {
      spinner.fail('Failed to load deals');
      displayError(result.error.message);
    }
  } catch (error) {
    logError('Error listing deals', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Handles viewing deal details
 */
async function handleDealDetail(): Promise<void> {
  try {
    const { dealId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'dealId',
        message: chalk.cyan('Enter deal ID:'),
        prefix: '  ',
      },
    ]);

    const spinner = ora({
      text: 'Fetching deal details...',
      color: 'cyan',
    }).start();

    await sleep(300);

    const result = await getDealById(dealId as string);

    if (isSuccess(result)) {
      spinner.succeed('Deal found!');

      const deal = result.value;
      const discount = calculateDiscount(deal);
      const stats = getVoteStats(deal);
      const tempColor = deal.temperature > 0 ? chalk.red : chalk.blue;

      const details = [
        '',
        chalk.bold.cyan('═'.repeat(50)),
        chalk.bold.yellow(deal.title),
        chalk.bold.cyan('═'.repeat(50)),
        '',
        `${chalk.bold('ID:')}           ${chalk.gray(deal.id)}`,
        `${chalk.bold('Category:')}     ${chalk.cyan(deal.category)}`,
        `${chalk.bold('URL:')}          ${chalk.blue.underline(deal.url)}`,
        '',
        chalk.bold.cyan('💰 Pricing'),
        `  Original:     ${chalk.gray.strikethrough(`€${deal.originalPrice}`)}`,
        `  Discounted:   ${chalk.green.bold(`€${deal.discountedPrice}`)}`,
        `  Discount:     ${chalk.green(`-${discount}%`)}`,
        '',
        chalk.bold.cyan('🌡️  Temperature & Votes'),
        `  Temperature:  ${tempColor.bold(`${deal.temperature}°`)}`,
        `  Hot votes:    ${chalk.red(`👍 ${stats.votesHot}`)}`,
        `  Cold votes:   ${chalk.blue(`👎 ${stats.votesCold}`)}`,
        `  Hot ratio:    ${chalk.yellow(`${stats.hotPercentage}%`)}`,
        '',
        `${chalk.bold('Created:')}     ${chalk.gray(formatDate(deal.createdAt))}`,
        '',
      ].join('\n');

      // eslint-disable-next-line no-console
      console.log(
        boxen(details, {
          padding: 1,
          borderStyle: 'double',
          borderColor: 'cyan',
        })
      );
    } else {
      spinner.fail('Deal not found');
      displayError(result.error.message);
    }
  } catch (error) {
    logError('Error viewing deal detail', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Handles searching deals
 */
async function handleSearch(): Promise<void> {
  try {
    displaySectionHeader('🔎', 'Search Deals', 'Find deals by keyword, category, or both');

    const { searchType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'searchType',
        message: chalk.cyan('Search by:'),
        choices: ['Keyword', 'Category', 'Both', 'Cancel'],
        prefix: '  ',
      },
    ]);

    if (searchType === 'Cancel') {
      return;
    }

    let keyword: string | undefined;
    let category: CategoryValue | undefined;

    if (searchType === 'Keyword' || searchType === 'Both') {
      const { kw } = await inquirer.prompt([
        {
          type: 'input',
          name: 'kw',
          message: chalk.cyan('Enter keyword:'),
          prefix: '  ',
        },
      ]);
      keyword = kw as string;
    }

    if (searchType === 'Category' || searchType === 'Both') {
      const { cat } = await inquirer.prompt([
        {
          type: 'list',
          name: 'cat',
          message: chalk.cyan('Select category:'),
          choices: getValidCategories(),
          prefix: '  ',
        },
      ]);
      category = cat as CategoryValue;
    }

    const spinner = ora({
      text: 'Searching deals...',
      color: 'cyan',
    }).start();

    await sleep(400);

    const result = await searchDeals(keyword, category);

    if (isSuccess(result)) {
      spinner.succeed(`Found ${result.value.length} deal(s)`);

      if (result.value.length === 0) {
        displayInfo('No Results', 'No deals match your search criteria.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan.bold('Title'),
          chalk.cyan.bold('Category'),
          chalk.cyan.bold('Price'),
          chalk.cyan.bold('Discount'),
          chalk.cyan.bold('Temp'),
          chalk.cyan.bold('ID'),
        ],
        colWidths: [32, 12, 15, 10, 8, 10],
        style: {
          head: [],
          border: ['gray'],
        },
      });

      result.value.forEach((deal) => {
        const discount = calculateDiscount(deal);
        const tempColor = deal.temperature > 0 ? chalk.red : chalk.blue;
        const shortId = deal.id.substring(0, 8);

        table.push([
          chalk.bold(deal.title.length > 29 ? `${deal.title.substring(0, 29)}...` : deal.title),
          chalk.gray(deal.category),
          chalk.green(`€${deal.discountedPrice}`),
          chalk.green(`-${discount}%`),
          tempColor(`${deal.temperature}°`),
          chalk.gray(shortId),
        ]);
      });

      // eslint-disable-next-line no-console
      console.log(table.toString());
      // eslint-disable-next-line no-console
      console.log('');
    } else {
      spinner.fail('Search failed');
      displayError(result.error.message);
    }
  } catch (error) {
    logError('Error searching deals', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Handles voting on a deal
 * @param voteType - 'hot' or 'cold'
 */
async function handleVote(voteType: 'hot' | 'cold'): Promise<void> {
  try {
    const voteIcon = voteType === 'hot' ? '🔥' : '❄️';
    const voteColor = voteType === 'hot' ? chalk.red : chalk.blue;

    displaySectionHeader(voteIcon, `Vote ${voteType.toUpperCase()}`, 'Cast your vote on a deal');

    const { dealId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'dealId',
        message: chalk.cyan('Enter deal ID to vote on:'),
        prefix: '  ',
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: voteColor(`Vote ${voteType.toUpperCase()} on this deal?`),
        default: true,
        prefix: '  ',
      },
    ]);

    if (!confirm) {
      // eslint-disable-next-line no-console
      console.log(chalk.gray('\n  Vote cancelled.\n'));
      return;
    }

    const spinner = ora({
      text: `Casting ${voteType.toUpperCase()} vote...`,
      color: voteType === 'hot' ? 'red' : 'blue',
    }).start();

    await sleep(400);

    const result =
      voteType === 'hot' ? await voteHot(dealId as string) : await voteCold(dealId as string);

    if (isSuccess(result)) {
      spinner.succeed(`Voted ${voteType.toUpperCase()}! ${voteIcon}`);

      const tempColor = result.value.temperature > 0 ? chalk.red : chalk.blue;
      const details = [
        `${chalk.bold('New Temperature:')} ${tempColor.bold(`${result.value.temperature}°`)}`,
        `${chalk.bold('Hot Votes:')} ${chalk.red(`👍 ${result.value.votesHot}`)}`,
        `${chalk.bold('Cold Votes:')} ${chalk.blue(`👎 ${result.value.votesCold}`)}`,
      ].join('\n');

      displaySuccess(`Vote ${voteType.toUpperCase()} Registered`, details);
    } else {
      spinner.fail('Vote failed');
      displayError(result.error.message);
    }
  } catch (error) {
    logError('Error voting', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Handles displaying statistics
 */
async function handleStats(): Promise<void> {
  try {
    displaySectionHeader('📊', 'Statistics Dashboard', 'Overview of deals and categories');

    const spinner = ora({
      text: 'Calculating statistics...',
      color: 'cyan',
    }).start();

    await sleep(300);

    // Top 3 hottest
    const topResult = await getTopHottest(3);
    const statsResult = await getCategoryStats();

    spinner.succeed('Statistics loaded!');

    // eslint-disable-next-line no-console
    console.log('');

    if (isSuccess(topResult)) {
      // eslint-disable-next-line no-console
      console.log(chalk.bold.red('🔥 Top 3 Hottest Deals\n'));

      if (topResult.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('  No deals yet.\n'));
      } else {
        const hottestTable = new Table({
          head: [chalk.red.bold('Rank'), chalk.red.bold('Deal'), chalk.red.bold('Temperature')],
          colWidths: [8, 50, 15],
          style: {
            head: [],
            border: ['red'],
          },
        });

        topResult.value.forEach((deal, index) => {
          let medal = '🥉';
          if (index === 0) {
            medal = '🥇';
          } else if (index === 1) {
            medal = '🥈';
          }
          hottestTable.push([
            `${medal} ${index + 1}`,
            chalk.bold(deal.title.length > 47 ? `${deal.title.substring(0, 47)}...` : deal.title),
            chalk.red.bold(`${deal.temperature}°`),
          ]);
        });

        // eslint-disable-next-line no-console
        console.log(hottestTable.toString());
        // eslint-disable-next-line no-console
        console.log('');
      }
    }

    // Category stats
    if (isSuccess(statsResult)) {
      // eslint-disable-next-line no-console
      console.log(chalk.bold.cyan('📦 Deals by Category\n'));

      if (statsResult.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('  No deals yet.\n'));
      } else {
        const categoryTable = new Table({
          head: [chalk.cyan.bold('Category'), chalk.cyan.bold('Count'), chalk.cyan.bold('Bar')],
          colWidths: [20, 10, 40],
          style: {
            head: [],
            border: ['cyan'],
          },
        });

        const maxCount = Math.max(...statsResult.value.map((s) => s.count));

        statsResult.value.forEach((stat) => {
          const barLength = Math.round((stat.count / maxCount) * 30);
          const bar = chalk.green('█'.repeat(barLength));
          categoryTable.push([chalk.bold(stat.category), stat.count, bar]);
        });

        // eslint-disable-next-line no-console
        console.log(categoryTable.toString());
        // eslint-disable-next-line no-console
        console.log('');
      }
    }
  } catch (error) {
    logError('Error displaying stats', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Displays the main menu and handles user selection
 */
async function showMainMenu(): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(
      chalk.gray('─'.repeat(60))
    );

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.bold.white('What would you like to do?'),
        choices: Object.values(MENU_CHOICES),
        prefix: chalk.cyan('  ❯'),
        pageSize: 10,
      },
    ]);

    switch (action) {
      case MENU_CHOICES.CREATE:
        await handleCreateDeal();
        break;
      case MENU_CHOICES.LIST:
        await handleListDeals();
        break;
      case MENU_CHOICES.DETAIL:
        await handleDealDetail();
        break;
      case MENU_CHOICES.SEARCH:
        await handleSearch();
        break;
      case MENU_CHOICES.VOTE_HOT:
        await handleVote('hot');
        break;
      case MENU_CHOICES.VOTE_COLD:
        await handleVote('cold');
        break;
      case MENU_CHOICES.STATS:
        await handleStats();
        break;
      case MENU_CHOICES.EXIT:
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log(
          boxen(
            gradient.rainbow('Thanks for using Mini Dealabs!\n') +
              chalk.gray('See you next time! 👋'),
            {
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'cyan',
              align: 'center',
            }
          )
        );
        process.exit(0);
        break;
      default:
        displayError('Invalid action');
    }
  } catch (error) {
    logError('Error in main menu', error as Error);
    displayError((error as Error).message);
  }
}


/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Clear console for clean start
    // eslint-disable-next-line no-console
    console.clear();

    // Display animated banner
    displayBanner();

    // Initialize data with spinner
    const spinner = ora({
      text: 'Initializing application...',
      color: 'cyan',
    }).start();

    await seedDataIfEmpty();
    await sleep(500);

    spinner.succeed('Application ready!');
    // eslint-disable-next-line no-console
    console.log('');

    // Main loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await showMainMenu();
    }
  } catch (error) {
    logError('Fatal error in main', error as Error);
    displayError(`Fatal error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  logError('Unhandled error', error as Error);
  // eslint-disable-next-line no-console
  console.error(chalk.red('\n💥 Unhandled error:'), error);
  process.exit(1);
});
