import {
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import "./Footer.css";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const companyLinks: FooterLink[] = [
  { label: "О компании", href: "/about" },
  { label: "Контакты", href: "/contacts" },
  { label: "Вакансии", href: "/careers" },
];

const customerLinks: FooterLink[] = [
  { label: "Как оформить заказ", href: "/help/order" },
  { label: "Оплата и Доставка", href: "/help/payment" },
  { label: "Гарантия и возврат", href: "/help/warranty" },
];

const footerColumns: FooterColumn[] = [
  { title: "Компания", links: companyLinks },
  { title: "Покупателям", links: customerLinks },
];

const socialLinks = [
  { label: "Telegram", href: "https://t.me/", icon: <Send className="footer_social-icon" /> },
  { label: "Чат", href: "/contacts", icon: <MessageCircle className="footer_social-icon" /> },
  { label: "Видео", href: "https://youtube.com/", icon: <CirclePlay className="footer_social-icon" /> },
];

const mobileRows: FooterLink[] = [
  { label: "Адреса магазинов", href: "/stores" },
  { label: "Контакты", href: "/contacts" },
  { label: "Вакансии", href: "/careers" },
];

function FooterColumnList({ column }: { column: FooterColumn }) {
  return (
    <nav className="footer_column" aria-label={column.title}>
      <h2 className="footer_title">{column.title}</h2>
      <ul className="footer_list">
        {column.links.map((link) => (
          <li key={link.label}>
            <a className="footer_link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterAccordion({ column }: { column: FooterColumn }) {
  return (
    <details className="footer_accordion">
      <summary className="footer_accordion-summary">
        <span>{column.title}</span>
        <ChevronDown className="footer_accordion-icon" />
      </summary>
      <ul className="footer_accordion-list">
        {column.links.map((link) => (
          <li key={link.label}>
            <a className="footer_link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function FooterSocials() {
  return (
    <div className="footer_socials"  aria-label="Социальные сети">
      {socialLinks.map((social) => (
        <a key={social.label} className="footer_social " href={social.href} aria-label={social.label}>
          {social.icon}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer_inner">
        <div className="footer_desktop">
          <div className="footer_columns">
            {footerColumns.map((column) => (
              <FooterColumnList key={column.title} column={column} />
            ))}

            <section className="footer_column footer_column--contacts" aria-labelledby="footer_contacts-title">
              <h2 className="footer_title" id="footer_contacts-title">
                Связь
              </h2>

              <FooterSocials />

              <ul className="footer_contacts">
                <li>
                  <Phone className="footer_contact-icon" />
                  <a className="footer_link" href="tel:+375123456789">
                    +375 12 345-67-89
                  </a>
                </li>
                <li>
                  <MapPin className="footer_contact-icon" />
                  <span>Минск</span>
                </li>
                <li>
                  <Mail className="footer_contact-icon" />
                  <a className="footer_link" href="mailto:support@techmarket.by">
                    support@techmarket.by
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div className="footer_mobile">
          <div className="footer_mobile-accordions">
            {footerColumns.map((column) => (
              <FooterAccordion key={column.title} column={column} />
            ))}
          </div>

          <FooterSocials />

          <nav className="footer_mobile-menu" aria-label="Быстрые ссылки">
            {mobileRows.map((row) => (
              <a key={row.label} className="footer_mobile-row" href={row.href}>
                <span>{row.label}</span>
                <ChevronRight className="footer_mobile-row-icon" />
              </a>
            ))}
          </nav>

          <div className="footer_mobile-phone">
            <span className="footer_mobile-phone-label">Контактный номер телефона:</span>
            <a className="footer_mobile-phone-card" href="tel:+375123456789">
              +375 12 345-67-89
            </a>
          </div>
        </div>

        <div className="footer_bottom">
          <p>2024-2026 © TechMarket. Интернет-магазин техники для дипломного проекта.</p>
        </div>
      </div>
    </footer>
  );
}
