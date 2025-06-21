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
      <h1 className="text-6xl font-bold text-white mb-16 mt-8">To Do クエスト</h1>

      <button
        onClick={() => login()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transform transition duration-300 hover:scale-105"
      >
        LET'S PLAY
      </button>
    </div>
  );
}