import { Route } from "react-router-dom";
import RoleRouteGuard from "../modules/routes/RoleRouteGuard";
import { menuConfig } from "../layout/menu.config";

export function buildRoutes(base = "") {

  const routes = [];

  menuConfig.forEach(m => {

    const isSuperAdminRoute = m.path?.startsWith("/superadmin");

    // 🔥 FILTER BY BASE LAYOUT
    if (base === "/superadmin" && !isSuperAdminRoute) return;
    if (!base && isSuperAdminRoute) return;

    if (m.path && m.component) {

      const Comp = m.component;

      routes.push(
        <Route
          key={m.path}
          path={m.path.replace(base, "")}
          element={
            <RoleRouteGuard roles={m.roles} module={m.module}>
              <Comp/>
            </RoleRouteGuard>
          }
        />
      );
    }

    if (m.children) {

      m.children.forEach(c => {

        const ChildComp = c.component;

        routes.push(
          <Route
            key={c.path}
            path={c.path.replace(base, "")}
            element={
              <RoleRouteGuard module={m.module}>
                <ChildComp/>
              </RoleRouteGuard>
            }
          />
        );
      });
    }

  });

  return routes;
}