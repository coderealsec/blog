import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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
    siteName: "Harun ÖNER",
    siteDescription: "DevOps, Cloud ve Konteynerleştirme hakkında güncel bilgiler",
    siteUrl: "https://harunoner.com",
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
    metaTitle: "Harun ÖNER - DevOps, Kubernetes ve Cloud Teknolojileri",
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
    twitterUsername: "@harunoner",
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
    senderEmail: "info@harunoner.com",
    senderName: "Harun ÖNER",
    enableEmailNotifications: true,
    notifyOnNewComment: true,
    notifyOnNewUser: true
  },
  social: {
    twitter: "https://twitter.com/harunoner",
    facebook: "https://facebook.com/harunoner",
    instagram: "",
    linkedin: "https://linkedin.com/in/harunoner",
    github: "https://github.com/harunoner",
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
    
    // Provide more detailed error logging
    if (error.code) {
      console.error(`Prisma error code: ${error.code}`);
      console.error(`Prisma error message: ${error.message}`);
    }
    
    return defaultSettings;
  }
}

// Helper to save settings to database
async function saveSettingsToDB(section, data) {
  try {
    // Use a transaction to ensure all settings updates are atomic
    return await prisma.$transaction(async (tx) => {
      // Process each key in the data object
      for (const [key, value] of Object.entries(data)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        // Try to find existing setting
        const existingSetting = await tx.settings.findFirst({
          where: {
            section,
            key
          }
        });
        
        if (existingSetting) {
          // Update existing setting
          await tx.settings.update({
            where: { id: existingSetting.id },
            data: { 
              value: stringValue,
              updatedAt: new Date() 
            }
          });
        } else {
          // Create new setting
          await tx.settings.create({
            data: {
              section,
              key,
              value: stringValue
            }
          });
        }
      }
      
      return { success: true };
    });
  } catch (error) {
    console.error("Error saving settings to DB:", error);
    
    // Provide more detailed error logging
    if (error.code) {
      console.error(`Prisma error code: ${error.code}`);
      console.error(`Prisma error message: ${error.message}`);
    }
    
    throw error;
  }
}

// Validate data before saving
function validateSettingsData(section, data) {
  // Check if section exists
  if (!defaultSettings[section]) {
    return {
      valid: false,
      message: `Geçersiz ayar bölümü: ${section}`
    };
  }
  
  // Check if data is present
  if (!data || Object.keys(data).length === 0) {
    return {
      valid: false,
      message: "Ayar verisi boş olamaz"
    };
  }
  
  // Validate URL fields
  const urlFields = ['siteUrl', 'logoUrl', 'faviconUrl', 'twitter', 'facebook', 'instagram', 'linkedin', 'github', 'youtube', 'medium'];
  for (const field of urlFields) {
    if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
      try {
        new URL(data[field]);
      } catch (e) {
        return {
          valid: false,
          message: `Geçersiz URL: ${field}`
        };
      }
    }
  }
  
  // Validate email fields
  const emailFields = ['smtpUsername', 'senderEmail'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const field of emailFields) {
    if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '' && !emailRegex.test(data[field])) {
      return {
        valid: false,
        message: `Geçersiz e-posta adresi: ${field}`
      };
    }
  }
  
  // Validate numeric fields
  const numericFields = ['postsPerPage', 'smtpPort', 'maxCommentLength', 'minCommentLength'];
  for (const field of numericFields) {
    if (data[field] !== undefined && (isNaN(Number(data[field])) || Number(data[field]) < 0)) {
      return {
        valid: false,
        message: `Geçersiz sayısal değer: ${field}`
      };
    }
  }
  
  return { valid: true };
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
      if (!session) {
        return res.status(401).json({ 
          success: false, 
          message: "Bu işlem için giriş yapmanız gerekiyor." 
        });
      }
      
      if (session.user.role !== "ADMIN") {
        return res.status(403).json({ 
          success: false, 
          message: "Bu işlem için yönetici haklarına sahip olmanız gerekiyor." 
        });
      }

      const { section, data } = req.body;
      
      // Basic validation
      if (!section || !data) {
        return res.status(400).json({ 
          success: false, 
          message: "Bölüm ve veri alanları zorunludur." 
        });
      }
      
      // Advanced validation
      const validation = validateSettingsData(section, data);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message
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
      message: "Method not allowed. Only GET and POST methods are supported." 
    });
  } catch (error) {
    console.error("Settings API Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Ayar işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 