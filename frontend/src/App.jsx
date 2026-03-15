// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuth } from './store/authSlice'

import AuthLayout    from './layouts/AuthLayout'
import AppLayout     from './layouts/AppLayout'
import LoginPage     from './pages/auth/LoginPage'
import OTPPage       from './pages/auth/OTPPage'
import DashboardPage from './pages/dashboard/DashboardPage'

import ProductsPage      from './pages/products/ProductsPage'
import ProductDetailPage from './pages/products/ProductDetailPage'
import ProductForm       from './pages/products/ProductForm'

import ReceiptsPage      from './pages/receipts/ReceiptsPage'
import ReceiptDetailPage from './pages/receipts/ReceiptDetailPage'
import ReceiptForm       from './pages/receipts/ReceiptForm'

import DeliveriesPage      from './pages/deliveries/DeliveriesPage'
import DeliveryDetailPage  from './pages/deliveries/DeliveryDetailPage'
import DeliveryForm        from './pages/deliveries/DeliveryForm'

import TransfersPage      from './pages/transfers/TransfersPage'
import TransferDetailPage from './pages/transfers/TransferDetailPage'
import TransferForm       from './pages/transfers/TransferForm'

import AdjustmentsPage from './pages/adjustments/AdjustmentsPage'
import AdjustmentForm  from './pages/adjustments/AdjustmentForm'
import MovementsPage   from './pages/movements/MovementsPage'
import SettingsPage    from './pages/settings/SettingsPage'

function Protected({ children }) {
  const isAuth = useSelector(selectIsAuth)
  return isAuth ? children : <Navigate to="/login" replace />
}

function Public({ children }) {
  const isAuth = useSelector(selectIsAuth)
  return isAuth ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Public><LoginPage /></Public>} />
        <Route path="/otp"   element={<Public><OTPPage /></Public>} />

        <Route path="/" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard"   element={<DashboardPage />} />

          <Route path="products"        element={<ProductsPage />} />
          <Route path="products/new"    element={<ProductForm />} />
          <Route path="products/:id"    element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductForm />} />

          <Route path="receipts"        element={<ReceiptsPage />} />
          <Route path="receipts/new"    element={<ReceiptForm />} />
          <Route path="receipts/:id"    element={<ReceiptDetailPage />} />

          <Route path="deliveries"      element={<DeliveriesPage />} />
          <Route path="deliveries/new"  element={<DeliveryForm />} />
          <Route path="deliveries/:id"  element={<DeliveryDetailPage />} />

          <Route path="transfers"       element={<TransfersPage />} />
          <Route path="transfers/new"   element={<TransferForm />} />
          <Route path="transfers/:id"   element={<TransferDetailPage />} />

          <Route path="adjustments"     element={<AdjustmentsPage />} />
          <Route path="adjustments/new" element={<AdjustmentForm />} />

          <Route path="movements"       element={<MovementsPage />} />
          <Route path="settings"        element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
