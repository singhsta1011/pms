import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../modules/auth/Login";
import PortalSelect from "../modules/auth/PortalSelect";

import MainLayout from "../layout/MainLayout";
import SuperAdminLayout from "../layout/SuperAdminLayout";

import Dashboard from "../modules/dashboard";
import AdminManagement from "../modules/superadmin/AdminManagement";

import useAuth from "../modules/auth/useAuth";
import { menuConfig } from "../layout/menu.config";
import RoleRouteGuard from "../modules/routes/RoleRouteGuard";

/* ================= AUTH WRAPPER ================= */

function AuthWrapper({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/* ================= ROUTE BUILDER ================= */

function buildRoutes() {
  const routes = [];

  menuConfig.forEach(m => {

    /* ===== MAIN ROUTES ===== */
    if (m.path && m.component) {

      const Comp = m.component;

      routes.push(
        <Route
          key={m.path}
          path={m.path}
          element={
            <RoleRouteGuard
              roles={m.roles}
              module={m.module}
              permission={m.permission}
            >
              <Comp />
            </RoleRouteGuard>
          }
        />
      );
    }

    /* ===== CHILD ROUTES ===== */
    if (m.children) {
      m.children.forEach(c => {

        const ChildComp = c.component;

        routes.push(
          <Route
            key={`${m.path}/${c.path}`}
            path={`${m.path}/${c.path}`}
            element={
              <RoleRouteGuard roles={c.roles} module={m.module}>
                <ChildComp />
              </RoleRouteGuard>
            }
          />
        );
      });
    }

  });

  return routes;
}

/* ================= FINAL ROUTER ================= */

export default function AppRoutes() {
  return (
    <Routes>

      {/* PORTAL SELECT */}
      <Route path="/" element={<PortalSelect />} />

      {/* LOGIN ROUTES */}
      <Route path="/superadmin/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/user/login" element={<Login />} />

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/superadmin/*"
        element={
          <AuthWrapper>
            <SuperAdminLayout />
          </AuthWrapper>
        }
      >
        <Route index element={<AdminManagement />} />
        {buildRoutes()}
      </Route>

      {/* ================= HOTEL ADMIN + USER ================= */}
      <Route
        path="/app/*"
        element={
          <AuthWrapper>
            <MainLayout />
          </AuthWrapper>
        }
      >
        <Route index element={<Dashboard />} />
        {buildRoutes()}
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
} 