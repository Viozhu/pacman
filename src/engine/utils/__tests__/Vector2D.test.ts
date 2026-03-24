import { describe, it, expect } from 'vitest';
import { Vector2D } from '@/engine/utils/Vector2D';

describe('Vector2D', () => {
  describe('construction', () => {
    it('stores x and y', () => {
      const v = new Vector2D(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it('static zero() returns (0, 0)', () => {
      const v = Vector2D.zero();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('static from() copies x and y from plain object', () => {
      const v = Vector2D.from({ x: 7, y: -2 });
      expect(v.x).toBe(7);
      expect(v.y).toBe(-2);
    });
  });

  describe('add', () => {
    it('sums two vectors', () => {
      const result = new Vector2D(1, 2).add(new Vector2D(3, 4));
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('does not mutate the original', () => {
      const v = new Vector2D(1, 2);
      v.add(new Vector2D(10, 10));
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });
  });

  describe('subtract', () => {
    it('subtracts two vectors', () => {
      const result = new Vector2D(5, 7).subtract(new Vector2D(2, 3));
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });
  });

  describe('multiply', () => {
    it('scales by a positive scalar', () => {
      const result = new Vector2D(2, -3).multiply(4);
      expect(result.x).toBe(8);
      expect(result.y).toBe(-12);
    });

    it('returns zero vector when scaled by 0', () => {
      const result = new Vector2D(5, 5).multiply(0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('divide', () => {
    it('divides by a scalar', () => {
      const result = new Vector2D(6, 9).divide(3);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });
  });

  describe('magnitude', () => {
    it('returns correct length for 3-4-5 triangle', () => {
      expect(new Vector2D(3, 4).magnitude()).toBe(5);
    });

    it('returns 0 for zero vector', () => {
      expect(new Vector2D(0, 0).magnitude()).toBe(0);
    });
  });

  describe('normalize', () => {
    it('returns unit vector', () => {
      const n = new Vector2D(3, 4).normalize();
      expect(n.magnitude()).toBeCloseTo(1);
    });

    it('returns zero vector when normalizing (0, 0)', () => {
      const n = new Vector2D(0, 0).normalize();
      expect(n.x).toBe(0);
      expect(n.y).toBe(0);
    });
  });

  describe('distanceTo', () => {
    it('returns correct Euclidean distance', () => {
      const dist = new Vector2D(0, 0).distanceTo(new Vector2D(3, 4));
      expect(dist).toBe(5);
    });

    it('returns 0 for same point', () => {
      const v = new Vector2D(2, 3);
      expect(v.distanceTo(v.clone())).toBe(0);
    });
  });

  describe('clone', () => {
    it('produces an equal but distinct instance', () => {
      const original = new Vector2D(1, 2);
      const copy = original.clone();
      expect(copy.equals(original)).toBe(true);
      copy.x = 99;
      expect(original.x).toBe(1);
    });
  });

  describe('equals', () => {
    it('returns true for same coordinates', () => {
      expect(new Vector2D(3, 4).equals(new Vector2D(3, 4))).toBe(true);
    });

    it('returns false when x differs', () => {
      expect(new Vector2D(3, 4).equals(new Vector2D(5, 4))).toBe(false);
    });

    it('returns false when y differs', () => {
      expect(new Vector2D(3, 4).equals(new Vector2D(3, 5))).toBe(false);
    });
  });
});
