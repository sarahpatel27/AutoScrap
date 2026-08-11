import { Route, Routes } from 'react-router';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import QuotePage from './pages/QuotePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AreasPage from './pages/AreasPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin & Auth Components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Admin Auth Route (Public to allow login) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes (Requires authentication) */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Main Website Layout & Public Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/scrap-my-car" element={<QuotePage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/areas-we-cover" element={<AreasPage />} />
                    <Route path="/areas-we-cover/:slug" element={<LocationDetailPage />} />
                    <Route path="/about-us" element={<AboutPage />} />
                    <Route path="/contact-us" element={<ContactPage />} />
                    <Route path="/faqs" element={<FAQPage />} />
                    <Route
                        path="/privacy-policy"
                        element={<LegalPage type="Privacy Policy" />}
                    />
                    <Route
                        path="/terms-and-conditions"
                        element={
                            <LegalPage type="Terms and Conditions" />
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}