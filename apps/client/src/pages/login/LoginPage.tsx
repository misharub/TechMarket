import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../lib/auth-store";
import "../static-pages/StaticPages.css";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      navigate(from && from !== "/admin" ? from : "/", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось войти");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="service_page" aria-labelledby="login_page_title">
      <div className="service_page_inner login_page_inner">
        <h1 id="login_page_title">Войти</h1>

        {user ? (
          <p className="login_page_note">Вы уже вошли как {user.email}.</p>
        ) : (
          <form className="login_form" onSubmit={handleSubmit}>
            <label className="login_field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="login_field">
              <span>Пароль</span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="login_error">{error}</p> : null}

            <button className="login_submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Входим..." : "Войти"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
