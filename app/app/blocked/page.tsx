// app/blocked/page.tsx
export default function Blocked() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="p-10 border rounded-2xl shadow-xl text-center bg-white">
        <h1 className="text-2xl font-bold">Sorry!</h1>
        <p className="text-gray-600">In this country, our services are not available. Please contact www.smileliveapp.com</p>
      </div>
    </div>
  );
}
