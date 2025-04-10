-- Yorum tablosu
CREATE TABLE "Comment" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "authorId" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,

  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Beğeni tablosu
CREATE TABLE "BlogLike" (
  "userId" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlogLike_pkey" PRIMARY KEY ("userId", "blogId")
);

-- BlogPost tablosuna likeCount alanını ekle
ALTER TABLE "BlogPost" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

-- Indeksler
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_blogId_idx" ON "Comment"("blogId");
CREATE INDEX "BlogLike_userId_idx" ON "BlogLike"("userId");
CREATE INDEX "BlogLike_blogId_idx" ON "BlogLike"("blogId");

-- Yabancı anahtar bağlantıları
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogLike" ADD CONSTRAINT "BlogLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogLike" ADD CONSTRAINT "BlogLike_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE; 