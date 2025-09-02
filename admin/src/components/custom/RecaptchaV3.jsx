import React, { useEffect } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
const SITE_KEY = '6LenhY0rAAAAAL9R_7H6PjE5JdF29gfIBEN12RHP'; // <-- Replace with your actual site ke

export function RecaptchaV3Provider({ children }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

// Usage: Call this hook in your form component to get a token
export function useRecaptchaToken(action = 'submit') {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = async () => {
    if (!executeRecaptcha) return null;
    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (err) {
      return null;
    }
  };

  return getToken;
}