import { copyToClipboard } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";

type Props = {
    value: any;
    column?: Column<any, any>;
    className?: string;
}

export default function ClickToCopyText(props: Props) {
    const { value, className = "", column } = props;

    return (
        <p
            className={`select-none hover:cursor-copy 
                ${(column?.id === "name" || column?.id === "customer_name") && "w-72 text-ellipsis overflow-hidden"} 
                ${className}
            `}
            onClick={() => copyToClipboard(value)}
        >
            {value}
        </p>
    )
}