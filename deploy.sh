cp ./prisma/schema.prod.prisma ./prisma/schema.prisma
vercel --prod
cp ./prisma/schema.dev.prisma ./prisma/schema.prisma