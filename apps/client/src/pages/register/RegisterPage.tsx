import type { ChangeEvent, FocusEvent, FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../auth/AuthShell";
import { GoogleIcon, VkIcon } from "../auth/SocialIcons";
import { apiBaseUrl } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

type RegisterField = "firstName" | "lastName" | "email" | "password";
type RegisterFormValues = Record<RegisterField, string>;
type RegisterFormErrors = Partial<Record<RegisterField, string>>;

const nameMinLength = 2;
const nameMaxLength = 60;
const passwordMinLength = 8;
const passwordMaxLength = 100;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeRegisterValues(values: RegisterFormValues): RegisterFormValues {
  return {
    firstName: normalizeName(values.firstName),
    lastName: normalizeName(values.lastName),
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}

function validateRegisterField(field: RegisterField, rawValues: RegisterFormValues) {
  const values = normalizeRegisterValues(rawValues);

  if (field === "firstName" || field === "lastName") {
    const label = field === "firstName" ? "Имя" : "Фамилия";
    const agreement = field === "firstName" ? "должно" : "должна";
    const value = values[field];

    if (!value) {
      return `${label} обязательно для заполнения.`;
    }

    if (value.length < nameMinLength) {
      return `${label} ${agreement} быть не короче ${nameMinLength} символов.`;
    }

    if (value.length > nameMaxLength) {
      return `${label} ${agreement} быть не длиннее ${nameMaxLength} символов.`;
    }
  }

  if (field === "email") {
    if (!values.email) {
      return "Email обязателен для заполнения.";
    }

    if (!emailPattern.test(values.email)) {
      return "Введите корректный email, например name@example.com.";
    }
  }

  if (field === "password") {
    if (!values.password) {
      return "Пароль обязателен для заполнения.";
    }

    if (values.password.length < passwordMinLength) {
      return `Пароль должен быть не короче ${passwordMinLength} символов.`;
    }

    if (values.password.length > passwordMaxLength) {
      return `Пароль должен быть не длиннее ${passwordMaxLength} символов.`;
    }
  }

  return "";
}

function validateRegisterForm(values: RegisterFormValues) {
  return (["firstName", "lastName", "email", "password"] as const).reduce<RegisterFormErrors>((errors, field) => {
    const message = validateRegisterField(field, values);

    if (message) {
      errors[field] = message;
    }

    return errors;
  }, {});
}

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const user = useAuthStore((state) => state.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const values = { firstName, lastName, email, password };

  function updateField(field: RegisterField, value: string) {
    const nextValues = { ...values, [field]: value };

    setError("");

    if (field === "firstName") {
      setFirstName(value);
    } else if (field === "lastName") {
      setLastName(value);
    } else if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    if (fieldErrors[field]) {
      const message = validateRegisterField(field, nextValues);
      setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: message || undefined }));
    }
  }

  function handleFieldBlur(field: RegisterField, event: FocusEvent<HTMLInputElement>) {
    const nextValues = { ...values, [field]: event.target.value };
    const normalizedValues = normalizeRegisterValues(nextValues);
    const message = validateRegisterField(field, nextValues);

    if (field === "firstName") {
      setFirstName(normalizedValues.firstName);
    } else if (field === "lastName") {
      setLastName(normalizedValues.lastName);
    } else if (field === "email") {
      setEmail(normalizedValues.email);
    }

    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: message || undefined }));
  }

  function handleFieldChange(field: RegisterField) {
    return (event: ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedValues = normalizeRegisterValues(values);
    const nextFieldErrors = validateRegisterForm(normalizedValues);

    setFirstName(normalizedValues.firstName);
    setLastName(normalizedValues.lastName);
    setEmail(normalizedValues.email);
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(normalizedValues);
      navigate("/", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось создать аккаунт");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Новый аккаунт"
      title="Создайте профиль TechMarket"
      description="Один аккаунт — для заказов, адресов, избранного и будущего личного кабинета."
      footerText="Уже есть аккаунт?"
      footerLinkLabel="Войти"
      footerLinkTo="/login"
    >
      <div className="auth_heading">
        <h2>Регистрация</h2>
        <p>Заполните три поля — остальное можно добавить позже.</p>
      </div>

      {user ? (
        <p className="auth_note">Вы уже вошли как {user.email}.</p>
      ) : (
        <>
          <div className="auth_socials">
            <a className="auth_social_button" href={`${apiBaseUrl}/auth/google`}>
              <GoogleIcon />
              Продолжить через Google
            </a>
            <a className="auth_social_button" href={`${apiBaseUrl}/auth/vk`}>
              <VkIcon />
              Продолжить через VK
            </a>
          </div>

          <div className="auth_divider">или</div>

          <form className="auth_form" onSubmit={handleSubmit} noValidate>
            <label className="auth_field">
              <span>Имя</span>
              <input
                required
                minLength={nameMinLength}
                maxLength={nameMaxLength}
                value={firstName}
                onChange={handleFieldChange("firstName")}
                onBlur={(event) => handleFieldBlur("firstName", event)}
                autoComplete="given-name"
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={fieldErrors.firstName ? "register-first-name-error" : undefined}
              />
              {fieldErrors.firstName ? (
                <span className="auth_field-error" id="register-first-name-error">
                  {fieldErrors.firstName}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span>Фамилия</span>
              <input
                required
                minLength={nameMinLength}
                maxLength={nameMaxLength}
                value={lastName}
                onChange={handleFieldChange("lastName")}
                onBlur={(event) => handleFieldBlur("lastName", event)}
                autoComplete="family-name"
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={fieldErrors.lastName ? "register-last-name-error" : undefined}
              />
              {fieldErrors.lastName ? (
                <span className="auth_field-error" id="register-last-name-error">
                  {fieldErrors.lastName}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={handleFieldChange("email")}
                onBlur={(event) => handleFieldBlur("email", event)}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
              />
              {fieldErrors.email ? (
                <span className="auth_field-error" id="register-email-error">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label className="auth_field">
              <span>Пароль</span>
              <input
                required
                minLength={passwordMinLength}
                maxLength={passwordMaxLength}
                type="password"
                value={password}
                onChange={handleFieldChange("password")}
                onBlur={(event) => handleFieldBlur("password", event)}
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
              />
              {fieldErrors.password ? (
                <span className="auth_field-error" id="register-password-error">
                  {fieldErrors.password}
                </span>
              ) : null}
            </label>

            {error ? <p className="auth_error">{error}</p> : null}

            <button className="auth_submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создаём..." : "Создать аккаунт"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
