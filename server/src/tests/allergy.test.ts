import { checkMedicationSafety } from "../utils/allergyDetector";

describe("Allergy Conflict Safety Unit Tests", () => {
  test("Detects Penicillin allergy conflict when prescribing Amoxicilline", () => {
    const result = checkMedicationSafety("Amoxicilline 1g", ["Pénicilline"]);
    expect(result.safe).toBe(false);
    expect(result.conflictingAllergy).toBe("Pénicilline");
  });

  test("Detects Aspirin allergy conflict", () => {
    const result = checkMedicationSafety("Aspirine 100mg", ["Aspirine", "Iode"]);
    expect(result.safe).toBe(false);
    expect(result.conflictingAllergy).toBe("Aspirine");
  });

  test("Allows non-conflicting medication", () => {
    const result = checkMedicationSafety("Paracétamol 1g", ["Pénicilline"]);
    expect(result.safe).toBe(true);
    expect(result.conflictingAllergy).toBeUndefined();
  });
});
