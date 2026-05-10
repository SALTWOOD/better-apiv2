import { Elysia } from 'elysia'
import { AnnouncementService } from '../services/announcement'

export const announcementRoutes = new Elysia({ prefix: '/apiv2' })
  .get('/announcements', async () => {
    try {
      const result = await AnnouncementService.getAnnouncements()
      return result
    } catch (error) {
      console.error('获取公告失败:', error)
      return []
    }
  })
