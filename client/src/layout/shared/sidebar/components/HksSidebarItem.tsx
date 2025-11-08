import { SidebarMenuButton, SidebarMenuItem } from "@/components/animate-ui/components/radix/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NavLink } from "react-router";

type Props = {
    item: any;
    group: any;
    state: "collapsed" | "expanded";
}

export default function HksSidebarItem(props: Props) {
    const { item, group, state } = props;
    return (
        <Tooltip
            disableHoverableContent
            key={item.title}
            open={state === "collapsed" ? undefined : false}>
            <TooltipTrigger asChild>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <NavLink
                            className="transition-all"
                            to={group.url + item.url}
                            onClick={() => sessionStorage.setItem("current_page", item.title)}
                        >
                            <item.icon />
                            <span className="select-none">{item.title}</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </TooltipTrigger>
            <TooltipContent side="right">
                {item.title}
            </TooltipContent>
        </Tooltip>
    )
}