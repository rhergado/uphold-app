export default function TestMobile() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#f8f7f4]">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-1">
          <h1 className="text-6xl font-light tracking-tight text-neutral-800">
            Uphold
          </h1>
          <p className="text-sm font-light text-neutral-600 tracking-wide">
            Mobile test - No auth required
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-lg">✅ Mobile connection working!</p>
          <p className="text-sm text-gray-600 mt-2">
            Screen width: <span className="font-mono">{typeof window !== 'undefined' ? window.innerWidth : 'loading'}px</span>
          </p>
        </div>
      </div>
    </main>
  );
}
