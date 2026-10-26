import { ArrowLeft, BookOpen, Code2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import educationArt from "../../assets/cyberlearnix-education.svg";

const benefits = [
  [BookOpen, "Expert-led learning"],
  [Code2, "Hands-on projects"],
  [GraduationCap, "Real-world skills"],
];

const AuthShell = ({
  children,
  variant = "split",
  showTerms = false,
  showBackHome = variant !== "otp",
  showCardBrand = false,
  wide = false,
}) => {
  const centered = variant === "success" || variant === "error";

  return (
    <main className={`cyber-auth-page ${centered ? "cyber-auth-page-centered" : ""}`}>
      {!centered && (
        <section className="cyber-auth-visual" aria-label="Asivo learning experience">
          <div className="cyber-brand">
            <span className="cyber-brand-mark"><Sparkles size={17} /></span>
            <strong>Asivo</strong>
          </div>
          <div className="cyber-visual-copy">
            <h1>Learn Skills.<br /><em>Build Futures.</em></h1>
            <p>Learn in-demand skills, work on real projects, and build your future.</p>
            <div className="cyber-benefits">
              {benefits.map(([Icon, label]) => (
                <div key={label} className="cyber-benefit"><Icon size={17} /><span>{label}</span></div>
              ))}
            </div>
          </div>
          <div className="cyber-illustration" aria-hidden="true"><img src={educationArt} alt="" /></div>
          <div className="cyber-visual-footer"><ShieldCheck size={15} /> A place to grow your skills</div>
        </section>
      )}

      <section className="cyber-auth-content">
        <div className="cyber-mobile-brand cyber-brand">
          <span className="cyber-brand-mark"><Sparkles size={15} /></span><strong>Asivo</strong>
        </div>
        <div className={`cyber-auth-card cyber-auth-card-${variant} ${wide ? "cyber-auth-card-wide" : ""}`}>
          {(variant === "otp" || showCardBrand) && <div className="cyber-card-brand"><span className="cyber-brand-mark"><Sparkles size={15} /></span><strong>Asivo</strong></div>}
          {children}
          {showTerms && (
            <div className="cyber-auth-terms">
              By continuing, you agree to our <a href="/terms" onClick={(event) => event.preventDefault()}>Terms of Service</a><br />
              and <a href="/privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a>.
            </div>
          )}
        </div>
        {showBackHome && <Link className="cyber-back-home" to="/"><ArrowLeft size={14} /> Back to home</Link>}
      </section>
    </main>
  );
};

export default AuthShell;
