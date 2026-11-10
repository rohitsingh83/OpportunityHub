import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import OpportunityDetails from './pages/OpportunityDetails.jsx';
import Apply from './pages/Apply.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Admin from './pages/Admin.jsx';
import OpportunityForm from './pages/OpportunityForm.jsx';
import Applications from './pages/Applications.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/opportunity/:id" element={<OpportunityDetails />} />
          <Route path="/opportunity/:id/apply" element={<Apply />} />
          <Route path="/confirmation/:applicationId" element={<Confirmation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/new" element={<OpportunityForm />} />
          <Route path="/admin/edit/:id" element={<OpportunityForm />} />
          <Route path="/admin/applications" element={<Applications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>OpportunityHub</strong> — Full-Stack Internship &amp; Job Listing Portal (React + Express + MongoDB)
          </div>
          <div className="footer-links">
            <Link to="/">Opportunities</Link>
            <Link to="/admin">Admin Portal</Link>
            <Link to="/admin/applications">Applications</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
