/**
 * @file CLI entry point with Inquirer interactive menu
 * @description Main application loop with user interaction
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
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
  CREATE: 'Create a new deal',
  LIST: 'List all deals',
  DETAIL: 'View deal details',
  SEARCH: 'Search deals',
  VOTE_HOT: 'Vote HOT on a deal',
  VOTE_COLD: 'Vote COLD on a deal',
  STATS: 'View statistics',
  EXIT: 'Exit',
};

/**
 * Handles creating a new deal
 */
async function handleCreateDeal(): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('\n📝 Create a New Deal\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Deal title:',
        validate: (input: string) =>
          input.trim().length >= 3 || 'Title must be at least 3 characters',
      },
      {
        type: 'number',
        name: 'originalPrice',
        message: 'Original price (€):',
        validate: (input: number) =>
          (!Number.isNaN(input) && input >= 0) || 'Must be a valid positive number',
      },
      {
        type: 'number',
        name: 'discountedPrice',
        message: 'Discounted price (€):',
        validate: (input: number) =>
          (!Number.isNaN(input) && input >= 0) || 'Must be a valid positive number',
      },
      {
        type: 'input',
        name: 'url',
        message: 'Deal URL:',
        validate: (input: string) =>
          /^https?:\/\/.+/i.test(input) || 'Must be a valid HTTP/HTTPS URL',
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: getValidCategories(),
      },
    ]);

    const result = await createDeal(answers);

    if (isSuccess(result)) {
      const discount = calculateDiscount(result.value);
      // eslint-disable-next-line no-console
      console.log(chalk.green('\n✅ Deal created successfully!'));
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`ID: ${result.value.id}`));
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`Discount: ${discount}%\n`));
    } else {
      // eslint-disable-next-line no-console
      console.log(chalk.red(`\n❌ Error: ${result.error.message}\n`));
    }
  } catch (error) {
    logError('Error creating deal', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Handles listing all deals
 */
async function handleListDeals(): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('\n📋 All Deals (sorted by temperature)\n'));

    const result = await listDeals();

    if (isSuccess(result)) {
      if (result.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('No deals found.\n'));
        return;
      }

      result.value.forEach((deal, index) => {
        const discount = calculateDiscount(deal);
        const tempColor = deal.temperature > 0 ? chalk.red : chalk.blue;
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${chalk.bold(deal.title)} [${deal.category}]`);
        // eslint-disable-next-line no-console
        console.log(
          `   ${chalk.strikethrough(`€${deal.originalPrice}`)} → ` +
            `${chalk.green(`€${deal.discountedPrice}`)} ` +
            `(${chalk.green(`-${discount}%`)})`
        );
        // eslint-disable-next-line no-console
        console.log(
          `   🌡️  ${tempColor(`${deal.temperature}°`)} (👍 ${deal.votesHot} | 👎 ${deal.votesCold})`
        );
        // eslint-disable-next-line no-console
        console.log(chalk.gray(`   ID: ${deal.id}\n`));
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(chalk.red(`\n❌ Error: ${result.error.message}\n`));
    }
  } catch (error) {
    logError('Error listing deals', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
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
        message: 'Enter deal ID:',
      },
    ]);

    const result = await getDealById(dealId as string);

    if (isSuccess(result)) {
      const deal = result.value;
      const discount = calculateDiscount(deal);
      const stats = getVoteStats(deal);

      // eslint-disable-next-line no-console
      console.log(chalk.yellow('\n🔍 Deal Details\n'));
      // eslint-disable-next-line no-console
      console.log(chalk.bold(deal.title));
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`ID: ${deal.id}`));
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`Category: ${deal.category}`));
      // eslint-disable-next-line no-console
      console.log(
        `Price: ${chalk.strikethrough(`€${deal.originalPrice}`)} → ` +
          `${chalk.green(`€${deal.discountedPrice}`)} ` +
          `(${chalk.green(`-${discount}%`)})`
      );
      // eslint-disable-next-line no-console
      console.log(`URL: ${chalk.cyan(deal.url)}`);
      // eslint-disable-next-line no-console
      console.log(
        `Temperature: ${(deal.temperature > 0 ? chalk.red : chalk.blue)(`${deal.temperature}°`)}`
      );
      // eslint-disable-next-line no-console
      console.log(`Votes: 👍 ${stats.votesHot} | 👎 ${stats.votesCold}`);
      // eslint-disable-next-line no-console
      console.log(`Hot percentage: ${stats.hotPercentage}%`);
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`Created: ${deal.createdAt}\n`));
    } else {
      // eslint-disable-next-line no-console
      console.log(chalk.red(`\n❌ Error: ${result.error.message}\n`));
    }
  } catch (error) {
    logError('Error viewing deal detail', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Handles searching deals
 */
async function handleSearch(): Promise<void> {
  try {
    const { searchType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'searchType',
        message: 'Search by:',
        choices: ['Keyword', 'Category', 'Both', 'Cancel'],
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
          message: 'Enter keyword:',
        },
      ]);
      keyword = kw as string;
    }

    if (searchType === 'Category' || searchType === 'Both') {
      const { cat } = await inquirer.prompt([
        {
          type: 'list',
          name: 'cat',
          message: 'Select category:',
          choices: getValidCategories(),
        },
      ]);
      category = cat as CategoryValue;
    }

    const result = await searchDeals(keyword, category);

    if (isSuccess(result)) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`\n🔎 Search Results (${result.value.length})\n`));

      if (result.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('No deals found.\n'));
        return;
      }

      result.value.forEach((deal, index) => {
        const discount = calculateDiscount(deal);
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${chalk.bold(deal.title)} [${deal.category}]`);
        // eslint-disable-next-line no-console
        console.log(
          `   €${deal.discountedPrice} (${chalk.green(`-${discount}%`)}) ` +
            `🌡️  ${deal.temperature}°`
        );
        // eslint-disable-next-line no-console
        console.log(chalk.gray(`   ID: ${deal.id}\n`));
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(chalk.red(`\n❌ Error: ${result.error.message}\n`));
    }
  } catch (error) {
    logError('Error searching deals', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Handles voting on a deal
 * @param voteType - 'hot' or 'cold'
 */
async function handleVote(voteType: 'hot' | 'cold'): Promise<void> {
  try {
    const { dealId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'dealId',
        message: 'Enter deal ID to vote on:',
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Vote ${voteType.toUpperCase()} on this deal?`,
        default: true,
      },
    ]);

    if (!confirm) {
      // eslint-disable-next-line no-console
      console.log(chalk.gray('\nVote cancelled.\n'));
      return;
    }

    const result =
      voteType === 'hot' ? await voteHot(dealId as string) : await voteCold(dealId as string);

    if (isSuccess(result)) {
      const emoji = voteType === 'hot' ? '🔥' : '❄️';
      // eslint-disable-next-line no-console
      console.log(
        chalk.green(
          `\n✅ Voted ${voteType.toUpperCase()}! ${emoji} ` +
            `New temperature: ${result.value.temperature}°\n`
        )
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(chalk.red(`\n❌ Error: ${result.error.message}\n`));
    }
  } catch (error) {
    logError('Error voting', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Handles displaying statistics
 */
async function handleStats(): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('\n📊 Statistics\n'));

    // Top 3 hottest
    const topResult = await getTopHottest(3);
    if (isSuccess(topResult)) {
      // eslint-disable-next-line no-console
      console.log(chalk.bold('🔥 Top 3 Hottest Deals:\n'));
      if (topResult.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('  No deals yet.\n'));
      } else {
        topResult.value.forEach((deal, index) => {
          // eslint-disable-next-line no-console
          console.log(`  ${index + 1}. ${deal.title} - ${chalk.red(`${deal.temperature}°`)}`);
        });
        // eslint-disable-next-line no-console
        console.log('');
      }
    }

    // Category stats
    const statsResult = await getCategoryStats();
    if (isSuccess(statsResult)) {
      // eslint-disable-next-line no-console
      console.log(chalk.bold('📦 Deals by Category:\n'));
      if (statsResult.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray('  No deals yet.\n'));
      } else {
        statsResult.value.forEach((stat) => {
          // eslint-disable-next-line no-console
          console.log(`  ${stat.category}: ${stat.count} deal(s)`);
        });
        // eslint-disable-next-line no-console
        console.log('');
      }
    }
  } catch (error) {
    logError('Error displaying stats', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Displays the main menu and handles user selection
 */
async function showMainMenu(): Promise<void> {
  try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: Object.values(MENU_CHOICES),
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
        console.log(chalk.cyan('\n👋 Goodbye! Thanks for using Mini Dealabs.\n'));
        process.exit(0);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(chalk.red('Invalid action'));
    }
  } catch (error) {
    logError('Error in main menu', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n❌ Error: ${(error as Error).message}\n`));
  }
}

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Initialize data
    await seedDataIfEmpty();

    // Display welcome message
    // eslint-disable-next-line no-console
    console.log(chalk.cyan.bold('\n🎯 Welcome to Mini Dealabs CLI\n'));

    // Main loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await showMainMenu();
    }
  } catch (error) {
    logError('Fatal error in main', error as Error);
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n💥 Fatal error: ${(error as Error).message}\n`));
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
