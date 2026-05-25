import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CreditCard, Truck } from 'lucide-react'
import { RequireClient, RequireStaff } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import ClientShell from '@/modules/portal/ClientShell'
import PortalSTLayout from '@/modules/portal/servicio-tecnico/PortalSTLayout'
import { ComingSoonPage } from '@/modules/portal/shared/ComingSoonPage'
import LoginPage from '@/modules/auth/LoginPage'
import ModuleSelector from '@/modules/home/ModuleSelector'
import ServicioTecnicoLayout from '@/modules/servicio-tecnico/ServicioTecnicoLayout'
import STDashboard from '@/modules/servicio-tecnico/tabs/Dashboard'
import STOrdenes from '@/modules/servicio-tecnico/tabs/Ordenes'
import OrderDetailPage from '@/modules/servicio-tecnico/pages/OrderDetailPage'
import Preventivos from '@/modules/servicio-tecnico/tabs/Preventivos'
import Localizador from '@/modules/servicio-tecnico/tabs/Localizador'
import STEquipos from '@/modules/servicio-tecnico/tabs/Equipos'
import LogisticaLayout from '@/modules/logistica/LogisticaLayout'
import LogDashboard from '@/modules/logistica/tabs/Dashboard'
import Ventas from '@/modules/logistica/tabs/Ventas'
import DetalleVenta from '@/modules/logistica/tabs/DetalleVenta'
import CobranzasLayout from '@/modules/cobranzas/CobranzasLayout'
import CobDashboard from '@/modules/cobranzas/tabs/Dashboard'
import Pagos from '@/modules/cobranzas/tabs/Pagos'
import CalendarioCob from '@/modules/cobranzas/tabs/Calendario'
import SupervisorLayout from '@/modules/supervisor/SupervisorLayout'
import Resumen from '@/modules/supervisor/tabs/Resumen'
import Bottlenecks from '@/modules/supervisor/tabs/Bottlenecks'
import Departamentos from '@/modules/supervisor/tabs/Departamentos'
import Contratos from '@/modules/supervisor/tabs/Contratos'
import ComprasLayout from '@/modules/compras/ComprasLayout'
import ComprasDashboard from '@/modules/compras/tabs/Dashboard'
import Ordenes from '@/modules/compras/tabs/Ordenes'
import DetalleOrden from '@/modules/compras/tabs/DetalleOrden'
import ClientDashboard from '@/modules/portal/home/ClientDashboard'
import MisOrdenes from '@/modules/portal/servicio-tecnico/tabs/MisOrdenes'
import DetalleOrdenCliente from '@/modules/portal/servicio-tecnico/tabs/DetalleOrdenCliente'
import MisEquipos from '@/modules/portal/servicio-tecnico/tabs/MisEquipos'
import MisContratos from '@/modules/portal/servicio-tecnico/tabs/MisContratos'
import NuevaSolicitud from '@/modules/portal/servicio-tecnico/tabs/NuevaSolicitud'
import DataLoadTab from '@/modules/servicio-tecnico/data-load/DataLoadTab'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/modulos',
    element: (
      <RequireStaff>
        <AppShell />
      </RequireStaff>
    ),
    children: [
      { index: true, element: <ModuleSelector /> },
      {
        path: 'servicio-tecnico',
        element: <ServicioTecnicoLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',   element: <STDashboard /> },
          { path: 'ordenes',     element: <STOrdenes /> },
          { path: 'ordenes/:id', element: <OrderDetailPage /> },
          { path: 'preventivos', element: <Preventivos /> },
          { path: 'localizador', element: <Localizador /> },
          { path: 'equipos',     element: <STEquipos /> },
          { path: 'contratos',   element: <Contratos /> },
          { path: 'carga-data',  element: <DataLoadTab /> },
        ],
      },
      {
        path: 'logistica',
        element: <LogisticaLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <LogDashboard /> },
          { path: 'ventas',    element: <Ventas /> },
          { path: 'ventas/:id', element: <DetalleVenta /> },
        ],
      },
      {
        path: 'cobranzas',
        element: <CobranzasLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <CobDashboard /> },
          { path: 'pagos',     element: <Pagos /> },
          { path: 'calendario', element: <CalendarioCob /> },
        ],
      },
      {
        path: 'supervisor',
        element: <SupervisorLayout />,
        children: [
          { index: true, element: <Navigate to="resumen" replace /> },
          { path: 'resumen',       element: <Resumen /> },
          { path: 'bottlenecks',   element: <Bottlenecks /> },
          { path: 'departamentos', element: <Departamentos /> },
          { path: 'contratos',     element: <Contratos /> },
        ],
      },
      {
        path: 'compras',
        element: <ComprasLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',   element: <ComprasDashboard /> },
          { path: 'ordenes',     element: <Ordenes /> },
          { path: 'ordenes/:id', element: <DetalleOrden /> },
        ],
      },
    ],
  },
  {
    path: '/portal',
    element: (
      <RequireClient>
        <ClientShell />
      </RequireClient>
    ),
    children: [
      { index: true, element: <Navigate to="servicio-tecnico/dashboard" replace /> },
      {
        path: 'servicio-tecnico',
        element: <PortalSTLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',        element: <ClientDashboard /> },
          { path: 'ordenes',          element: <MisOrdenes /> },
          { path: 'ordenes/:id',      element: <DetalleOrdenCliente /> },
          { path: 'equipos',          element: <MisEquipos /> },
          { path: 'contratos',        element: <MisContratos /> },
          { path: 'nueva-solicitud',  element: <NuevaSolicitud /> },
        ],
      },
      {
        path: 'cobranzas',
        element: (
          <ComingSoonPage
            title="Cobranzas"
            icon={CreditCard}
            description="Pronto podrás consultar el estado de tus facturas, recibos y saldos pendientes directamente desde el portal."
            features={[
              'Estado de cuenta en tiempo real',
              'Historial de pagos',
              'Descarga de facturas',
              'Recordatorios de vencimientos',
            ]}
          />
        ),
      },
      {
        path: 'despacho',
        element: (
          <ComingSoonPage
            title="Despacho"
            icon={Truck}
            description="Pronto podrás seguir el estado de las entregas de tus equipos médicos y conocer la fecha estimada de instalación."
            features={[
              'Tracking de envíos',
              'Fechas estimadas de entrega',
              'Confirmaciones de recepción',
              'Documentación de embarque',
            ]}
          />
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
