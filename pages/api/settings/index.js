import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";

const prisma = new PrismaClient();
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 100, // Max 100 users per second
});

// Default settings when no DB settings exist
const defaultSettings = {
  general: {
    siteName: "DevOpsHub",
    siteDescription: "DevOps, Cloud ve Konteynerleştirme hakkında güncel bilgiler",
    siteUrl: "https://devopshub.com",
    logoUrl: "/images/logo.png",
    faviconUrl: "/images/favicon.ico",
    defaultLanguage: "tr",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24h",
    timezone: "Europe/Istanbul",
    postsPerPage: 10,
    showAuthor: true,
    showDate: true,
    showComments: true,
    showShareButtons: true
  },
  seo: {
    metaTitle: "DevOpsHub - DevOps, Kubernetes ve Cloud Teknolojileri",
    metaDescription: "DevOps, Kubernetes, Docker, CI/CD, AWS, Azure ve daha fazlası hakkında en güncel bilgiler",
    metaKeywords: "devops, kubernetes, docker, cloud, aws, azure, ci/cd, jenkins, github actions",
    googleAnalyticsId: "",
    enableSitemap: true,
    enableRss: true,
    enableCanonical: true,
    enableRobotsTxt: true,
    enableSchemaMarkup: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    twitterUsername: "@devopshub",
    facebookAppId: ""
  },
  comments: {
    enableComments: true,
    moderateComments: true,
    allowAnonymous: false,
    requireModeration: true,
    allowReplies: true,
    maxCommentLength: 1000,
    minCommentLength: 10,
    allowEditing: true,
    allowVoting: true,
    enableSpamProtection: true,
    enableProfanityFilter: true,
    profanityWords: "küfür1, küfür2, küfür3"
  },
  email: {
    smtpServer: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "info@example.com",
    smtpPassword: "******",
    senderEmail: "info@devopshub.com",
    senderName: "DevOpsHub",
    enableEmailNotifications: true,
    notifyOnNewComment: true,
    notifyOnNewUser: true
  },
  social: {
    twitter: "https://twitter.com/devopshub",
    facebook: "https://facebook.com/devopshub",
    instagram: "",
    linkedin: "https://linkedin.com/company/devopshub",
    github: "https://github.com/devopshub",
    youtube: "",
    medium: ""
  },
  appearance: {
    theme: "light",
    primaryColor: "#22c55e",
    secondaryColor: "#0f172a",
    accentColor: "#3b82f6",
    fontFamily: "Inter, sans-serif",
    headerStyle: "default",
    footerStyle: "default",
    enableDarkMode: true,
    customCss: ""
  }
};

// Helper to fetch settings from database
async function getSettingsFromDB() {
  try {
    const dbSettings = await prisma.settings.findMany();
    
    if (!dbSettings || dbSettings.length === 0) {
      return defaultSettings;
    }
    
    // Group settings by section
    const settingsMap = {};
    dbSettings.forEach(item => {
      if (!settingsMap[item.section]) {
        settingsMap[item.section] = {};
      }
      
      // Parse value based on JSON structure
      try {
        settingsMap[item.section][item.key] = JSON.parse(item.value);
      } catch (e) {
        settingsMap[item.section][item.key] = item.value;
      }
    });
    
    // Merge with default settings to ensure all needed keys exist
    return {
      general: { ...defaultSettings.general, ...settingsMap.general },
      seo: { ...defaultSettings.seo, ...settingsMap.seo },
      comments: { ...defaultSettings.comments, ...settingsMap.comments },
      email: { ...defaultSettings.email, ...settingsMap.email },
      social: { ...defaultSettings.social, ...settingsMap.social },
      appearance: { ...defaultSettings.appearance, ...settingsMap.appearance }
    };
  } catch (error) {
    console.error("Error loading settings from DB:", error);
    return defaultSettings;
  }
}

// Helper to save settings to database
async function saveSettingsToDB(section, data) {
  // Process each key in the data object
  for (const [key, value] of Object.entries(data)) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Try to find existing setting
    const existingSetting = await prisma.settings.findFirst({
      where: {
        section,
        key
      }
    });
    
    if (existingSetting) {
      // Update existing setting
      await prisma.settings.update({
        where: { id: existingSetting.id },
        data: { value: stringValue }
      });
    } else {
      // Create new setting
      await prisma.settings.create({
        data: {
          section,
          key,
          value: stringValue
        }
      });
    }
  }
}

export default async function handler(req, res) {
  try {
    // Apply rate limiting
    await limiter.check(res, 20, "settings-api");

    const session = await getServerSession(req, res, authOptions);

    // GET method for fetching settings
    if (req.method === "GET") {
      const settingsData = await getSettingsFromDB();
      const section = req.query.section;
      
      if (section && settingsData[section]) {
        return res.status(200).json({ 
          success: true, 
          data: settingsData[section] 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        data: settingsData 
      });
    } 
    
    // POST method for updating settings
    else if (req.method === "POST") {
      // Only authenticated admin users can update settings
      if (!session || session.user.role !== "ADMIN") {
        return res.status(403).json({ 
          success: false, 
          message: "Bu işlem için yetkiniz bulunmamaktadır." 
        });
      }

      const { section, data } = req.body;
      
      if (!section || !data || !defaultSettings[section]) {
        return res.status(400).json({ 
          success: false, 
          message: "Geçersiz ayar bölümü veya veri." 
        });
      }
      
      // Save settings to database
      await saveSettingsToDB(section, data);
      
      return res.status(200).json({ 
        success: true, 
        message: "Ayarlar başarıyla güncellendi.", 
        data
      });
    }
    
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  } catch (error) {
    console.error("Settings API Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Ayar işlemi sırasında bir hata oluştu."
    });
  }
} 