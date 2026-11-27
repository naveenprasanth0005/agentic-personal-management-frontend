import { Outlet } from 'react-router-dom';

export function Authentication() {
  return (
    <main className="flex min-h-screen min-h-dvh w-full items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <Outlet />
      </div>
    </main>
  );
}
