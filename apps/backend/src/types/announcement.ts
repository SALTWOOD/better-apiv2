export interface AnnouncementButton {
  text: string
  exec: string
  argument: string
}

export interface AnnouncementSkip {
  min?: string | null
  max?: string | null
  notBefore?: string | null
  notAfter?: string | null
}

export interface Announcement {
  id: string
  title: string
  details: string
  priority: number
  level: number
  date: string
  skip?: AnnouncementSkip | null
  buttons: AnnouncementButton[]
}

export type AnnouncementResponse = Announcement[]

export interface AnnouncementInput {
  title: string
  details?: string
  detail?: string
  priority?: number
  level?: number
  date: Date
  skip?: AnnouncementSkip | null
  buttons?: AnnouncementButton[] | null
}
