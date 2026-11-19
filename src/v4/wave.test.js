import test from "node:test";
import assert from "node:assert/strict";
import { waveGeometry, waveEdgeAtX, editorialWaveGeometry } from "./wave.js";

for (const [width, height] of [[375, 812], [1280, 480], [1920, 1080], [2560, 1440]]) {
  test(`wave consumes the previous surface at ${width}x${height}`, () => {
    for (const start of [0.55, 0.7, 0.95]) {
      const before = waveGeometry(height * start, width, height, start);
      const middle = waveGeometry(height * (start + 0.35) / 2, width, height, start);
      const top = height * 0.35;
      const complete = waveGeometry(top, width, height, start);
      assert.ok(before.depth > middle.depth && middle.depth > 0);
      assert.equal(complete.depth, 0);
      assert.ok(complete.lift <= Math.min(height * 0.612, 816));
      const edge = waveEdgeAtX(top, 0, width, 0, complete);
      assert.equal(edge, waveEdgeAtX(top, 0, width, width / 2, complete));
      assert.equal(edge, waveEdgeAtX(top, 0, width, width, complete));
      assert.ok(edge < top, "the boundary rises beyond the section top");
      assert.ok(complete.lift > middle.lift && middle.lift > before.lift, "the arc advances continuously with scroll");
    }
  });
}

test("reduced motion renders a straight boundary without motion", () => {
  assert.deepEqual(waveGeometry(300, 1920, 1080, 0.7, true), { lift: 0, depth: 0 });
});

test("editorial arcs follow the visible homepage crest within the available reading space", () => {
  for (const [width, height] of [[390, 844], [907, 864], [1900, 950]]) {
    for (const clearance of [0, height * .14, height * .22]) {
      for (const phase of [.96, .78, .58, .38, .18, 0, -.12]) {
        const top = height * phase;
        const { lift, depth } = editorialWaveGeometry(top, width, height, clearance);
        assert.ok(lift >= 0 && lift <= clearance);
        const crest = top - lift;

        // Find the frame of the homepage where its crest passes this pixel.
        let lo = crest;
        let hi = crest + height;
        for (let i = 0; i < 20; i++) {
          const mid = (lo + hi) / 2;
          if (mid - waveGeometry(mid, width, height).lift < crest) lo = mid;
          else hi = mid;
        }
        assert.ok(Math.abs(depth - waveGeometry(hi, width, height).depth) < .1);
      }
    }
    const before = editorialWaveGeometry(height * .5, width, height, height * .2);
    const after = editorialWaveGeometry(height * .35, width, height, height * .2);
    assert.ok(after.lift > before.lift && after.depth < before.depth);
    assert.deepEqual(editorialWaveGeometry(0, width, height, 100, true), { lift: 0, depth: 0 });
  }
});
