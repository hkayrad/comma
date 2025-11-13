import { NonSystemAdminOnly, SystemAdminOnly } from "@/layout/auth/RoleGuard";
import NonSystemAdminSidebar from "./NonSystemAdminSidebar";
import SystemAdminSidebar from "./SystemAdminSidebar";

export default function HksSidebar() {
  return (
    <>
      <NonSystemAdminOnly>
        <NonSystemAdminSidebar />
      </NonSystemAdminOnly>
      <SystemAdminOnly>
        <SystemAdminSidebar />
      </SystemAdminOnly>
    </>
  );
}
