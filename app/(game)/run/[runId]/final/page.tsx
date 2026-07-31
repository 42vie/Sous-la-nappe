// Page écran final — les 8 questions + restitution
import { notFound } from 'next/navigation'

export default function FinalPage({ params }: { params: { runId: string } }) {
  if (!params.runId) notFound()

  return (
    <main>
      <h1>Récapitulatif</h1>
      {/* Placeholder — à remplir avec FinalScreen component */}
    </main>
  )
}
