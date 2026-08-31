import {
  SiStripe,
  SiPaypal,
  SiRazorpay,
  SiSupabase,
  SiPlanetscale,
  SiNeon,
  SiMongodb,
  SiPostgresql,
  SiRedis,
  SiFirebase,
  SiAuth0,
  SiClerk,
  SiVercel,
  SiCloudflare,
  SiSentry,
  SiDatadog,
  SiMailgun,
  SiResend,
  SiAlgolia,
  SiAnthropic,
  SiGithub,
  SiShopify,
  SiNotion,
  SiLinear,
} from "react-icons/si";

const PROVIDERS = [
  { name: "Stripe", Icon: SiStripe },
  { name: "PayPal", Icon: SiPaypal },
  { name: "Razorpay", Icon: SiRazorpay },
  { name: "Supabase", Icon: SiSupabase },
  { name: "PlanetScale", Icon: SiPlanetscale },
  { name: "Neon", Icon: SiNeon },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "Redis", Icon: SiRedis },
  { name: "Firebase", Icon: SiFirebase },
  { name: "Auth0", Icon: SiAuth0 },
  { name: "Clerk", Icon: SiClerk },
  { name: "Vercel", Icon: SiVercel },
  { name: "Cloudflare", Icon: SiCloudflare },
  { name: "Sentry", Icon: SiSentry },
  { name: "Datadog", Icon: SiDatadog },
  { name: "Mailgun", Icon: SiMailgun },
  { name: "Resend", Icon: SiResend },
  { name: "Algolia", Icon: SiAlgolia },
  { name: "Anthropic", Icon: SiAnthropic },
  { name: "GitHub", Icon: SiGithub },
  { name: "Shopify", Icon: SiShopify },
  { name: "Notion", Icon: SiNotion },
  { name: "Linear", Icon: SiLinear },
];

function LogoTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={ariaHidden}>
      {PROVIDERS.map(({ name, Icon }) => (
        <span
          key={name}
          className="flex items-center gap-2 text-muted-foreground/70 grayscale transition hover:text-foreground hover:grayscale-0"
          title={name}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap font-mono text-xs">{name}</span>
        </span>
      ))}
    </div>
  );
}

export function StackRow() {
  return (
    <div className="border-y border-border bg-muted/20 py-10">
      <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recognizes API keys and connection strings from 500+ providers
      </p>
      <div
        className="group relative mt-6 flex overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          <LogoTrack />
          <LogoTrack ariaHidden />
        </div>
      </div>
    </div>
  );
}
