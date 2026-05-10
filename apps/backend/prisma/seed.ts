import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { prisma } from '../src/services/db'

/**
 * 初始化脚本 - 从参考数据加载初始数据到数据库
 */
async function seedDatabase() {
  try {
    console.log('🌱 开始数据库初始化...')

    // 加载公告数据
    const announcementPath = path.resolve(
      process.cwd(),
      '../../../apiv2-static-for-ref/apiv2/announcement.json'
    )
    
    if (fs.existsSync(announcementPath)) {
      console.log('📢 加载公告数据...')
      const announcementData = JSON.parse(fs.readFileSync(announcementPath, 'utf-8'))
      
      const announcements = Array.isArray(announcementData) ? announcementData : announcementData.content ?? []

      for (const announcement of announcements) {
        const details = announcement.details ?? announcement.detail ?? ''
        const buttons = Array.isArray(announcement.buttons)
          ? announcement.buttons
          : [announcement.btn1, announcement.btn2]
              .filter(Boolean)
              .map((button: any) => ({
                text: button.text,
                exec: button.exec ?? button.command ?? 'OpenWebSite',
                argument: button.argument ?? button.commandParameter ?? button.command_parameter ?? button.command_paramter ?? '',
              }))

        await prisma.announcement.upsert({
          where: { id: announcement.id },
          update: {},
          create: {
            id: announcement.id,
            title: announcement.title,
            detail: details,
            details,
            priority: announcement.priority ?? 0,
            level: announcement.level ?? 0,
            skip: announcement.skip ? JSON.stringify(announcement.skip) : null,
            buttons: JSON.stringify(buttons),
            date: new Date(String(announcement.date).replace(' ', 'T')),
          },
        })
      }
      console.log(`✅ 已加载 ${announcements.length} 条公告`)
    }

    // 加载更新数据
    const updatesPath = path.resolve(
      process.cwd(),
      '../../../apiv2-static-for-ref/apiv2/updates/cache.json'
    )
    
    if (fs.existsSync(updatesPath)) {
      console.log('📦 加载更新数据...')
      const updatesData = JSON.parse(fs.readFileSync(updatesPath, 'utf-8'))
      
      for (const asset of updatesData.assets) {
        const fileName = asset.file_name
        const channel = String(asset.version.channel ?? 'FRARM64').toUpperCase()
        const originalName = asset.file_name

        await prisma.updateFile.upsert({
          where: { fileName: asset.file_name },
          update: {},
          create: {
            fileName,
            channel,
            versionName: asset.version.name,
            versionCode: asset.version.code,
            originalName,
            fileSize: 0,
            sha256: asset.sha256,
            s3Key: `legacy/${fileName}`,
            s3Url: asset.downloads?.[0] ?? '',
            changelog: asset.changelog,
            uploadedByAdmin: 'seed',
          },
        })
      }
      console.log(`✅ 已加载 ${updatesData.assets.length} 条更新记录`)
    }

    console.log('🎉 数据库初始化完成！')
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
