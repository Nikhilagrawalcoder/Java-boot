import { WindowChrome } from "./window-chrome";

export function ProductDemoVideo() {
  return (
    <WindowChrome url="envsync.dev/dashboard/acme-saas" className="w-full max-w-5xl">
      <video
        className="w-full"
        poster="/videos/product-demo-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="EnvSync product walkthrough: signing in, viewing configuration health, reviewing issues, and comparing environments"
      >
        <source src="/videos/product-demo.webm" type="video/webm" />
        <source src="/videos/product-demo.mp4" type="video/mp4" />
      </video>
    </WindowChrome>
  );
}
