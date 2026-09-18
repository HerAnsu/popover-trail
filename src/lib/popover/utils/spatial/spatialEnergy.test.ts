import { describe, it, expect } from 'vitest';
import {
  cascadePlacementEnergy,
  totalOverlapArea,
  selectLowestEnergyPlacement,
} from './spatialEnergy';

describe('spatialEnergy', () => {
  it('computes total overlap intersection area across multiple obstacles', () => {
    const card = { x: 10, y: 10, width: 50, height: 50 };
    const obstacles = [
      { x: 0, y: 0, width: 20, height: 20 }, // overlap [10,20] x [10,20] = 100 area
      { x: 40, y: 40, width: 20, height: 20 }, // overlap [40,60] x [40,60] = 400 area
    ];
    expect(totalOverlapArea(card, obstacles)).toBe(500);
  });

  it('adds lambda-weighted distance penalty from preferred position', () => {
    const pos = { x: 100, y: 100 };
    const preferred = { x: 110, y: 100 }; // dx=10, dy=0, squared=100
    const size = { width: 50, height: 50 };

    // No obstacles => energy = 0 + 0.5 * 100 = 50
    const energy = cascadePlacementEnergy(pos, size, [], preferred, 0.5);
    expect(energy).toBe(50);
  });

  it('selects candidate position with lowest energy functional', () => {
    const obstacle = { x: 0, y: 0, width: 100, height: 100 };
    const size = { width: 50, height: 50 };
    const preferred = { x: 50, y: 0 };

    // Candidate 1 has heavy overlap with obstacle
    const c1 = { x: 20, y: 20 };

    // Candidate 2 is just outside obstacle, slight distance penalty but 0 area
    const c2 = { x: 105, y: 0 };

    const best = selectLowestEnergyPlacement([c1, c2], size, [obstacle], preferred);
    expect(best).toEqual(c2);
  });

  it('returns undefined for empty candidates', () => {
    expect(
      selectLowestEnergyPlacement([], { width: 50, height: 50 }, [], { x: 0, y: 0 }),
    ).toBeUndefined();
  });
});
