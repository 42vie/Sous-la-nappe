// Un template (contrairement à layout) se remonte à chaque navigation —
// exactement ce qu'il faut pour un fondu léger entre les pages, sans
// librairie d'animation. Les keyframes existent déjà dans globals.css
// (fadeIn) mais n'étaient jamais appliquées nulle part.
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <div style={{ animation: 'fadeIn 260ms ease-out' }}>{children}</div>
}
