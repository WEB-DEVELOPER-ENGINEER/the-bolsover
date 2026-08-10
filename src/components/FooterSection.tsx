"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";
import { useCMS } from "@/context/CMSContext";

export const FooterSection: React.FC = () => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const contactData = cms?.data?.contactData;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interestType, setInterestType] = useState("General Enquiry");
  const [message, setMessage] = useState("");
  const [customFormValues, setCustomFormValues] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/form-builder")
      .then((response) => response.json())
      .then((json) => {
        if (json.success && json.data) setFormFields(json.data);
      })
      .catch(() => setFormFields([]));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!agree) {
      setErrorMsg("Please agree to the privacy policy consent.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          interestType,
          message,
          sourceForm: "Footer Registration Form",
          customData: customFormValues,
        }),
      });
      const json = await response.json();
      if (json.success) setSubmitted(true);
      else setErrorMsg(json.error || "Failed to submit enquiry.");
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="light-footer">
      <div className="light-footer-intro">
        <div>
          <p>{contactData?.eyebrow || "Private enquiries"}</p>
          <h2>{contactData?.title || "Register your interest."}</h2>
          <p className="light-footer-lead">
            {contactData?.description || "Leave your details and the sales team will be in touch about availability at The Bolsover."}
          </p>
        </div>

        <div className="light-footer-address">
          <p>{contactData?.address || "3-8 Bolsover Street, Fitzrovia, London W1"}</p>
          {contactData?.salesEmail && <p><a href={`mailto:${contactData.salesEmail}`} className="hover:underline">{contactData.salesEmail}</a></p>}
          {contactData?.salesPhone && <p><a href={`tel:${contactData.salesPhone}`} className="hover:underline">{contactData.salesPhone}</a></p>}
          <a href={config.brochurePath} target="_blank" rel="noreferrer">Download brochure</a>
        </div>
      </div>

      <div className="light-footer-form-wrap">
        {submitted ? (
          <div className="light-footer-success" role="status">
            <strong>Enquiry received.</strong>
            <p>Thank you for registering your interest. A member of the sales team will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="light-footer-form">
            {errorMsg && <p className="light-footer-error" role="alert">{errorMsg}</p>}

            {formFields.length > 0 ? (
              formFields.map((field) => {
                const isWide = field.type === "textarea" || field.name === "name" || field.name === "message";
                const value = field.name === "name"
                  ? name
                  : field.name === "email"
                    ? email
                    : field.name === "phone"
                      ? phone
                      : field.name === "message"
                        ? message
                        : field.name === "interestType"
                          ? interestType
                          : customFormValues[field.name] || "";

                const setValue = (nextValue: string) => {
                  if (field.name === "name") setName(nextValue);
                  else if (field.name === "email") setEmail(nextValue);
                  else if (field.name === "phone") setPhone(nextValue);
                  else if (field.name === "message") setMessage(nextValue);
                  else if (field.name === "interestType") setInterestType(nextValue);
                  else setCustomFormValues((current) => ({ ...current, [field.name]: nextValue }));
                };

                return (
                  <label key={field.id} className={isWide ? "is-wide" : ""}>
                    <span>{field.label}{field.required ? " *" : ""}</span>
                    {field.type === "textarea" ? (
                      <textarea rows={3} required={field.required} placeholder={field.placeholder} value={value} onChange={(event) => setValue(event.target.value)} />
                    ) : field.type === "select" ? (
                      <select required={field.required} value={value} onChange={(event) => setValue(event.target.value)}>
                        <option value="">{field.placeholder || "Select an option"}</option>
                        {(Array.isArray(field.options) ? field.options : []).map((option: string) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} required={field.required} placeholder={field.placeholder} value={value} onChange={(event) => setValue(event.target.value)} />
                    )}
                  </label>
                );
              })
            ) : (
              <>
                <label>
                  <span>Name</span>
                  <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </label>
                <label>
                  <span>Email address *</span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                </label>
              </>
            )}

            <label className="light-footer-consent is-wide">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} required />
              <span>{contactData?.consentText || "I agree to be contacted about The Bolsover and to the handling of my information under the Privacy Policy."}</span>
            </label>

            <button type="submit" disabled={submitting} className="light-footer-submit">
              {submitting ? "Submitting..." : (contactData?.submitButtonLabel || "Register interest")}
            </button>
          </form>
        )}
      </div>

      <div className="light-footer-bottom">
        <Link href="/" className="light-footer-logo"><img src="/assets/logos/bolsover-logo-new.svg" alt="The Bolsover" loading="lazy" decoding="async" /></Link>
        <nav aria-label="Footer navigation">
          <Link href="/apartments">Apartments</Link>
          <Link href="/location">Location</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <a href={config.googleMapsUrl} target="_blank" rel="noreferrer">Google Maps</a>
        </nav>
        <p>© {new Date().getFullYear()} The Bolsover</p>
      </div>

      <div className="light-footer-partners">
        <span>Marketed in partnership with</span>
        <img src="/assets/logos/savills-logo.avif" alt="Savills" loading="lazy" decoding="async" />
        <img src="/assets/logos/aayan-real-estate-logo.avif" alt="A'ayan Real Estate" loading="lazy" decoding="async" />
      </div>
    </footer>
  );
};
