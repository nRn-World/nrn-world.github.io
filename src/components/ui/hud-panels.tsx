import { useEffect, useState, type ReactNode } from 'react';
import { Facebook, Ghost, Github, Instagram } from 'lucide-react';
import { ALL_PROJECTS } from '@/data/projectsData';

// HUD-rutor i samma stil som ugurkeskekci.com: hörn-hakar, mono-etiketter, digitala siffror och linjal.
const label = 'font-mono text-[10.5px] uppercase leading-[1.3] tracking-[0.16em] text-neutral-400';
const digits = 'font-mono text-[1.6rem] leading-none tracking-[0.02em] tabular-nums text-white lg:text-[2rem]';
const ruler = {
  height: 5,
  background: 'repeating-linear-gradient(90deg, rgba(160,165,175,0.5) 0 1px, transparent 1px 8px)',
  maskImage: 'linear-gradient(90deg, #000, transparent)',
  WebkitMaskImage: 'linear-gradient(90deg, #000, transparent)',
} as const;

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className={`relative w-full min-w-0 rounded-[4px] border border-white/10 bg-white/[0.04] px-[1.1rem] pb-[1.1rem] pt-4 backdrop-blur-[10px]`}>
      <span className="pointer-events-none absolute -left-px -top-px size-3 border-l-2 border-t-2 border-blue-400" />
      <span className="pointer-events-none absolute -bottom-px -right-px size-3 border-b-2 border-r-2 border-blue-400" />
      {children}
    </div>
  );
}

const SOCIAL = [
  { name: 'Instagram', href: 'https://www.instagram.com/RobinAyzit', Icon: Instagram },
  { name: 'Facebook', href: 'https://www.facebook.com/RobinAyzit', Icon: Facebook },
  { name: 'Snapchat', href: 'https://www.snapchat.com/add/RobinAyzit', Icon: Ghost },
];

function Row({ k, v, unit, action }: { k: string; v: string; unit?: string; action?: ReactNode }) {
  return (
    <li>
      <p className={label}>{k}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono text-lg leading-tight tracking-[0.02em] text-white lg:text-xl">{v}</span>
        {unit && <span className="font-mono text-xs uppercase tracking-wider text-blue-400">{unit}</span>}
        {action}
      </p>
      <span aria-hidden className="mt-2 block" style={ruler} />
    </li>
  );
}

function ProfilePanel() {
  return (
    <Panel>
      <p className={`${label} flex justify-between`}>
        <span>Profil</span>
        <span>nRnWorld</span>
      </p>
      <ul className="mt-3 space-y-3">
        <Row k="Namn" v="Robin Ayzit" />
        <Row k="Född" v="1986-12-16" />
        <Row
          k="Antal projekt"
          v={String(ALL_PROJECTS.length)}
          action={
            <a
              href="https://github.com/nRn-World?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub: alla projekt"
              title="GitHub: alla projekt"
              className="ml-1 flex size-6 items-center justify-center self-center rounded-[4px] border border-white/10 text-neutral-300 transition-colors hover:border-blue-400 hover:text-blue-400"
            >
              <Github className="size-3.5" />
            </a>
          }
        />
        <li>
          <p className={label}>Socialmedia</p>
          <p className="mt-1.5 flex items-center gap-2">
            {SOCIAL.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name}: RobinAyzit`}
                title={`${name}: RobinAyzit`}
                className="flex size-8 items-center justify-center rounded-[4px] border border-white/10 text-neutral-300 transition-colors hover:border-blue-400 hover:text-blue-400"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </p>
          <span aria-hidden className="mt-2 block" style={ruler} />
        </li>
      </ul>
    </Panel>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

function ClockPanel() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const date = now.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Panel>
      <p className={`${label} flex justify-between`}>
        <span>Lokal tid</span>
        <span>{now.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })}</span>
      </p>
      <p className="mt-3 flex items-baseline gap-1">
        <span className={digits}>
          {pad(now.getHours())}:{pad(now.getMinutes())}
        </span>
        <span className="font-mono text-xs tracking-wider text-blue-400">{pad(now.getSeconds())}</span>
      </p>
      <span aria-hidden className="mt-2 block" style={ruler} />
      <p className={`${label} mt-3 normal-case tracking-[0.08em]`}>{date}</p>
    </Panel>
  );
}

export function HudColumn() {
  return (
    <div className="absolute left-1 top-3 z-20 flex w-[190px] origin-top-left scale-[0.72] flex-col gap-4 md:left-2 md:top-24 md:scale-100 lg:left-8 lg:w-[220px]">
      <ProfilePanel />
      <div className="hidden md:block">
        <ClockPanel />
      </div>
    </div>
  );
}
