import { Droplets, Flame, Moon, EyeOff, Link2, Wind, Scale, Mountain, Anchor, HeartOff, Eye, Heart } from "lucide-react";

export const EMOTIONS = [
  { id: "tristeza",    label: "Tristeza",    color: "#5B7FA5", Icon: Droplets, description: "Sensación de pérdida o vacío" },
  { id: "rabia",       label: "Rabia",       color: "#C1512D", Icon: Flame,    description: "Energía intensa ante una injusticia o límite cruzado" },
  { id: "miedo",       label: "Miedo",       color: "#6B5B73", Icon: Moon,     description: "Señal de amenaza o incertidumbre" },
  { id: "vergüenza",   label: "Vergüenza",   color: "#A0522D", Icon: EyeOff,   description: "Sensación de exposición o inadecuación" },
  { id: "frustración", label: "Frustración", color: "#D4764E", Icon: Link2,    description: "Deseo bloqueado o expectativa no cumplida" },
  { id: "ansiedad",    label: "Ansiedad",    color: "#8B8589", Icon: Wind,     description: "Anticipación de algo que aún no sucede" },
  { id: "culpa",       label: "Culpa",       color: "#556B2F", Icon: Scale,    description: "Sensación de haber actuado contra tus valores" },
  { id: "soledad",     label: "Soledad",     color: "#4A5568", Icon: Mountain, description: "Desconexión de los demás o de ti mismo" },
  { id: "impotencia",  label: "Impotencia",  color: "#708090", Icon: Anchor,   description: "Sensación de no poder cambiar lo que duele" },
  { id: "decepción",   label: "Decepción",   color: "#B8860B", Icon: HeartOff, description: "Expectativa rota sobre alguien o algo" },
  { id: "envidia",     label: "Envidia",     color: "#2E8B57", Icon: Eye,      description: "Deseo por lo que otro tiene o es" },
  { id: "ternura",     label: "Ternura",     color: "#DEB887", Icon: Heart,    description: "Suavidad y cuidado hacia algo vulnerable" },
];
