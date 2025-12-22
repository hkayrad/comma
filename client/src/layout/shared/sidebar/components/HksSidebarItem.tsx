import {
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/animate-ui/components/radix/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavLink, useLocation } from "react-router";

type Props = {
    item: any;
    group: any;
    state: "collapsed" | "expanded";
};

export default function HksSidebarItem(props: Props) {
    const { item, group, state } = props;
    const location = useLocation();

    return (
        <Tooltip disableHoverablePopup key={item.title}>
            <TooltipTrigger
                render={(props) => (
                    <SidebarMenuItem {...props}>
                        <SidebarMenuButton
                            isActive={
                                location.pathname === group.url + item.url
                            }
                            asChild
                        >
                            <NavLink
                                className="transition-all"
                                to={group.url + item.url}
                                onClick={(e) => {
                                    if (
                                        location.pathname ===
                                        group.url + item.url
                                    ) {
                                        e.preventDefault();
                                        return;
                                    }
                                }}
                            >
                                <item.icon />
                                <span className="select-none">
                                    {item.title}
                                </span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
            />
            <TooltipContent side="right" hidden={state !== "collapsed"}>
                {item.title}
            </TooltipContent>
        </Tooltip>
    );
}
