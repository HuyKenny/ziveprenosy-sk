/**
 * Links to sister sites (same owner, gambling cluster; Kenny 24. 10. 2026). Only in page text, never in the footer
 * or navigation, at most one per page, and never to a page that links back here (see ~/ai/seo/linkbuilding/graf.md).
 * Incoming: sportstreamy.cz Slovak competition pages → /futbal/nike-liga/, /hokej/tipsport-liga/, /futbal/2-liga/;
 * spiny.sk /tipsport-aplikacia/ → /tipsport-tv/.
 */
export const SISTER_COMPETITION: Record<string, { href: string; html: string }> = {
  'tipsport-extraliga': {
    href: 'https://sportstreamy.cz/hokej-online/tipsport-extraliga/',
    html: 'Program českej extraligy s kurzami a výsledkami pre českých divákov vedie náš sesterský web <a href="https://sportstreamy.cz/hokej-online/tipsport-extraliga/">SportStreamy.cz</a>.',
  },
  'chance-liga': {
    href: 'https://sportstreamy.cz/fotbal-online/chance-liga/',
    html: 'Podrobný program Chance Ligy s kurzami a výsledkami pre českých divákov nájdeš na sesterskom webe <a href="https://sportstreamy.cz/fotbal-online/chance-liga/">SportStreamy.cz</a>.',
  },
};

/** /tipsport-bonus/ → spiny.sk review of the Tipsport casino (free spins: a different topic than our sports bonus). */
export const SISTER_CASINO_HTML = 'Tipsport má aj online kasíno s vlastnými free spinmi a bonusmi. Aktuálnu ponuku a jej podmienky rozoberá <a href="https://spiny.sk/casino/tipsport/">recenzia Tipsport kasína na Spiny.sk</a>.';
