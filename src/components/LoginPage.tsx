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
      <div className="relative mb-8 mt-12 flex flex-col items-center">
        <h1
          className="text-5xl font-extrabold text-white text-center select-none"
          style={{ textShadow: '3px 3px 0 #000, 1.5px 1.5px 0 #000' }}
        >
          To Do クエスト
        </h1>
      </div>

      <img src="/egg.png" alt="egg" style={{ width: "120px", marginBottom: "32px" }} />

      <button
        onClick={() => login()}
        className="nes-btn is-primary w-60 h-16 text-xl font-bold"
      >
        🔑　LET'S PLAY
      </button>
    </div>
  );
}