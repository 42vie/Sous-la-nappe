// Page d'un run en cours
import { notFound } from 'next/navigation'

export default function RunPage({ params }: { params: { runId: string } }) {
  if (!params.runId) notFound()

  return (
    <main>
      {/* Placeholder — à remplir avec le moteur de scènes */}
      <p>Run : {params.runId}</p>
    </main>
  )
}
