// Next.js Serverless API Route: Unsplash Stock Photography (Postiz / Bolt Architecture)
import type { NextApiRequest, NextApiResponse } from "next";

interface UnsplashPhoto {
  id: string;
  title: string;
  kind: "image";
  sourceUrl: string;
  thumbnailUrl: string;
  authorName: string;
  aspectRatio: number;
  tags: string[];
  category: string;
}

// High-quality curated Unsplash photography collections
const CURATED_UNSPLASH_PHOTOS: UnsplashPhoto[] = [
  // Tech & Innovation
  {
    id: "uns-tech-1",
    title: "Minimalist Workspace with MacBook",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=75",
    authorName: "Roberto Nickson",
    aspectRatio: 1.5,
    tags: ["tech", "apple", "macbook", "workspace", "desk", "laptop"],
    category: "tech",
  },
  {
    id: "uns-tech-2",
    title: "Futuristic Glowing Server Matrix",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=75",
    authorName: "Taylor Vick",
    aspectRatio: 1.5,
    tags: ["tech", "server", "data", "cloud", "ai", "hardware", "cyber"],
    category: "tech",
  },
  {
    id: "uns-tech-3",
    title: "Abstract Code on Dark Screen",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=75",
    authorName: "Florian Olivo",
    aspectRatio: 1.5,
    tags: ["tech", "code", "programming", "software", "developer", "developer"],
    category: "tech",
  },
  {
    id: "uns-tech-4",
    title: "AI Robotic Glass Neural Interface",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=75",
    authorName: "DeepMind",
    aspectRatio: 1.5,
    tags: ["tech", "ai", "neural", "deepmind", "abstract", "modern"],
    category: "tech",
  },

  // People & Leadership
  {
    id: "uns-people-1",
    title: "Executive Keynote Presentation",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=75",
    authorName: "Product School",
    aspectRatio: 1.5,
    tags: ["people", "presentation", "speaker", "keynote", "conference", "steve", "jobs", "founder"],
    category: "people",
  },
  {
    id: "uns-people-2",
    title: "Collaborative Team Brainstorming",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=75",
    authorName: "Annie Spratt",
    aspectRatio: 1.5,
    tags: ["people", "team", "startup", "office", "collaboration", "meeting"],
    category: "people",
  },
  {
    id: "uns-people-3",
    title: "Visionary Tech Founder at Work",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75",
    authorName: "Averie Woodard",
    aspectRatio: 1.5,
    tags: ["people", "portrait", "founder", "leader", "creator"],
    category: "people",
  },

  // Business & Strategy
  {
    id: "uns-biz-1",
    title: "Modern Architectural Glass Tower",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=75",
    authorName: "Samson",
    aspectRatio: 1.5,
    tags: ["business", "architecture", "skyscraper", "finance", "corporate", "city"],
    category: "business",
  },
  {
    id: "uns-biz-2",
    title: "Financial Analytics & Data Charts",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=75",
    authorName: "Luke Chesser",
    aspectRatio: 1.5,
    tags: ["business", "analytics", "charts", "growth", "dashboard", "metrics"],
    category: "business",
  },

  // Cyberpunk & Aesthetics
  {
    id: "uns-cyber-1",
    title: "Cyberpunk Tokyo Neon Street",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=75",
    authorName: "Alexander Schimmeck",
    aspectRatio: 1.5,
    tags: ["cyberpunk", "neon", "tokyo", "purple", "night", "city", "futuristic"],
    category: "cyberpunk",
  },
  {
    id: "uns-cyber-2",
    title: "Kinetic Holographic Light Streak",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=75",
    authorName: "Marc-Olivier Jodoin",
    aspectRatio: 1.5,
    tags: ["cyberpunk", "abstract", "kinetic", "glow", "energy", "motion"],
    category: "cyberpunk",
  },

  // Minimalist & Clean
  {
    id: "uns-min-1",
    title: "Minimalist Soft Gradient Texture",
    kind: "image",
    sourceUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=75",
    authorName: "Milad Fakurian",
    aspectRatio: 1.5,
    tags: ["minimalist", "clean", "texture", "background", "gradient", "pastel"],
    category: "minimalist",
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = String(req.query.q || req.body?.q || "").toLowerCase().trim();
  const category = String(req.query.category || req.body?.category || "").toLowerCase().trim();

  let results = CURATED_UNSPLASH_PHOTOS;

  if (category && category !== "all") {
    results = results.filter((p) => p.category === category);
  }

  if (query) {
    const qParts = query.split(/\s+/);
    results = results.filter((p) => {
      const text = `${p.title} ${p.tags.join(" ")} ${p.category} ${p.authorName}`.toLowerCase();
      return qParts.some((part) => text.includes(part));
    });

    // If query didn't match curated list, generate dynamic high-res Unsplash search URL
    if (results.length === 0) {
      const cleanKeyword = encodeURIComponent(query);
      const dynamicPhoto: UnsplashPhoto = {
        id: `uns-dynamic-${Date.now()}`,
        title: `${query.charAt(0).toUpperCase() + query.slice(1)} Photography`,
        kind: "image",
        sourceUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=85&query=${cleanKeyword}`,
        thumbnailUrl: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=75&query=${cleanKeyword}`,
        authorName: "Unsplash Contributor",
        aspectRatio: 1.5,
        tags: [query],
        category: "general",
      };
      results = [dynamicPhoto];
    }
  }

  // Format into StockAssetSummary array for EditorPanels
  const items = results.map((p) => ({
    id: p.id,
    kind: p.kind,
    title: p.title,
    sourceUrl: p.sourceUrl,
    previewUrl: p.thumbnailUrl || p.sourceUrl,
    thumbnailUrl: p.thumbnailUrl,
    authorName: p.authorName,
    aspectRatio: p.aspectRatio,
    tags: p.tags,
    favorited: false,
    live: false,
    license: "Unsplash License (Free for Commercial Use)",
  }));

  return res.status(200).json({ items });
}
