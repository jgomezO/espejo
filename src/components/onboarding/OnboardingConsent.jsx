import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LEGAL } from "../../utils/legalTexts.js";

export default function OnboardingConsent({ onComplete }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div
      className="onboarding-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="onboarding-header">
        <Sparkles size={36} strokeWidth={1.5} className="onboarding-icon" />
        <h1 className="onboarding-title">Antes de empezar</h1>
      </div>

      <div className="onboarding-points">
        {LEGAL.onboardingPoints.map((point) => (
          <div key={point.title} className="onboarding-point">
            <p className="onboarding-point-title">✦ {point.title}</p>
            <p className="onboarding-point-body">{point.body}</p>
          </div>
        ))}
      </div>

      <div className="onboarding-consent">
        <label className="onboarding-consent-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="onboarding-checkbox"
          />
          <span>{LEGAL.onboardingConsent}</span>
        </label>
      </div>

      <button
        className="btn-onboarding-start"
        disabled={!checked}
        onClick={onComplete}
      >
        Comenzar
      </button>
    </motion.div>
  );
}
