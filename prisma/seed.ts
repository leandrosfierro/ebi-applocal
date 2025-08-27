import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){
  const org = await prisma.organization.create({ data: { name: 'BS360', logoUrl: 'https://placehold.co/150x50/003366/FFFFFF?text=BS360' } })
  await prisma.campaign.create({ data: { orgId: org.id, name: 'EBI Demo Anónima', anonymous: true, startAt: new Date() } })
  console.log('Seed OK')
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
