import assert from "node:assert/strict";
import test from "node:test";
import { railScrollAvailability } from "../src/rail-scroll.ts";

test("rail arrows are absent when the content fits or the rail is hidden", () => {
  for (const [scrollHeight, clientHeight] of [[58, 600], [600, 600], [601, 600], [600, 0]]) {
    assert.deepEqual(railScrollAvailability({ scrollTop: 0, scrollHeight, clientHeight }), { previous: false, next: false });
  }
});

test("rail arrows represent only content outside each viewport edge", () => {
  const metrics = { scrollHeight: 1200, clientHeight: 400 };
  assert.deepEqual(railScrollAvailability({ ...metrics, scrollTop: 0 }), { previous: false, next: true });
  assert.deepEqual(railScrollAvailability({ ...metrics, scrollTop: 176 }), { previous: true, next: true });
  assert.deepEqual(railScrollAvailability({ ...metrics, scrollTop: 800 }), { previous: true, next: false });
});

test("rail measurement tolerates fractional edges and clamps elastic overscroll", () => {
  const metrics = { scrollHeight: 1200, clientHeight: 400 };
  for (const scrollTop of [-30, 0.5, 1]) {
    assert.deepEqual(railScrollAvailability({ ...metrics, scrollTop }), { previous: false, next: true });
  }
  for (const scrollTop of [799, 799.75, 830]) {
    assert.deepEqual(railScrollAvailability({ ...metrics, scrollTop }), { previous: true, next: false });
  }
});
