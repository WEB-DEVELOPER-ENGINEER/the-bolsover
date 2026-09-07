import Image from "next/image";
import Link from "next/link";
import { useCMS } from "@/context/CMSContext";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";

const ArrowOut = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArchitectureSection = () => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;

  return (
    <section id="architecture" className="relative min-h-[85svh] w-full overflow-hidden bg-[#15110d] text-white" aria-labelledby="architecture-title">
      <div className="absolute inset-0">
        <Image
          src={config.architectureImage || "/assets/images/lifestyle-stills/arrival.png"}
          alt="The Bolsover on Bolsover Street in Fitzrovia"
          fill
          loading="lazy"
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[85svh] flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-[48rem]">
        <p className="font-sans text-xs uppercase tracking-widest text-[#c5a059] mb-3">3-8 Bolsover Street</p>
        <h2 id="architecture-title" className="font-serif text-[clamp(2.4rem,4.2vw,4.8rem)] leading-[0.98] tracking-[-0.035em] text-white">
          A quietly confident London address.
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-white/82 max-w-[32rem]">
          Edwardian character, considered for contemporary life in the heart of Fitzrovia.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/20 pt-6 font-sans">
          <div>
            <dt className="font-serif text-3xl text-white font-normal">24</dt>
            <dd className="mt-1 text-xs text-white/70 uppercase tracking-wider">Private apartments</dd>
          </div>
          <div>
            <dt className="font-serif text-3xl text-white font-normal">W1</dt>
            <dd className="mt-1 text-xs text-white/70 uppercase tracking-wider">Fitzrovia, London</dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export const ApartmentsTeaserSection = () => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;

  return (
    <section id="apartments" className="relative min-h-[85svh] w-full overflow-hidden bg-[#15110d] text-white" aria-labelledby="apartments-teaser-title">
      <div className="absolute inset-0">
        <Image
          src={config.apartmentsTeaserImage || "/apartments/apartment-living-kitchen.png"}
          alt="Open-plan living room and kitchen at The Bolsover"
          fill
          loading="lazy"
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[85svh] flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-[48rem]">
        <p className="font-sans text-xs uppercase tracking-widest text-[#c5a059] mb-3">Inside The Bolsover</p>
        <h2 id="apartments-teaser-title" className="font-serif text-[clamp(2.4rem,4.2vw,4.8rem)] leading-[0.98] tracking-[-0.035em] text-white">
          Homes for everyday London life.
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-white/82 max-w-[32rem]">
          Explore the residence directory and move through the first interior at your own pace. Apartment details will be added as they are confirmed.
        </p>
        <div className="mt-8">
          <Link href="/apartments" className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-[#c5a059] hover:text-white transition-colors">
            Explore the apartments <ArrowOut />
          </Link>
        </div>
      </div>
    </section>
  );
};
