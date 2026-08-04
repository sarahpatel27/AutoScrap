import { Route, Routes } from 'react-router';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import QuotePage from './pages/QuotePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AreasPage from './pages/AreasPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />

                <Route path="/quote" element={<QuotePage />} />

                <Route
                    path="/how-it-works"
                    element={<HowItWorksPage />}
                />

                <Route
                    path="/areas-we-cover"
                    element={<AreasPage />}
                />

                <Route
                    path="/about-us"
                    element={<AboutPage />}
                />

                <Route
                    path="/contact-us"
                    element={<ContactPage />}
                />

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
    );
}