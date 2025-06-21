import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface LoginPageProps {
  onLogin: (credentialResponse: CredentialResponse) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl mb-8">To Do クエスト</h1>
      <p className="mb-4">Googleアカウントでログインして始める</p>
      <GoogleLogin
        onSuccess={credentialResponse => {
          console.log('Login Success:', credentialResponse);
          onLogin(credentialResponse);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
} 