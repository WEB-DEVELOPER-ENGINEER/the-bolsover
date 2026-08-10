import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LocationMapExperience } from "@/components/LocationMapExperience";

export const metadata: Metadata = {
  title: "Location | The Bolsover, Fitzrovia W1",
  description: "Explore Fitzrovia, Regent's Park, Marylebone and the West End around The Bolsover at 3-8 Bolsover Street."
};

export default function LocationPage() {
  return (
    <div className="location-page location-page-light">
      <main className="pt-[4.75rem] lg:pt-[4.9rem]">
        <section className="location-page-intro" aria-labelledby="location-page-title">
          <img
            src="/maps/bolsover-atlist-base.svg"
            alt=""
            aria-hidden="true"
            className="location-page-intro-map"
          />
          <div className="location-page-intro-shade" />
          <div className="location-page-intro-copy">
            <p>Fitzrovia, London W1</p>
            <h1 id="location-page-title">
              A quieter address,<br />remarkably connected.
            </h1>
            <div className="location-page-intro-footer">
              <p>
                Regent&apos;s Park to the north. Marylebone to the west. The West End and Soho a short walk south.
              </p>
              <Link href="#neighbourhood-map">
                View the neighbourhood <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </section>

        <LocationMapExperience />
      </main>
    </div>
  );
}
