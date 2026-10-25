import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses and protects your data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          {SITE_NAME} helps League of Legends players find a duo partner. This policy explains what data we collect,
          why, who we share it with and what rights you have. {SITE_NAME} is operated by {OPERATOR_NAME}, based in
          Poland (European Union), who is the data controller. Questions or requests: {mail}.
        </p>
      }
    >
      <LegalSection title="1. Data we collect">
        <p>
          <strong>From your Google or Discord sign-in:</strong> your email address, display name and profile picture.
          We only accept sign-ins with a verified email address.
        </p>
        <p>
          <strong>Profile details you provide:</strong> username, region, main and secondary role, playstyle, goals,
          communication preferences and an optional bio.
        </p>
        <p>
          <strong>Your League of Legends account:</strong> the Riot ID (game name and tag) you link, and your Solo/Duo
          and Flex ranks, which we look up through the official Riot Games API.
        </p>
        <p>
          <strong>Activity on {SITE_NAME}:</strong> duo posts you create, friend requests you send and receive,
          your friends list, and the time you were last active (used for the &quot;Online now&quot; indicator).
        </p>
        <p>
          <strong>Technical data:</strong> our hosting provider processes your IP address and request details to
          deliver the site and keep it secure. We keep short-lived counters per account to limit abuse (for example,
          how many requests you made in the last minute).
        </p>
      </LegalSection>

      <LegalSection title="2. Who can see what">
        <ul>
          <li>
            <strong>Other signed-in players</strong> can see your username, profile picture, region, ranks, roles,
            playstyle, goals, bio, your duo posts and whether you are online.
          </li>
          <li>
            <strong>Your Riot ID is private.</strong> Only you and players whose friend request you accepted (or who
            accepted yours) can see it.
          </li>
          <li>
            <strong>Your email address</strong> and sign-in display name are never shown to other players.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Why we use your data">
        <ul>
          <li>
            To provide {SITE_NAME}: your account, profile, duo feed, friend requests and matching (performance of our
            agreement with you, GDPR Art. 6(1)(b)).
          </li>
          <li>
            To keep the service secure and fair: preventing spam, abuse and fake accounts (our legitimate interest,
            Art. 6(1)(f)).
          </li>
          <li>To comply with legal obligations where they apply (Art. 6(1)(c)).</li>
        </ul>
        <p>
          We do not sell your data, do not use it for advertising and do not use analytics or tracking tools.
        </p>
      </LegalSection>

      <LegalSection title="4. Services we rely on">
        <p>We share data only with providers needed to run {SITE_NAME}:</p>
        <ul>
          <li>
            <strong>Vercel</strong> – website hosting.
          </li>
          <li>
            <strong>Neon</strong> – database.
          </li>
          <li>
            <strong>Upstash</strong> – short-lived rate-limit counters.
          </li>
          <li>
            <strong>Google and Discord</strong> – sign-in.
          </li>
          <li>
            <strong>Riot Games</strong> – we send your Riot ID to the Riot Games API to look up your account and
            ranks.
          </li>
        </ul>
        <p>
          Some of these providers may process data outside the European Economic Area. Where they do, they rely on
          safeguards approved under the GDPR, such as the EU Standard Contractual Clauses.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and local storage">
        <p>
          We use only what is strictly necessary: a sign-in session cookie that keeps you logged in, and your
          browser&apos;s local storage to remember your progress while you set up your profile. We do not use
          advertising or analytics cookies, so no cookie banner is needed.
        </p>
      </LegalSection>

      <LegalSection title="6. How long we keep data">
        <p>
          We keep your account data, profile, posts and friend connections for as long as your account exists. Duo
          posts stay visible until you delete them; deleted posts are hidden from everyone and stay stored with your
          account. Rate-limit counters expire within minutes. When you delete your account, we remove
          your data within 30 days, unless the law requires us to keep something longer.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>Under the GDPR you can:</p>
        <ul>
          <li>access the data we hold about you and get a copy of it;</li>
          <li>correct inaccurate data (most of it you can edit yourself on your profile);</li>
          <li>have your data deleted, including your whole account;</li>
          <li>object to or ask us to restrict certain processing;</li>
          <li>receive your data in a portable format.</li>
        </ul>
        <p>
          To use any of these rights, email {mail} from the address you sign in with. We reply within one month. You
          can also complain to a data protection authority; in Poland that is the President of the Personal Data
          Protection Office (UODO, uodo.gov.pl).
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>
          {SITE_NAME} is intended for people aged 16 or older. If you believe a younger child has created an account,
          contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use encrypted connections (HTTPS), restrict access to data on our servers, limit request rates and only
          show your Riot ID to accepted friends. No online service is perfectly secure, but we work to protect your
          data and will notify you and the authorities of a breach where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes">
        <p>
          We may update this policy as {SITE_NAME} changes. We will change the date at the top and, for significant
          changes, let you know in the app.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
