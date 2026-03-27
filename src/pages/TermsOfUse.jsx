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

export default function TermsOfUse() {
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
          Términos y Condiciones de Uso
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-soft)", marginBottom: "32px" }}>
          Última actualización: {formatDate()}
        </p>

        <p style={bodyStyle}>
          Bienvenido/a a Espejo Emocional ("la App"). Al acceder y utilizar la App, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de ellos, por favor no utilices la App.
        </p>

        <Section title="1. DESCRIPCIÓN DEL SERVICIO">
          <p style={bodyStyle}>
            Espejo Emocional es una herramienta digital de auto-observación e introspección guiada. La App utiliza inteligencia artificial para acompañar al usuario en un proceso de reflexión emocional estructurado por capas.
          </p>
          <p style={{ ...bodyStyle, fontWeight: 600, marginTop: "16px" }}>
            IMPORTANTE — LO QUE ESPEJO EMOCIONAL NO ES:
          </p>
          <ul style={listStyle}>
            <li>No es un servicio de salud mental</li>
            <li>No es terapia ni la sustituye</li>
            <li>No es un dispositivo médico</li>
            <li>No proporciona diagnósticos clínicos ni psicológicos</li>
            <li>No reemplaza la consulta con profesionales de salud mental</li>
            <li>No constituye una relación terapéutica entre el usuario y la App</li>
          </ul>
          <p style={bodyStyle}>
            Espejo Emocional es exclusivamente una herramienta de auto-reflexión. Las respuestas generadas por la inteligencia artificial son invitaciones a la observación personal, no evaluaciones clínicas.
          </p>
        </Section>

        <Section title="2. NATURALEZA DE LAS REFLEXIONES GENERADAS POR IA">
          <p style={bodyStyle}>2.1. Las respuestas, preguntas, resúmenes, análisis de patrones y cualquier otro contenido generado por la inteligencia artificial dentro de la App:</p>
          <ul style={listStyle}>
            <li>Son generados algorítmicamente a partir de lo que el usuario comparte</li>
            <li>No constituyen opinión profesional de ningún tipo</li>
            <li>No deben interpretarse como diagnóstico, evaluación clínica o recomendación terapéutica</li>
            <li>Son invitaciones a la auto-observación, no afirmaciones sobre la condición del usuario</li>
            <li>Pueden contener inexactitudes, sesgos o interpretaciones incompletas</li>
          </ul>
          <p style={bodyStyle}>2.2. El usuario reconoce y acepta que:</p>
          <ul style={listStyle}>
            <li>Es responsable de cómo interpreta y actúa sobre el contenido generado por la App</li>
            <li>No tomará decisiones médicas, psicológicas o de salud basándose exclusivamente en el contenido de la App</li>
            <li>Buscará asistencia profesional calificada para cualquier preocupación de salud mental</li>
            <li>La App no establece ni pretende establecer una relación profesional-paciente</li>
          </ul>
        </Section>

        <Section title="3. USO APROPIADO">
          <p style={bodyStyle}>3.1. La App está diseñada para:</p>
          <ul style={listStyle}>
            <li>Facilitar procesos de auto-observación y reflexión personal</li>
            <li>Ayudar a reconocer patrones emocionales propios</li>
            <li>Complementar (nunca reemplazar) procesos terapéuticos existentes</li>
            <li>Servir como herramienta de desarrollo personal</li>
          </ul>
          <p style={bodyStyle}>3.2. La App NO está diseñada para:</p>
          <ul style={listStyle}>
            <li>Manejo de crisis de salud mental</li>
            <li>Tratamiento de trastornos psicológicos o psiquiátricos</li>
            <li>Sustitución de medicación o tratamiento profesional</li>
            <li>Atención de emergencias emocionales o psicológicas</li>
          </ul>
          <p style={bodyStyle}>
            3.3. Si estás experimentando una crisis emocional, pensamientos de autolesión, ideación suicida, o cualquier emergencia de salud mental, por favor contacta inmediatamente a los servicios de emergencia de tu país o a una línea de crisis. La App incluye un acceso a recursos de ayuda en la pantalla principal.
          </p>
        </Section>

        <Section title="4. REQUISITOS DE USO">
          <p style={bodyStyle}>4.1. Para usar la App debes:</p>
          <ul style={listStyle}>
            <li>Ser mayor de 14 años. Si tienes entre 14 y 18 años, necesitas autorización de tu representante legal.</li>
            <li>Contar con una cuenta de Google válida</li>
            <li>Aceptar estos Términos y Condiciones y la Política de Privacidad</li>
          </ul>
          <p style={bodyStyle}>4.2. Te comprometes a:</p>
          <ul style={listStyle}>
            <li>Proporcionar información veraz en tu perfil</li>
            <li>No utilizar la App con fines ilegales o no autorizados</li>
            <li>No intentar acceder a datos de otros usuarios</li>
            <li>No interferir con el funcionamiento de la App</li>
            <li>No utilizar la App para generar contenido que vulnere derechos de terceros</li>
          </ul>
        </Section>

        <Section title="5. CUENTA DE USUARIO">
          <p style={bodyStyle}>
            5.1. Tu cuenta se crea mediante autenticación con Google OAuth. Eres responsable de mantener la seguridad de tu cuenta de Google.
          </p>
          <p style={bodyStyle}>
            5.2. Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.
          </p>
          <p style={bodyStyle}>
            5.3. Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la sección de Perfil.
          </p>
        </Section>

        <Section title="6. PROPIEDAD INTELECTUAL">
          <p style={bodyStyle}>
            6.1. La App, incluyendo su diseño, código, textos, gráficos, logos e interfaz, es propiedad de Espejo Emocional. Todos los derechos están reservados.
          </p>
          <p style={bodyStyle}>
            6.2. Tus reflexiones y respuestas son de tu propiedad. Al usar la App, nos otorgas una licencia limitada para almacenar y procesar ese contenido únicamente para proporcionarte el servicio descrito.
          </p>
          <p style={bodyStyle}>
            6.3. Los contenidos generados por la inteligencia artificial en respuesta a tus reflexiones son generados para tu uso personal. No garantizamos la originalidad ni exclusividad de dicho contenido.
          </p>
        </Section>

        <Section title="7. LIMITACIÓN DE RESPONSABILIDAD">
          <p style={bodyStyle}>
            7.1. Espejo Emocional se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas.
          </p>
          <p style={bodyStyle}>7.2. En la máxima medida permitida por la ley colombiana, no seremos responsables por:</p>
          <ul style={listStyle}>
            <li>Daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso de la App</li>
            <li>Decisiones que el usuario tome basándose en el contenido generado por la App</li>
            <li>Inexactitudes, errores u omisiones en las respuestas generadas por la inteligencia artificial</li>
            <li>Interrupciones del servicio, pérdida de datos o fallos técnicos</li>
            <li>Cualquier perjuicio derivado del uso o la imposibilidad de uso de la App</li>
          </ul>
          <p style={bodyStyle}>
            7.3. El usuario asume la total responsabilidad por el uso que haga de la App y las interpretaciones que realice sobre el contenido generado.
          </p>
        </Section>

        <Section title="8. EXENCIÓN DE RESPONSABILIDAD MÉDICA">
          <p style={bodyStyle}>
            8.1. ESPEJO EMOCIONAL NO PROPORCIONA ASESORAMIENTO MÉDICO, PSICOLÓGICO, PSIQUIÁTRICO NI DE SALUD MENTAL DE NINGÚN TIPO.
          </p>
          <p style={bodyStyle}>
            8.2. Ningún contenido de la App, ya sea generado por inteligencia artificial o redactado por el equipo, debe interpretarse como consejo médico o psicológico.
          </p>
          <p style={bodyStyle}>
            8.3. Si crees que tienes una condición de salud mental, consulta con un profesional calificado. Nunca ignores, demores ni interrumpas un tratamiento profesional basándote en información obtenida a través de la App.
          </p>
          <p style={bodyStyle}>
            8.4. La relación entre el usuario y la App es exclusivamente la de un usuario con una herramienta tecnológica. No existe relación terapéutica, médica ni profesional de ningún tipo.
          </p>
        </Section>

        <Section title="9. MODIFICACIONES DEL SERVICIO Y TÉRMINOS">
          <p style={bodyStyle}>
            9.1. Nos reservamos el derecho de modificar, suspender o discontinuar la App en cualquier momento, con o sin previo aviso.
          </p>
          <p style={bodyStyle}>
            9.2. Podemos actualizar estos Términos ocasionalmente. Cuando los cambios sean significativos, te notificaremos mediante un aviso dentro de la App. El uso continuado después de los cambios constituye tu aceptación.
          </p>
        </Section>

        <Section title="10. TERMINACIÓN">
          <p style={bodyStyle}>
            10.1. Puedes dejar de usar la App en cualquier momento eliminando tu cuenta desde la sección de Perfil.
          </p>
          <p style={bodyStyle}>
            10.2. Nos reservamos el derecho de suspender o cancelar tu acceso si violas estos términos.
          </p>
        </Section>

        <Section title="11. LEY APLICABLE Y JURISDICCIÓN">
          <p style={bodyStyle}>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República de Colombia. Cualquier controversia derivada del uso de la App se someterá a la jurisdicción de los tribunales competentes de Colombia, sin perjuicio de los mecanismos alternativos de solución de conflictos disponibles.
          </p>
        </Section>

        <Section title="12. DISPOSICIONES GENERALES">
          <p style={bodyStyle}>
            12.1. Si alguna disposición de estos Términos resulta inválida o inaplicable, las demás disposiciones seguirán en pleno vigor.
          </p>
          <p style={bodyStyle}>
            12.2. La falta de ejercicio de cualquier derecho previsto en estos Términos no constituirá una renuncia al mismo.
          </p>
          <p style={bodyStyle}>
            12.3. Estos Términos constituyen el acuerdo completo entre el usuario y Espejo Emocional respecto al uso de la App.
          </p>
        </Section>

        <Section title="13. CONTACTO">
          <p style={bodyStyle}>
            Para preguntas sobre estos Términos:<br />
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
