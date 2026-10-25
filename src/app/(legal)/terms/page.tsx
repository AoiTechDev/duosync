import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The rules for using ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are the agreement between you and {OPERATOR_NAME}, who operates {SITE_NAME}. By creating an
          account or using {SITE_NAME} you agree to them. If you don&apos;t agree, please don&apos;t use the service.
        </p>
      }
    >
      <LegalSection title="1. What DuoGG is">
        <p>
          {SITE_NAME} is a free service that helps League of Legends players find duo partners: you create a
          profile, post what you&apos;re looking for, browse other players&apos; posts and connect through friend
          requests. Playing together happens in League of Legends itself, not on {SITE_NAME}.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <ul>
          <li>You must be at least 16 years old.</li>
          <li>You sign in with Google or Discord and are responsible for activity on your account.</li>
          <li>One account per person. Don&apos;t create accounts for other people.</li>
          <li>Keep your profile accurate, including your region and roles.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Your Riot account">
        <p>
          You may only link a Riot ID that belongs to you. Linking someone else&apos;s account, or misrepresenting your
          rank, is not allowed and can lead to your account being removed. Ranks are fetched from the Riot Games API
          and may not always be up to date.
        </p>
      </LegalSection>

      <LegalSection title="4. Rules of conduct">
        <p>When using {SITE_NAME}, you must not:</p>
        <ul>
          <li>harass, threaten, insult or discriminate against other players;</li>
          <li>post spam, advertising, or illegal, sexual or hateful content;</li>
          <li>impersonate other players, streamers, Riot Games staff or anyone else;</li>
          <li>offer or request account selling, account sharing, boosting, cheats, scripts or gambling;</li>
          <li>collect other players&apos; data, scrape the service or try to access accounts that aren&apos;t yours;</li>
          <li>interfere with the service, bypass its limits or probe it for security weaknesses without permission.</li>
        </ul>
        <p>
          You must also follow the rules of League of Legends and Riot Games. Report problems to {mail}.
        </p>
      </LegalSection>

      <LegalSection title="5. Your content">
        <p>
          You keep ownership of what you post (such as duo posts and your bio). You give us permission to store and
          show it to other {SITE_NAME} users for as long as it&apos;s on the service, which we need to run{" "}
          {SITE_NAME}. You are responsible for your content, and we may remove content that breaks these terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Suspending or ending accounts">
        <p>
          We may remove content, limit features or suspend or delete accounts that break these terms or put other
          players at risk. You can stop using {SITE_NAME} at any time and ask us to delete your account by emailing{" "}
          {mail}.
        </p>
      </LegalSection>

      <LegalSection title="7. Other players">
        <p>
          {SITE_NAME} connects you with other players but doesn&apos;t control what they do. We can&apos;t guarantee
          that you&apos;ll find a duo or that other players will behave well, keep their word or be the rank their
          profile shows. Be careful about sharing personal information, and report anyone who breaks these rules.
        </p>
      </LegalSection>

      <LegalSection title="8. The service">
        <p>
          {SITE_NAME} is provided free of charge and &quot;as is&quot;. We work to keep it running, but it may change,
          be unavailable at times or be discontinued. To the extent the law allows, we are not liable for indirect
          losses or for what other players do. Nothing in these terms limits rights you have as a consumer under the
          law of your country, or liability that can&apos;t be excluded by law.
        </p>
      </LegalSection>

      <LegalSection title="9. Riot Games">
        <p>
          {SITE_NAME} isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
          anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated
          properties are trademarks or registered trademarks of Riot Games, Inc.
        </p>
      </LegalSection>

      <LegalSection title="10. Privacy">
        <p>
          How we handle your data is explained in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes and contact">
        <p>
          We may update these terms. For significant changes we&apos;ll let you know in the app; continuing to use{" "}
          {SITE_NAME} after a change means you accept the new terms. These terms are governed by Polish law, without
          affecting the mandatory consumer protections of the country you live in. Questions: {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
