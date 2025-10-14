/**
 * @file Vote management logic
 * @description Handles voting on deals (hot/cold) and temperature updates
 */

import { Deal, VoteAction, Result, success, failure } from './types';
import { loadDeals, saveDeals } from './storage';
import { logInfo, logError, logDebug } from './logger';

/**
 * Calculates temperature from vote counts
 * @param votesHot - Number of hot votes
 * @param votesCold - Number of cold votes
 * @returns Temperature score (hot - cold)
 */
export function calculateTemperature(votesHot: number, votesCold: number): number {
  return votesHot - votesCold;
}

/**
 * Internal vote function
 * @param dealId - The ID of the deal to vote on
 * @param action - Vote action (hot or cold)
 * @returns Result containing the updated deal or an error
 */
async function vote(dealId: string, action: VoteAction): Promise<Result<Deal>> {
  try {
    if (!dealId || typeof dealId !== 'string') {
      throw new Error('Deal ID is required');
    }

    const deals = await loadDeals();
    const dealIndex = deals.findIndex((d) => d.id === dealId);

    if (dealIndex === -1) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }

    const deal = deals[dealIndex];

    if (!deal) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }

    // Update vote counts and temperature
    if (action === VoteAction.HOT) {
      deal.votesHot += 1;
    } else {
      deal.votesCold += 1;
    }

    deal.temperature = calculateTemperature(deal.votesHot, deal.votesCold);

    // Update in array
    deals[dealIndex] = deal;
    await saveDeals(deals);

    logInfo('Vote recorded', {
      dealId: deal.id,
      action,
      temperature: deal.temperature,
    });

    return success(deal);
  } catch (error) {
    logError(`Failed to vote ${action}`, error as Error);
    return failure(error as Error);
  }
}

/**
 * Votes hot on a deal (+1 temperature)
 * @param dealId - The ID of the deal to vote on
 * @returns Result containing the updated deal or an error
 */
export async function voteHot(dealId: string): Promise<Result<Deal>> {
  return vote(dealId, VoteAction.HOT);
}

/**
 * Votes cold on a deal (-1 temperature)
 * @param dealId - The ID of the deal to vote on
 * @returns Result containing the updated deal or an error
 */
export async function voteCold(dealId: string): Promise<Result<Deal>> {
  return vote(dealId, VoteAction.COLD);
}

/**
 * Updates the temperature of a deal based on its current votes
 * @param dealId - The ID of the deal to update
 * @returns Result containing the updated deal or an error
 */
export async function updateTemperature(dealId: string): Promise<Result<Deal>> {
  try {
    if (!dealId || typeof dealId !== 'string') {
      throw new Error('Deal ID is required');
    }

    const deals = await loadDeals();
    const dealIndex = deals.findIndex((d) => d.id === dealId);

    if (dealIndex === -1) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }

    const deal = deals[dealIndex];

    if (!deal) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }

    // Recalculate temperature
    deal.temperature = calculateTemperature(deal.votesHot, deal.votesCold);

    deals[dealIndex] = deal;
    await saveDeals(deals);

    logDebug('Temperature updated', {
      dealId: deal.id,
      temperature: deal.temperature,
    });

    return success(deal);
  } catch (error) {
    logError('Failed to update temperature', error as Error);
    return failure(error as Error);
  }
}

/**
 * Gets vote statistics for a deal
 * @param deal - The deal to get stats for
 * @returns Object with vote statistics
 */
export function getVoteStats(deal: Deal): {
  votesHot: number;
  votesCold: number;
  totalVotes: number;
  temperature: number;
  hotPercentage: number;
} {
  const totalVotes = deal.votesHot + deal.votesCold;
  const hotPercentage = totalVotes > 0 ? (deal.votesHot / totalVotes) * 100 : 0;

  return {
    votesHot: deal.votesHot,
    votesCold: deal.votesCold,
    totalVotes,
    temperature: deal.temperature,
    hotPercentage: Math.round(hotPercentage * 100) / 100,
  };
}
