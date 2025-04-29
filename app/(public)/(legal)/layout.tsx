import './style.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-8 w-full md:w-2/3 mx-auto py-3 lg:px-24  lg:py-8">
      {children}
    </main>
  );
}
