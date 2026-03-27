import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CONTACT_EMAIL = "contacto@espejoemocional.app";

function formatDate() {
  return new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100svh" }}>
      <div style={{
        position: "sticky",
        top: 0,
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        padding: "12px 20px",
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-soft)",
            fontSize: "14px",
            padding: "4px 0",
          }}
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      <div style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "40px 20px",
      }}>
        <h1 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: "8px",
        }}>
          Política de Privacidad
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-soft)", marginBottom: "32px" }}>
          Última actualización: {formatDate()}
        </p>

        <p style={bodyStyle}>
          Espejo Emocional ("la App") es un proyecto personal operado desde Colombia. Esta política describe cómo recopilamos, usamos y protegemos tu información personal de conformidad con la Ley 1581 de 2012 (Ley de Protección de Datos Personales de Colombia) y su Decreto Reglamentario 1377 de 2013.
        </p>
        <p style={bodyStyle}>
          Al usar la App, aceptas las prácticas descritas en esta política.
        </p>

        <Section title="1. RESPONSABLE DEL TRATAMIENTO">
          <p style={bodyStyle}>
            Espejo Emocional es un proyecto personal en desarrollo.<br />
            País de operación: Colombia<br />
            Contacto: <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>
          </p>
          <p style={bodyStyle}>
            En calidad de Responsable del Tratamiento de datos personales, nos comprometemos a cumplir con la normativa colombiana vigente en materia de protección de datos.
          </p>
        </Section>

        <Section title="2. DATOS QUE RECOPILAMOS">
          <p style={bodyStyle}>
            <strong>2.1. Datos de autenticación (mediante Google OAuth):</strong><br />
            Cuando inicias sesión con tu cuenta de Google, recibimos tu nombre, dirección de correo electrónico y foto de perfil. No tenemos acceso a tu contraseña de Google.
          </p>
          <p style={bodyStyle}>
            <strong>2.2. Datos de reflexión:</strong><br />
            Las respuestas que proporcionas durante el proceso de reflexión guiada (narrativas, emociones seleccionadas, respuestas a preguntas introspectivas, intensidades emocionales) se almacenan en nuestra base de datos para que puedas acceder a tu historial desde cualquier dispositivo.
          </p>
          <p style={bodyStyle}>
            <strong>2.3. Datos generados por IA:</strong><br />
            Los resúmenes, preguntas adaptativas, análisis de patrones y prompts diarios generados por la inteligencia artificial durante tu uso de la App se almacenan vinculados a tu cuenta.
          </p>
          <p style={bodyStyle}>
            <strong>2.4. Datos de uso:</strong><br />
            Información básica sobre cómo usas la App (fecha y hora de reflexiones, número de sesiones completadas). No recopilamos datos de ubicación, contactos, ni accedemos a otras aplicaciones de tu dispositivo.
          </p>
          <p style={bodyStyle}>
            <strong>2.5. Datos sensibles:</strong><br />
            Reconocemos que las reflexiones emocionales constituyen datos sensibles según la Ley 1581 de 2012. El tratamiento de estos datos se realiza exclusivamente con tu autorización explícita otorgada al aceptar esta política, y únicamente para los fines descritos en la sección 3.
          </p>
        </Section>

        <Section title="3. FINALIDAD DEL TRATAMIENTO">
          <p style={bodyStyle}>Utilizamos tus datos para:</p>
          <ul style={listStyle}>
            <li>Autenticarte y mantener tu sesión activa</li>
            <li>Almacenar y mostrarte tu historial de reflexiones</li>
            <li>Generar respuestas personalizadas de la inteligencia artificial basadas en tu historial</li>
            <li>Analizar patrones emocionales a lo largo de tus reflexiones</li>
            <li>Generar prompts diarios personalizados</li>
            <li>Mejorar la calidad y funcionalidad de la App</li>
          </ul>
          <p style={bodyStyle}>No utilizamos tus datos para:</p>
          <ul style={listStyle}>
            <li>Publicidad dirigida</li>
            <li>Venta o alquiler a terceros</li>
            <li>Elaboración de perfiles comerciales</li>
            <li>Ningún fin diferente a los aquí descritos</li>
          </ul>
        </Section>

        <Section title="4. TRATAMIENTO DE DATOS POR INTELIGENCIA ARTIFICIAL">
          <p style={bodyStyle}>
            La App utiliza la API de Anthropic (Claude) para generar respuestas personalizadas. Cuando usas funciones de IA:
          </p>
          <ul style={listStyle}>
            <li>El contenido de tus reflexiones se envía a los servidores de Anthropic para su procesamiento.</li>
            <li>Anthropic no utiliza los datos enviados vía API para entrenar sus modelos, según su política vigente.</li>
            <li>Las respuestas generadas se almacenan en nuestra base de datos vinculadas a tu cuenta.</li>
            <li>No enviamos tu nombre ni correo electrónico a Anthropic — solo el contenido de las reflexiones necesario para generar la respuesta.</li>
          </ul>
          <p style={bodyStyle}>
            Te recomendamos consultar la política de privacidad de Anthropic para más información sobre cómo procesan los datos que reciben.
          </p>
        </Section>

        <Section title="5. ALMACENAMIENTO Y SEGURIDAD">
          <p style={bodyStyle}>
            Tus datos se almacenan en Supabase, un servicio de base de datos con servidores protegidos mediante cifrado en tránsito (TLS) y en reposo. Implementamos las siguientes medidas de seguridad:
          </p>
          <ul style={listStyle}>
            <li>Autenticación mediante Google OAuth 2.0</li>
            <li>Políticas de acceso a nivel de fila (Row Level Security) en la base de datos, que garantizan que solo tú puedas acceder a tus reflexiones</li>
            <li>Conexiones cifradas entre la App y la base de datos</li>
          </ul>
          <p style={bodyStyle}>
            Ningún sistema es completamente seguro. Aunque tomamos medidas razonables para proteger tu información, no podemos garantizar seguridad absoluta.
          </p>
        </Section>

        <Section title="6. TUS DERECHOS (Ley 1581 de 2012, Artículo 8)">
          <p style={bodyStyle}>Como titular de los datos personales, tienes derecho a:</p>
          <ul style={listStyle}>
            <li>Conocer, actualizar y rectificar tus datos personales</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento</li>
            <li>Ser informado sobre el uso que se ha dado a tus datos</li>
            <li>Revocar la autorización y/o solicitar la supresión de tus datos cuando consideres que no se han respetado los principios, derechos y garantías constitucionales y legales</li>
            <li>Acceder en forma gratuita a tus datos personales que hayan sido objeto de tratamiento</li>
          </ul>
          <p style={bodyStyle}>
            Para ejercer estos derechos, envía un correo a <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a> con el asunto "Derechos de datos personales".
          </p>
        </Section>

        <Section title="7. ELIMINACIÓN DE DATOS">
          <p style={bodyStyle}>
            Puedes eliminar todos tus datos en cualquier momento desde la sección de Perfil dentro de la App. Al hacerlo:
          </p>
          <ul style={listStyle}>
            <li>Se eliminarán permanentemente todas tus reflexiones, análisis de patrones y datos generados por IA</li>
            <li>Se eliminará tu cuenta y datos de autenticación</li>
            <li>Esta acción es irreversible</li>
          </ul>
          <p style={bodyStyle}>
            También puedes solicitar la eliminación enviando un correo a <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>. Procesaremos tu solicitud en un plazo máximo de quince (15) días hábiles, de conformidad con la Ley 1581 de 2012.
          </p>
        </Section>

        <Section title="8. MENORES DE EDAD">
          <p style={bodyStyle}>
            Espejo Emocional no está dirigida a menores de 14 años. No recopilamos intencionalmente datos de menores de 14 años. Si eres padre, madre o tutor y crees que tu hijo menor de 14 años nos ha proporcionado datos personales, contacta a <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a> para solicitar su eliminación. Para menores entre 14 y 18 años, el uso de la App requiere autorización del representante legal, de conformidad con el artículo 12 del Decreto 1377 de 2013.
          </p>
        </Section>

        <Section title="9. TRANSFERENCIA INTERNACIONAL DE DATOS">
          <p style={bodyStyle}>
            Al usar la API de Anthropic, tus datos de reflexión pueden ser procesados en servidores ubicados fuera de Colombia (Estados Unidos). Esta transferencia se realiza en cumplimiento del artículo 26 de la Ley 1581 de 2012, considerando que los países de destino proporcionan niveles adecuados de protección de datos. Al aceptar esta política, autorizas expresamente dicha transferencia.
          </p>
        </Section>

        <Section title="10. COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO">
          <p style={bodyStyle}>
            La App no utiliza cookies de terceros ni tecnologías de seguimiento publicitario. Utilizamos únicamente almacenamiento local del navegador (localStorage) para preferencias de interfaz y almacenamiento en base de datos para tus reflexiones.
          </p>
        </Section>

        <Section title="11. CAMBIOS A ESTA POLÍTICA">
          <p style={bodyStyle}>Podemos actualizar esta política ocasionalmente. Cuando lo hagamos:</p>
          <ul style={listStyle}>
            <li>Actualizaremos la fecha de "Última actualización" al inicio del documento</li>
            <li>Si los cambios son significativos, te notificaremos mediante un aviso dentro de la App</li>
            <li>El uso continuado de la App después de los cambios constituye tu aceptación de la política actualizada</li>
          </ul>
        </Section>

        <Section title="12. AUTORIDAD DE PROTECCIÓN DE DATOS">
          <p style={bodyStyle}>
            Si consideras que tus derechos han sido vulnerados, puedes presentar una queja ante la Superintendencia de Industria y Comercio (SIC) de Colombia:
          </p>
          <ul style={listStyle}>
            <li>Sitio web: www.sic.gov.co</li>
            <li>Línea gratuita: 018000-910165</li>
          </ul>
        </Section>

        <Section title="13. CONTACTO">
          <p style={bodyStyle}>
            Para cualquier pregunta, solicitud o queja relacionada con esta política o el tratamiento de tus datos personales:<br />
            Correo: <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "32px" }}>
      <h2 style={{
        fontSize: "16px",
        fontWeight: 700,
        color: "var(--color-text)",
        marginBottom: "12px",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const bodyStyle = {
  fontSize: "14px",
  lineHeight: 1.7,
  color: "var(--color-text)",
  margin: "0 0 12px 0",
};

const listStyle = {
  fontSize: "14px",
  lineHeight: 1.7,
  color: "var(--color-text)",
  paddingLeft: "20px",
  margin: "0 0 12px 0",
};

const linkStyle = {
  color: "var(--color-accent)",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
};
