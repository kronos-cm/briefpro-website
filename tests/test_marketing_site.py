import unittest
from html.parser import HTMLParser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]


class HeadCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.metas = []
        self.links = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.metas.append(attrs)
        elif tag == "link":
            self.links.append(attrs)
        elif tag == "script":
            self.scripts.append(attrs)


class BodyCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = []
        self.images = []
        self.sections = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.anchors.append(attrs)
        elif tag == "img":
            self.images.append(attrs)
        elif tag == "section":
            self.sections.append(attrs)


class MarketingSiteTests(unittest.TestCase):
    def _load(self, path: Path):
        html = path.read_text(encoding="utf-8")
        head_parser = HeadCollector()
        body_parser = BodyCollector()
        head_parser.feed(html)
        body_parser.feed(html)
        return head_parser, body_parser

    def test_de_seo_and_social(self):
        head, _ = self._load(BASE_DIR / "index.html")
        meta_names = {m.get("name"): m.get("content") for m in head.metas if m.get("name")}
        meta_props = {m.get("property"): m.get("content") for m in head.metas if m.get("property")}
        self.assertTrue(meta_names.get("description"))
        self.assertTrue(meta_props.get("og:title"))
        self.assertTrue(meta_props.get("og:description"))
        self.assertTrue(meta_props.get("og:url"))
        self.assertIn("canonical", [l.get("rel") for l in head.links])
        self.assertIn("alternate", [l.get("rel") for l in head.links])
        self.assertIn("application/ld+json", [s.get("type") for s in head.scripts])

    def test_en_seo_and_social(self):
        head, _ = self._load(BASE_DIR / "en" / "index.html")
        meta_names = {m.get("name"): m.get("content") for m in head.metas if m.get("name")}
        meta_props = {m.get("property"): m.get("content") for m in head.metas if m.get("property")}
        self.assertTrue(meta_names.get("description"))
        self.assertTrue(meta_props.get("og:title"))
        self.assertTrue(meta_props.get("og:description"))
        self.assertTrue(meta_props.get("og:url"))
        self.assertIn("canonical", [l.get("rel") for l in head.links])
        self.assertIn("alternate", [l.get("rel") for l in head.links])
        self.assertIn("application/ld+json", [s.get("type") for s in head.scripts])

    def test_primary_cta_repeated(self):
        _, body = self._load(BASE_DIR / "index.html")
        primary_ctas = [
            a for a in body.anchors
            if "btn" in (a.get("class") or "") and "primary" in a.get("class", "")
        ]
        self.assertGreaterEqual(len(primary_ctas), 2)
        hrefs = {a.get("href") for a in primary_ctas}
        self.assertEqual(len(hrefs), 1, "Primary CTA should be a single destination")

    def test_proof_assets_present(self):
        _, body = self._load(BASE_DIR / "index.html")
        sections = {s.get("id") for s in body.sections}
        self.assertIn("proof", sections)
        proof_images = [img for img in body.images if (img.get("src") or "").startswith("/assets/proof-")]
        self.assertGreaterEqual(len(proof_images), 3)

    def test_analytics_present(self):
        head, _ = self._load(BASE_DIR / "index.html")
        analytics_scripts = [s for s in head.scripts if s.get("data-domain") == "briefpro.de"]
        self.assertTrue(analytics_scripts, "Expected privacy-friendly analytics script with data-domain")

    def test_de_company_and_team_sections(self):
        _, body = self._load(BASE_DIR / "index.html")
        section_ids = {section.get("id") for section in body.sections}
        self.assertIn("gruendungsstory", section_ids)
        self.assertIn("team", section_ids)
        self.assertIn("faq", section_ids)

        linkedin_links = [anchor.get("href", "") for anchor in body.anchors if "linkedin.com/in/" in anchor.get("href", "")]
        self.assertTrue(any("angelcastrom" in href for href in linkedin_links))

        team_images = [image.get("src", "") for image in body.images if "team-" in image.get("src", "")]
        self.assertGreaterEqual(len(team_images), 1)

    def test_en_company_and_team_sections(self):
        _, body = self._load(BASE_DIR / "en" / "index.html")
        section_ids = {section.get("id") for section in body.sections}
        self.assertIn("founder-story", section_ids)
        self.assertIn("team", section_ids)
        self.assertIn("faq", section_ids)

        linkedin_links = [anchor.get("href", "") for anchor in body.anchors if "linkedin.com/in/" in anchor.get("href", "")]
        self.assertTrue(any("angelcastrom" in href for href in linkedin_links))


if __name__ == "__main__":
    unittest.main()
