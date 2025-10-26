export default function FullSizeLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative h-24 w-24">
        {/* Gradient spinning ring */}
        <div
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #E0C2E2, #C586D0, #9F4AA3)",
          }}
        ></div>

        {/* White inner circle to create hollow center */}
        <div className="absolute inset-[10%] rounded-full bg-background"></div>
        
        {/* MG Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-[#7B3C7D]">MG</span>
        </div>
      </div>
    </div>
  );
}
