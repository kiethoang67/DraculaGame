// ============================================================
// DeckManager — Card Dealing & Mystery Guest
// ============================================================

import { CharacterId } from '../types';
import { CharacterFactory } from '../characters/CharacterFactory';

export class DeckManager {
  /**
   * Build a deck for the given number of players.
   * Rules:
   * - Always include Dracula.
   * - Choose enough characters to have one more than the number of players.
   * - The extra card(s) become the Mystery Guest(s).
   * - Mystery Guest cannot be Dracula.
   *
   * @param playerCount Number of players (4-8)
   * @returns { dealt: CharacterId[], mysteryGuests: CharacterId[] }
   */
  static buildAndDeal(playerCount: number): {
    dealt: CharacterId[];
    mysteryGuests: CharacterId[];
  } {
    const allCharacters = CharacterFactory.getAllCharacterIds();

    // We need playerCount + 1 characters (1 mystery guest)
    // For 4-5 players: 1 mystery guest. For 6-8 players: could also be 1.
    const totalNeeded = playerCount + 1;

    // Start with Dracula (always included)
    const selectedCharacters: CharacterId[] = [CharacterId.DRACULA];

    // Shuffle and pick the remaining characters
    const otherCharacters = allCharacters.filter(c => c !== CharacterId.DRACULA);
    this.shuffle(otherCharacters);

    // Pick enough to fill the deck
    const remaining = totalNeeded - 1;
    selectedCharacters.push(...otherCharacters.slice(0, remaining));

    // Shuffle the full deck
    this.shuffle(selectedCharacters);

    // Deal: first N cards go to players, the rest are mystery guests
    const dealt = selectedCharacters.slice(0, playerCount);
    const mysteryGuests = selectedCharacters.slice(playerCount);

    // Ensure Dracula is never a mystery guest
    const draculaInMystery = mysteryGuests.indexOf(CharacterId.DRACULA);
    if (draculaInMystery !== -1) {
      // Swap Dracula from mystery with a random dealt card
      const swapIndex = Math.floor(Math.random() * dealt.length);
      mysteryGuests[draculaInMystery] = dealt[swapIndex];
      dealt[swapIndex] = CharacterId.DRACULA;
    }

    return { dealt, mysteryGuests };
  }

  /**
   * Fisher-Yates shuffle (in-place).
   */
  private static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Swap a player's character with a mystery guest card.
   * Used by Doctor Jekyll's ability.
   */
  static swapWithMysteryGuest(
    currentCharacterId: CharacterId,
    mysteryGuests: CharacterId[]
  ): { newCharacterId: CharacterId; updatedMysteryGuests: CharacterId[] } {
    if (mysteryGuests.length === 0) {
      throw new Error('No mystery guest cards available to swap.');
    }

    // Take the first mystery guest card and replace with the player's card
    const newCharacterId = mysteryGuests[0];
    const updatedMysteryGuests = [currentCharacterId, ...mysteryGuests.slice(1)];

    return { newCharacterId, updatedMysteryGuests };
  }
}
