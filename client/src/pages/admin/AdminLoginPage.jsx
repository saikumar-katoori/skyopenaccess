import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailCode, setForgotEmailCode] = useState("");
  const [forgot2faCode, setForgot2faCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setDevCode("");

    try {
      const { data } = await http.post("/auth/login", { email, password });

      if (data.requiresTwoFactor && data.challengeToken) {
        setChallengeToken(data.challengeToken);
        setStep("twoFactor");
        setInfo(data.message || "Enter the code from your authenticator app.");
        return;
      }

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      const requiresEmailVerification = Boolean(err.response?.data?.requiresEmailVerification);
      const fallbackCode = err.response?.data?.devVerificationCode;
      setError(message);
      if (fallbackCode) {
        setDevCode(`Dev verification code: ${fallbackCode}`);
      }
      if (requiresEmailVerification || message.toLowerCase().includes("not verified")) {
        setStep("verifyEmail");
      }
    }
  };

  const submitTwoFactor = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const { data } = await http.post("/auth/verify-2fa", {
        challengeToken,
        code: twoFactorCode
      });
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Two-factor verification failed");
    }
  };

  const submitEmailVerification = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const { data } = await http.post("/auth/verify-email", {
        email,
        code: emailVerificationCode
      });
      setInfo(data.message || "Gmail verified. You can now login.");
      setStep("login");
    } catch (err) {
      setError(err.response?.data?.message || "Email verification failed");
    }
  };

  const resendEmailVerification = async () => {
    setError("");
    setInfo("");
    setDevCode("");

    try {
      const { data } = await http.post("/auth/resend-verification", { email });
      setInfo(data.message || "Verification code sent.");
      if (data.devVerificationCode) setDevCode(`Dev verification code: ${data.devVerificationCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code");
    }
  };

  const submitForgotRequest = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setDevCode("");

    try {
      const { data } = await http.post("/auth/forgot-password-request", { email: forgotEmail });
      setInfo(data.message || "Verification code sent to your Gmail.");
      if (data.devVerificationCode) {
        setDevCode(`Dev verification code: ${data.devVerificationCode}`);
      }
      setStep("forgotReset");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset request failed");
    }
  };

  const submitForgotReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const { data } = await http.post("/auth/forgot-password-reset", {
        email: forgotEmail,
        emailCode: forgotEmailCode,
        twoFactorCode: forgot2faCode,
        newPassword: forgotNewPassword
      });
      setInfo(data.message || "Password reset successfully. You can now login.");
      // Clean up states
      setForgotEmail("");
      setForgotEmailCode("");
      setForgot2faCode("");
      setForgotNewPassword("");
      setStep("login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <main className="container">
      <section className="form-card narrow">
        <h1>Admin Login</h1>
        {step === "login" ? (
          <form onSubmit={submitLogin} className="form-grid">
            <label>
              Gmail
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Continue
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setError("");
                setInfo("");
                setDevCode("");
                setForgotEmail(email);
                setStep("forgotRequest");
              }}
            >
              Forgot Password?
            </button>
          </form>
        ) : null}

        {step === "twoFactor" ? (
          <form onSubmit={submitTwoFactor} className="form-grid">
            <label>
              Authenticator Code
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Verify and Login
            </button>
            <button type="button" className="secondary-btn" onClick={() => setStep("login")}>
              Back
            </button>
          </form>
        ) : null}

        {step === "verifyEmail" ? (
          <form onSubmit={submitEmailVerification} className="form-grid">
            <label>
              Gmail
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Verification Code
              <input
                type="text"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Verify Gmail
            </button>
            <button type="button" className="secondary-btn" onClick={resendEmailVerification}>
              Resend Code
            </button>
            <button type="button" className="secondary-btn" onClick={() => setStep("login")}>
              Back to Login
            </button>
          </form>
        ) : null}

        {step === "forgotRequest" ? (
          <form onSubmit={submitForgotRequest} className="form-grid">
            <h2>Reset Password Request</h2>
            <p className="muted-line">
              Enter your admin Gmail address to receive a verification code.
            </p>
            <label>
              Gmail
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Send Verification Code
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setError("");
                setInfo("");
                setDevCode("");
                setStep("login");
              }}
            >
              Back to Login
            </button>
          </form>
        ) : null}

        {step === "forgotReset" ? (
          <form onSubmit={submitForgotReset} className="form-grid">
            <h2>Reset Password</h2>
            <p className="muted-line">
              Verify your identity by entering both the email verification code and the 2FA code from your authenticator app.
            </p>
            <label>
              Gmail
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Email Verification Code
              <input
                type="text"
                value={forgotEmailCode}
                onChange={(e) => setForgotEmailCode(e.target.value)}
                maxLength={6}
                required
              />
            </label>
            <label>
              Authenticator (2FA) Code
              <input
                type="text"
                value={forgot2faCode}
                onChange={(e) => setForgot2faCode(e.target.value)}
                maxLength={6}
                required
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <button type="submit" className="primary-btn">
              Reset Password
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setError("");
                setInfo("");
                setDevCode("");
                setStep("forgotRequest");
              }}
            >
              Back to Request
            </button>
          </form>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
        {devCode ? <p>{devCode}</p> : null}
      </section>
    </main>
  );
};
