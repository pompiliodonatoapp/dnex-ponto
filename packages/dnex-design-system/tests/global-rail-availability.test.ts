import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getGlobalRailAvailability,
  getGlobalRailAvailabilityLabel,
  getGlobalRailDescription,
  isGlobalRailActionable,
  type GlobalRailAvailability,
} from "../src/components/shell/globalRailAvailability.ts";

const source = (name: string) =>
  readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");

test("ready permanece o padrão compatível e somente ready é acionável", () => {
  assert.equal(getGlobalRailAvailability({ label: "Contratos" }), "ready");
  assert.equal(isGlobalRailActionable({ label: "Contratos" }), true);
  assert.equal(
    isGlobalRailActionable({ label: "Normas", availability: "provisioning" }),
    false,
  );
  assert.equal(
    isGlobalRailActionable({ label: "Fiscal", availability: "unavailable" }),
    false,
  );
  assert.equal(
    getGlobalRailAvailability({
      label: "Integração futura",
      availability: "estado-desconhecido" as unknown as GlobalRailAvailability,
    }),
    "unavailable",
  );
});

test("estados não prontos têm rótulo e explicação humana sem depender do control plane", () => {
  assert.equal(
    getGlobalRailAvailabilityLabel({
      label: "Normas",
      availability: "provisioning",
    }),
    "Preparando acesso",
  );
  assert.match(
    getGlobalRailDescription({ label: "Fiscal", availability: "unavailable" }),
    /Fiscal/,
  );
  assert.equal(
    getGlobalRailDescription({
      label: "CRM",
      availability: "provisioning",
      description: "Acesso liberado após a ativação.",
    }),
    "Acesso liberado após a ativação.",
  );
});

test("desktop e mobile preservam foco e nunca chamam seleção para estados não prontos", () => {
  const rail = source("components/shell/GlobalRail.tsx");
  const drawer = source("components/shell/Sidebar.tsx");

  assert.ok(
    rail.includes("aria-disabled={actionable ? undefined : true}") &&
      rail.includes("aria-describedby={actionable ? undefined : descriptionId}") &&
      rail.includes("onClick={actionable ? () => onSelect(item.key) : undefined}"),
  );
  assert.ok(
    drawer.includes("aria-disabled={actionable ? undefined : true}") &&
      drawer.includes("aria-describedby={") &&
      drawer.includes("actionable ? undefined : descriptionId") &&
      drawer.includes("handleGlobalSelect(item.id)") &&
      drawer.includes(": undefined"),
  );
  for (const component of [rail, drawer]) {
    assert.ok(component.includes("cursor-not-allowed"));
    assert.ok(component.includes("focus-visible:ring-2"));
  }
});
