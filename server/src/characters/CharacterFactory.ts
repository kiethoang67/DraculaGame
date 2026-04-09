// ============================================================
// CharacterFactory — Factory Pattern for Character Instantiation
// ============================================================
// Creates the correct CharacterRole subclass based on CharacterId.
// This centralizes character creation and ensures the game engine
// never needs to know the concrete character classes.
// ============================================================

import { CharacterId } from '../types';
import { ICharacterRole, CharacterRole } from './CharacterRole';
import { Dracula } from './Dracula';
import { Alucard } from './Alucard';
import { Trickster } from './Trickster';
import { VanHelsing } from './VanHelsing';
import { BoogieMonster } from './BoogieMonster';
import { DoctorJekyll } from './DoctorJekyll';
import { Ghost } from './Ghost';
import { SwampCreature } from './SwampCreature';
import { Zombie } from './Zombie';
import { Witch } from './Witch';

/**
 * Factory that produces CharacterRole instances from CharacterId enums.
 * Uses a registry map for O(1) lookup.
 */
export class CharacterFactory {
  // Registry mapping character IDs to their constructors
  private static readonly registry = new Map<CharacterId, new () => CharacterRole>([
    [CharacterId.DRACULA, Dracula],
    [CharacterId.ALUCARD, Alucard],
    [CharacterId.TRICKSTER, Trickster],
    [CharacterId.VAN_HELSING, VanHelsing],
    [CharacterId.GHOST, Ghost],
    [CharacterId.BOOGIE_MONSTER, BoogieMonster],
    [CharacterId.DOCTOR_JEKYLL, DoctorJekyll],
    [CharacterId.SWAMP_CREATURE, SwampCreature],
    [CharacterId.ZOMBIE, Zombie],
    [CharacterId.WITCH, Witch],
  ]);

  // Cache instances since they're stateless
  private static readonly cache = new Map<CharacterId, CharacterRole>();

  /**
   * Create (or retrieve cached) CharacterRole instance.
   * Characters are stateless, so we can safely cache them.
   */
  static create(characterId: CharacterId): CharacterRole {
    let instance = this.cache.get(characterId);
    if (!instance) {
      const Constructor = this.registry.get(characterId);
      if (!Constructor) {
        throw new Error(`Unknown character ID: ${characterId}`);
      }
      instance = new Constructor();
      this.cache.set(characterId, instance);
    }
    return instance;
  }

  /**
   * Get all available character IDs.
   */
  static getAllCharacterIds(): CharacterId[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get character info (name, description) for all characters.
   */
  static getAllCharacterInfo(): Array<{ id: CharacterId; name: string; description: string }> {
    return this.getAllCharacterIds().map(id => {
      const char = this.create(id);
      return { id, name: char.name, description: char.description };
    });
  }
}
