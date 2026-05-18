import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../auth/AuthShell";
import { GoogleIcon, VkIcon } from "../auth/SocialIcons";
import { apiBaseUrl } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const user = useAuthStore((state) => state.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signUp({ firstName, lastName, email, password });
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

          <form className="auth_form" onSubmit={handleSubmit}>
            <label className="auth_field">
              <span>Имя</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>

            <label className="auth_field">
              <span>Фамилия</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
            </label>

            <label className="auth_field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="auth_field">
              <span>Пароль</span>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
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
