import { LEGAL } from "../../utils/legalTexts.js";

const TEXTS = {
  A: LEGAL.disclaimerA,
  B: LEGAL.disclaimerB,
  C: LEGAL.disclaimerC,
};

export default function SafetyDisclaimer({ variant = "A" }) {
  return (
    <p className={`safety-disclaimer safety-disclaimer--${variant.toLowerCase()}`}>
      {TEXTS[variant]}
    </p>
  );
}
