import assert from "node:assert/strict";
import test from "node:test";
import { handleShellLinkClick, handleShellProductLinkClick } from "../src/navigation.ts";

function click(overrides: Record<string, unknown> = {}, attributes: Record<string, string> = {}) {
  let prevented = 0;
  const event = {
    defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
    preventDefault() { prevented++; },
    currentTarget: {
      getAttribute: (name: string) => attributes[name] ?? null,
      hasAttribute: (name: string) => name in attributes,
      ownerDocument: { location: { href: "https://normas.example/documentos" } } as Document,
    },
    ...overrides,
  };
  return { event, prevented: () => prevented };
}

test("plain same-origin click is intercepted only after host acceptance", () => {
  for (const accepted of [true, false]) {
    const c = click(); const urls: string[] = []; let closed = 0;
    handleShellLinkClick(c.event, "/documentos/42?tab=aceites", (href) => { urls.push(href); return accepted; }, () => closed++);
    assert.deepEqual(urls, ["/documentos/42?tab=aceites"]);
    assert.equal(c.prevented(), Number(accepted)); assert.equal(closed, 1);
  }
});

test("without adapter the anchor retains native navigation", () => {
  const c = click(); handleShellLinkClick(c.event, "/documentos"); assert.equal(c.prevented(), 0);
});

test("modified, auxiliary, cancelled, download and non-self clicks preserve browser semantics", () => {
  const cases = [
    click({ ctrlKey: true }), click({ metaKey: true }), click({ shiftKey: true }), click({ altKey: true }),
    click({ button: 1 }), click({ button: 2 }), click({ defaultPrevented: true }),
    click({}, { download: "" }), click({}, { target: "_blank" }), click({}, { target: "_parent" }),
  ];
  for (const c of cases) {
    let called = 0;
    handleShellLinkClick(c.event, "/documentos", () => { called++; return true; }, () => called++);
    assert.equal(called, 0); assert.equal(c.prevented(), 0);
  }
});

test("external, special protocol and fragment URLs never reach the host adapter", () => {
  for (const href of ["https://hub.example/", "//hub.example/", "mailto:teste@example.com", "#secao", "https://["]) {
    const c = click(); let called = 0;
    handleShellLinkClick(c.event, href, () => { called++; return true; });
    assert.equal(called, 0, href); assert.equal(c.prevented(), 0, href);
  }
});

test("absolute same-origin URL and explicit self target can use SPA", () => {
  const c = click({}, { target: "_SELF" });
  handleShellLinkClick(c.event, "https://normas.example/documentos/42", () => true);
  assert.equal(c.prevented(), 1);
});

test("host router errors are not silently swallowed", () => {
  const c = click();
  assert.throws(() => handleShellLinkClick(c.event, "/documentos", () => { throw new TypeError("router failed"); }), /router failed/);
});


test("product interception is explicit and can claim same-origin or external HTTP(S) URLs", () => {
  for (const href of ["/contratos?account=fixture#inicio", "https://external.example/fiscal"]) {
    const c = click(); const calls: string[][] = []; let closed = 0;
    handleShellProductLinkClick(c.event, "contratos", href, (key, url) => { calls.push([key, url]); return true; },
      () => { assert.fail("generic adapter must not run after product interception"); }, () => closed++);
    assert.deepEqual(calls, [["contratos", href]]); assert.equal(c.prevented(), 1); assert.equal(closed, 1);
  }
});

test("product callback absence/refusal preserves native cross-product fallback", () => {
  for (const adapter of [undefined, () => false]) {
    const c = click(); let closed = 0;
    handleShellProductLinkClick(c.event, "contratos", "/contratos", adapter, undefined, () => closed++);
    assert.equal(c.prevented(), 0); assert.equal(closed, 1);
  }
});

test("declining product interception preserves the current product SPA callback", () => {
  const c = click(); const order: string[] = [];
  handleShellProductLinkClick(c.event, "normas", "/normas", () => { order.push("product"); return false; },
    () => { order.push("generic"); return true; });
  assert.deepEqual(order, ["product", "generic"]); assert.equal(c.prevented(), 1);
});

test("product callback cannot take modified, auxiliary, cancelled, download or target clicks", () => {
  const cases = [click({ ctrlKey: true }), click({ metaKey: true }), click({ shiftKey: true }), click({ altKey: true }),
    click({ button: 1 }), click({ button: 2 }), click({ defaultPrevented: true }),
    click({}, { download: "" }), click({}, { target: "_blank" }), click({}, { target: "_parent" })];
  for (const c of cases) {
    handleShellProductLinkClick(c.event, "contratos", "/contratos", () => assert.fail("unexpected product adapter"),
      () => assert.fail("unexpected generic adapter"), () => assert.fail("unexpected drawer close"));
    assert.equal(c.prevented(), 0);
  }
});

test("product callback ignores fragments, special protocols and malformed URLs", () => {
  for (const href of ["#local", "mailto:fixture@example.com", "javascript:void(0)", "data:text/plain,fixture", "https://[", undefined]) {
    const c = click();
    handleShellProductLinkClick(c.event, "contratos", href, () => assert.fail("unexpected product adapter"));
    assert.equal(c.prevented(), 0);
  }
});

test("host product errors propagate instead of silently navigating", () => {
  const c = click();
  assert.throws(() => handleShellProductLinkClick(c.event, "contratos", "/contratos", () => { throw new Error("guard failed"); }), /guard failed/);
});
