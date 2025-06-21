import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';

// The rest of your code remains the same
interface LoginPageProps {
  onLogin: (response: TokenResponse) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const login = useGoogleLogin({
    onSuccess: response => {
      console.log('Login Success:', response);
      onLogin(response);
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url("/raw.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="relative mb-16 mt-12">
        <h1
          className="text-8xl font-extrabold text-white text-center select-none"
          style={{ textShadow: '8px 8px 0 #000, 4px 4px 0 #000' }}
        >
          To Do クエスト
        </h1>
      </div>

      <button
        onClick={() => login()}
        className="nes-btn is-primary w-60 h-16 text-xl font-bold"
      >
        🔑　LET'S PLAY
      </button>
    </div>
  );
}