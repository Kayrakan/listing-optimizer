/* listingo-ext/src/popup/QuotaBadge.tsx
   Lightweight, stateless badge used in header */

interface Props {
    plan: "guest" | "pro"
    remaining: number
}

export default function QuotaBadge({ plan, remaining }: Props) {
    const color =
        remaining === 0 ? "bg-error text-base-00" :
            plan === "guest" ? "bg-accent-subtle text-accent" :
                "bg-success/20 text-success"

    return (
        <span
            title={`${remaining} listings left`}
            className={`${color} inline-flex items-center rounded-pill text-xs px-2 py-[2px] font-medium`}>
      {remaining}
    </span>
    )
}
