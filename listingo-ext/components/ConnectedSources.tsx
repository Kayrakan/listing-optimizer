// components/ConnectedSources.tsx

import { useStore } from "~state"
import { ArrowRight, Store as StoreIcon } from "lucide-react"

export default function ConnectedSources() {
    const sources = useStore((s) => s.sources)
    if (!sources?.length) {
        return <p className="text-sm text-base-70">No sources connected yet.</p>
    }
    return (
        <ul className="flex flex-col gap-2">
            {sources.map((src: any) => (
                <li key={src.id} className="flex items-center justify-between p-3 border border-base-20 rounded-md">
                    <div className="flex items-center gap-2">
                        <StoreIcon className="h-4 w-4" />
                        <span>{src.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-base-60" />
                </li>
            ))}
        </ul>
    )
}
