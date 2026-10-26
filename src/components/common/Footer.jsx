import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="asivo-footer">
    <div className="asivo-footer-grid">
      <div>
        <Link to="/" className="asivo-footer-logo">
          <img src="/assets/asivo-logo-md.png" alt="Asivo" />
        </Link>
        <p className="asivo-footer-tagline">Learn Skills. Build Futures.</p>
        <p className="asivo-footer-description">
          Build practical skills, create real projects, and prepare for your next career opportunity.
        </p>
      </div>

      <div>
        <h3>Explore</h3>
        <Link to="/courses">Courses</Link>
        <Link to="/courses">Learning Paths</Link>
        <Link to="/courses">Practical Labs</Link>
        <Link to="/courses">Projects</Link>
      </div>

      <div>
        <h3>Company</h3>
        <Link to="/courses">About Asivo</Link>
        <Link to="/courses">Contact</Link>
      </div>

      <div>
        <h3>Support</h3>
        <Link to="/courses">Help Center</Link>
        <Link to="/courses">FAQs</Link>
        <Link to="/courses">Contact Support</Link>
      </div>

      <div>
        <h3>Legal</h3>
        <Link to="/courses">Privacy Policy</Link>
        <Link to="/courses">Terms of Service</Link>
        <Link to="/courses">Accessibility</Link>
      </div>
    </div>

    <div className="asivo-footer-bottom">
      <span>© {new Date().getFullYear()} Asivo. All rights reserved.</span>
      <span>Learn Skills. Build Futures.</span>
    </div>
  </footer>
);

export default Footer;
