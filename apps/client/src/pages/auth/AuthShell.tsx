import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import techMarketMark from "../../assets/techmarket-mark.svg";
import "./AuthPages.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthShellProps) {
  return (
    <section className="auth_page">
      <div className="auth_backdrop" aria-hidden="true" />

      <div className="auth_shell">
        <aside className="auth_intro">
          <Link className="auth_brand" to="/" aria-label="Перейти на главную">
            <img src={techMarketMark} alt="" aria-hidden="true" />
            <span>TechMarket</span>
          </Link>

          <p className="auth_eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>

          <div className="auth_benefits" aria-label="Преимущества аккаунта">
            <span>Быстрый заказ</span>
            <span>История покупок</span>
            <span>Сохранённые адреса</span>
          </div>
        </aside>

        <div className="auth_card">
          {children}

          <p className="auth_footer">
            {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
