export default async function AuthErrorPage({searchParams}: { searchParams: Promise<{ error?: string }> }) {
    return <>{JSON.stringify((await searchParams).error)}</>;
}
