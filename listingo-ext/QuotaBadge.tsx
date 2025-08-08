/* listingo-ext/src/popup/QuotaBadge.tsx
   Lightweight, stateless badge used in header */

interface Props {
    plan: "guest" | "pro"
    remaining: number
}

export default function QuotaBadge({ plan, remaining }: Props) {
    const color =
        remaining === 0 ? "bg-red-100 text-red-700" :
            plan === "guest" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"

    return (
        <span
            title={`${remaining} listings left`}
            className={`${color} inline-flex items-center rounded-full text-xs px-2 py-[2px] font-medium`}>
      {remaining}
    </span>
    )
}
