import React from "react";
import "../static-pages/StaticPages.css";
import "./ContactsPage.css"
import { PhoneIcon } from "./PhoneIcon";

const CONTACTS = [
  { label: 'WhatsApp', href: '/', target: '_blank' },
  { label: 'Telegram', href: '/', target: '_blank' },
];

const PHONE = {
  number: '12345',
  href: 'tel:12345',
};

export function ContactsPage() {
  return (
    <section className="service_page" aria-labelledby="contacts_page_title">
      <div className="service_page_inner">
        <h1 id="contacts_page_title">Контакты</h1>


        <div className="contact_card">
          <div className="contact_card__header">
            <div className="contact_card__title">Контакт-центр</div>
            <div className="contact_card__links">
              {CONTACTS.map((contact, index) => (
                <React.Fragment key={contact.label}>
                  <a
                    href={contact.href}
                    target={contact.target}
                    className="contact_card__link"
                  >
                    {contact.label}
                  </a>
                  {index < CONTACTS.length - 1 && <span> или </span>}
                </React.Fragment>
              ))}
              <br />
              <a href={PHONE.href} className="contact_card__link">
                <PhoneIcon />
                {PHONE.number}
              </a>
            </div>
          </div>
        </div>

        <div className="contact_card">
          <div className="contact_card__header">
            <div className="contact_card__title">Отдел по работе с юр. лицами</div>
            <div className="contact_card__links">
              <a href="/contacts" >beznal@Tech.by</a><br />
              {CONTACTS.map((contact, index) => (
                <React.Fragment key={contact.label}>
                  <a
                    href={contact.href}
                    target={contact.target}
                    className="contact_card__link"
                  >
                    {contact.label}
                  </a>
                  {index < CONTACTS.length - 1 && <span> или </span>}
                </React.Fragment>
              ))}
              <br />
              <a href={PHONE.href} className="contact_card__link">
                <PhoneIcon />
                {PHONE.number}
              </a>
            </div>
          </div>
        </div>


        <div className="contact_card">
          <div className="contact_card__header">
            <div className="contact_card__title">Контакты для арендодателей</div>
            <div className="contact_card__links">
              <a href="/contacts" >arenda@Tech.by</a><br />
              {CONTACTS.map((contact, index) => (
                <React.Fragment key={contact.label}>
                  <a
                    href={contact.href}
                    target={contact.target}
                    className="contact_card__link"
                  >
                    {contact.label}
                  </a>
                  {index < CONTACTS.length - 1 && <span> или </span>}
                </React.Fragment>
              ))}
              <br />
              <a href={PHONE.href} className="contact_card__link">
                <PhoneIcon />
                {PHONE.number}
              </a>
            </div>
          </div>
        </div>

        <div className="contact_card">
          <div className="contact_card__header">
            <div className="contact_card__title">Контакты для производителей</div>
            <div className="contact_card__links">
              <a href="/contacts" >zakup@Tech.by</a><br />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
