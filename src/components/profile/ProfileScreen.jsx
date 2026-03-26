import { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useUserContext } from "../../context/UserContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { deleteAllReflections } from "../../services/storageService.js";
import CrisisModal from "../crisis/CrisisModal.jsx";
import { LEGAL } from "../../utils/legalTexts.js";

function Toggle({ isOn, onChange, ariaLabel }) {
  return (
    <button
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      className={`profile-toggle ${isOn ? "on" : ""}`}
      onClick={onChange}
    >
      <span className="profile-toggle-thumb" />
    </button>
  );
}

export default function ProfileScreen() {
  const { state: user, dispatch, saveToSupabase } = useUserContext();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user: authUser, signOut } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [crisisOpen, setCrisisOpen] = useState(false);

  const displayName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email;

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveToSupabase();
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDeleteAll = () => {
    deleteAllReflections();
    onClose();
  };

  return (
    <motion.div
      className="profile-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="profile-header">
        <h1 className="screen-title">Perfil</h1>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Tu nombre</h2>
        {displayName && <p className="profile-account-email">{displayName}</p>}
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Preferencias</h2>
        <div className="profile-toggle-row">
          <div>
            <p className="profile-toggle-label">Prompt diario</p>
            <p className="profile-toggle-desc">Recibe una pregunta introspectiva cada día</p>
          </div>
          <Toggle
            isOn={user.dailyPromptEnabled}
            onChange={() => dispatch({ type: "TOGGLE_DAILY_PROMPT" })}
            ariaLabel="Activar prompt diario"
          />
        </div>
        <div className="profile-toggle-row" style={{ marginTop: "10px" }}>
          <div>
            <p className="profile-toggle-label">Preguntas de profundización</p>
            <p className="profile-toggle-desc">La IA te hará una pregunta reflexiva entre cada capa</p>
          </div>
          <Toggle
            isOn={user.nudgesEnabled !== false}
            onChange={() => dispatch({ type: "TOGGLE_NUDGES" })}
            ariaLabel="Activar preguntas de profundización"
          />
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Privacidad</h2>
        <div className="privacy-note">
          <p><Lock size={14} strokeWidth={2} /> Tus reflexiones se guardan solo en tu cuenta. Las consultas a la IA no almacenan datos personales.</p>
        </div>
        <div className="profile-account">
          {authUser && <p className="profile-account-email">{authUser.email}</p>}
          <button className="btn-signout" onClick={signOut}>Cerrar sesión</button>
        </div>
        <Button
          className="btn-delete"
          color="danger"
          variant="bordered"
          onPress={onOpen}
        >
          Borrar todos mis datos
        </Button>
      </div>

      <button
        className="btn-save-preferences"
        onClick={handleSave}
        disabled={saving}
      >
        {saved ? "Guardado ✓" : saving ? "Guardando..." : "Guardar cambios"}
      </button>

      <div className="profile-section">
        <h2 className="profile-section-title">Sobre Espejo</h2>
        <p className="profile-about-text">{LEGAL.aboutEspejo}</p>
        <p className="profile-about-text" style={{ marginTop: "8px" }}>
          Si estás en proceso terapéutico, Espejo puede ser un complemento valioso entre sesiones.
        </p>
        <div className="profile-legal-links">
          <button className="profile-legal-link" onClick={() => setCrisisOpen(true)}>
            Recursos de ayuda en crisis
          </button>
        </div>
      </div>
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />

      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader>¿Borrar todo?</ModalHeader>
          <ModalBody>
            <p>Esta acción eliminará todas tus reflexiones guardadas. No se puede deshacer.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancelar</Button>
            <Button color="danger" onPress={handleDeleteAll}>Sí, borrar todo</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
