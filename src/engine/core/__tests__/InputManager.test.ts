// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { inputManager } from '@/engine/core/InputManager';

function fireKeyDown(key: string): boolean {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe('InputManager', () => {
  beforeEach(() => {
    inputManager.init();
  });

  afterEach(() => {
    inputManager.destroy();
  });

  describe('direction mapping', () => {
    it('maps ArrowUp to UP', () => {
      fireKeyDown('ArrowUp');
      expect(inputManager.getCurrentDirection()).toBe('UP');
    });

    it('maps w to UP', () => {
      fireKeyDown('w');
      expect(inputManager.getCurrentDirection()).toBe('UP');
    });

    it('maps s to DOWN', () => {
      fireKeyDown('s');
      expect(inputManager.getCurrentDirection()).toBe('DOWN');
    });

    it('maps a to LEFT', () => {
      fireKeyDown('a');
      expect(inputManager.getCurrentDirection()).toBe('LEFT');
    });

    it('maps d to RIGHT', () => {
      fireKeyDown('d');
      expect(inputManager.getCurrentDirection()).toBe('RIGHT');
    });

    it('ignores unrelated keys', () => {
      fireKeyDown('w');
      fireKeyDown('x');
      expect(inputManager.getCurrentDirection()).toBe('UP');
    });

    it('prevents default for movement keys', () => {
      const prevented = fireKeyDown('w');
      expect(prevented).toBe(true);
    });
  });

  describe('buffer', () => {
    it('sets buffered direction on keydown', () => {
      fireKeyDown('d');
      expect(inputManager.getBufferedDirection()).toBe('RIGHT');
    });

    it('clears buffer after clearBuffer()', () => {
      fireKeyDown('d');
      inputManager.clearBuffer();
      expect(inputManager.getBufferedDirection()).toBeNull();
    });
  });

  describe('text input focus guard', () => {
    it('does not update direction when an <input> has focus', () => {
      // Set a known direction first (no input focused)
      fireKeyDown('d'); // RIGHT
      expect(inputManager.getCurrentDirection()).toBe('RIGHT');

      // Focus an input and press a different direction key
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireKeyDown('w'); // should NOT update to UP

      // Direction must remain RIGHT — the key was ignored
      expect(inputManager.getCurrentDirection()).toBe('RIGHT');

      input.blur();
      document.body.removeChild(input);
    });

    it('does not prevent default when an <input> has focus', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const prevented = fireKeyDown('w');
      expect(prevented).toBe(false);

      input.blur();
      document.body.removeChild(input);
    });

    it('does not update direction when a <textarea> has focus', () => {
      fireKeyDown('d'); // RIGHT

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      fireKeyDown('w'); // should NOT update to UP

      expect(inputManager.getCurrentDirection()).toBe('RIGHT');

      textarea.blur();
      document.body.removeChild(textarea);
    });

    it('resumes interception after input loses focus', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      // While focused: direction should not change
      fireKeyDown('d'); // RIGHT — should be ignored
      const dirWhileFocused = inputManager.getCurrentDirection(); // still 'NONE' from init

      input.blur();

      // After blur: direction should update
      fireKeyDown('s'); // DOWN
      expect(inputManager.getCurrentDirection()).toBe('DOWN');
      expect(inputManager.getCurrentDirection()).not.toBe(dirWhileFocused === 'DOWN' ? 'NONE' : 'RIGHT');

      document.body.removeChild(input);
    });
  });
});
