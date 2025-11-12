import { SystemAdminOnly } from "../auth/RoleGuard";
import NotFound from "../NotFound";

export default function Admin() {
  return (
    <SystemAdminOnly fallback={<NotFound />}>
      <div className="p-4">Admin</div>
    </SystemAdminOnly>
  );
}
